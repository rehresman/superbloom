// Save this as server.js (fixed version)
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const osc = require("osc");

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Create OSC UDP Port
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  remoteAddress: "127.0.0.1",
  remotePort: 57120,
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Open the UDP port
udpPort.open();

// Message throttling system
const messageThrottles = {};

// Cleanup function to prevent memory leaks
function cleanupThrottles() {
  const now = Date.now();
  const maxAge = 1000; // 1 second

  Object.keys(messageThrottles).forEach((key) => {
    if (now - messageThrottles[key].lastSent > maxAge) {
      // Clear any pending timeout
      if (messageThrottles[key].timeoutId) {
        clearTimeout(messageThrottles[key].timeoutId);
      }

      // Remove this throttle entry
      delete messageThrottles[key];
    }
  });
}

// Schedule regular cleanup
setInterval(cleanupThrottles, 30000); // Every 30 seconds

// Function to throttle messages by address and first argument (controller number for CCs)
function throttleMessage(address, args, throttleTime = 20) {
  // For CC messages, create a unique key based on the CC number
  // Make sure args[0] exists before using it
  const key =
    address === "/midi/cc" && args.length > 0
      ? `${address}-${args[0]}`
      : address;

  console.log("messageThrottles.length= ", messageThrottles);

  const now = Date.now();

  // If this message type is currently throttled, store the latest values but don't send yet
  if (
    messageThrottles[key] &&
    now - messageThrottles[key].lastSent < throttleTime
  ) {
    messageThrottles[key].args = args;
    messageThrottles[key].pending = true;
    return false;
  }

  // If no throttle exists for this message type, create one
  if (!messageThrottles[key]) {
    messageThrottles[key] = {
      lastSent: now,
      args: args,
      pending: false,
      timeoutId: null,
    };
  } else {
    // Update the last sent time
    messageThrottles[key].lastSent = now;
    messageThrottles[key].pending = false;

    // Clear any existing timeout
    if (messageThrottles[key].timeoutId) {
      clearTimeout(messageThrottles[key].timeoutId);
      messageThrottles[key].timeoutId = null;
    }
  }

  // Set a timeout to send any pending messages after the throttle time
  messageThrottles[key].timeoutId = setTimeout(() => {
    if (messageThrottles[key] && messageThrottles[key].pending) {
      udpPort.send({
        address: address,
        args: messageThrottles[key].args,
      });
      messageThrottles[key].lastSent = Date.now();
      messageThrottles[key].pending = false;
      messageThrottles[key].timeoutId = null;
      // Avoid excessive logging
      // console.log(`Sent throttled message: ${address}`, messageThrottles[key].args);
    }
  }, throttleTime);

  return true;
}

// When the port is ready
udpPort.on("ready", () => {
  console.log(`OSC UDP Port ready:`);
  console.log(`- Listening on port: ${udpPort.options.localPort}`);
  console.log(
    `- Sending to SuperCollider at: ${udpPort.options.remoteAddress}:${udpPort.options.remotePort}`
  );
});

// Track OSC message volumes
let oscMessagesReceived = 0;
let lastOscLogTime = Date.now();
const OSC_LOG_INTERVAL = 5000; // Log stats every 5 seconds

// Handle incoming OSC messages from SuperCollider
udpPort.on("message", (oscMsg, timeTag, info) => {
  // Count messages instead of logging each one
  oscMessagesReceived++;

  // Log statistics periodically instead of every message
  const now = Date.now();
  if (now - lastOscLogTime > OSC_LOG_INTERVAL) {
    console.log(
      `Received ${oscMessagesReceived} OSC messages in the last ${
        OSC_LOG_INTERVAL / 1000
      } seconds`
    );
    lastOscLogTime = now;
    oscMessagesReceived = 0;
  }

  // Broadcast to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "osc",
          address: oscMsg.address,
          args: oscMsg.args,
        })
      );
    }
  });
});

// Limit the number of active WebSocket connections
const MAX_CONNECTIONS = 10;
let connectionCount = 0;

// Track message rates to detect potential flooding
const messageRates = {};
const MESSAGE_RATE_LIMIT = 200; // messages per second
const RATE_TRACKING_INTERVAL = 1000; // 1 second

// WebSocket connection handling
wss.on("connection", (ws, req) => {
  // Limit number of connections
  if (connectionCount >= MAX_CONNECTIONS) {
    console.log("Connection limit reached, rejecting new connection");
    ws.close(1013, "Maximum number of connections reached");
    return;
  }

  connectionCount++;
  const clientIp = req.socket.remoteAddress;
  console.log(
    `Web client connected from ${clientIp}. Total connections: ${connectionCount}`
  );

  // Initialize message rate tracking for this connection
  const connectionId =
    Date.now().toString() + Math.random().toString(36).substring(2, 15);
  messageRates[connectionId] = {
    count: 0,
    lastReset: Date.now(),
  };

  // Reset message count periodically
  const rateInterval = setInterval(() => {
    if (messageRates[connectionId]) {
      messageRates[connectionId].count = 0;
      messageRates[connectionId].lastReset = Date.now();
    }
  }, RATE_TRACKING_INTERVAL);

  // Send a confirmation message
  ws.send(
    JSON.stringify({
      type: "status",
      message: "Connected to OSC bridge",
    })
  );

  // Handle messages from the browser
  ws.on("message", (message) => {
    // Check message rate
    messageRates[connectionId].count++;
    if (messageRates[connectionId].count > MESSAGE_RATE_LIMIT) {
      console.warn(`Client ${clientIp} exceeding message rate limit`);
      return; // Skip processing this message
    }

    try {
      const data = JSON.parse(message);

      if (data.type === "osc" && data.address && Array.isArray(data.args)) {
        // Process the message
        const processedArgs = data.args.map((arg) => {
          if (
            arg &&
            typeof arg === "object" &&
            "type" in arg &&
            "value" in arg
          ) {
            return arg.value;
          }
          return arg;
        });

        // Different throttling for different message types
        let shouldSend = true;

        if (data.address === "/midi/cc") {
          // More aggressive throttling for CC messages (especially for continuous controls)
          shouldSend = throttleMessage(data.address, processedArgs, 25);
        } else if (
          data.address === "/midi/noteon" ||
          data.address === "/midi/noteoff"
        ) {
          // Don't throttle note messages - they need to be responsive
          shouldSend = true;
        } else {
          // Default throttling for other message types
          shouldSend = throttleMessage(data.address, processedArgs, 10);
        }

        if (shouldSend) {
          // Reduce logging volume to prevent memory bloat from console history
          if (Math.random() < 0.01) {
            // Log only 1% of messages
            console.log(
              "Sending OSC to SuperCollider:",
              data.address,
              processedArgs
            );
          }

          udpPort.send({
            address: data.address,
            args: processedArgs,
          });
        }
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
      // Send error message back to client
      try {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process message",
          })
        );
      } catch (sendError) {
        console.error("Error sending error message to client:", sendError);
      }
    }
  });

  ws.on("close", () => {
    connectionCount--;
    console.log(
      `Web client disconnected. Remaining connections: ${connectionCount}`
    );

    // Clean up rate limiting resources
    clearInterval(rateInterval);
    delete messageRates[connectionId];
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Handle OSC errors
udpPort.on("error", (error) => {
  console.error("OSC error:", error);
});

// Memory usage monitoring
const MEMORY_CHECK_INTERVAL = 5000; // Check memory every 5 seconds
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log("Memory usage:");
  console.log(`- RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`);
  console.log(
    `- Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
  );
  console.log(
    `- Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
  );
  console.log(
    `- External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`
  );

  // Force garbage collection if memory usage is high (if running with --expose-gc)
  if (global.gc && memoryUsage.heapUsed > 200 * 1024 * 1024) {
    // 200 MB threshold
    console.log("Forcing garbage collection");
    global.gc();
  }
}, MEMORY_CHECK_INTERVAL);

// Graceful shutdown handling
process.on("SIGINT", () => {
  console.log("Shutting down server...");

  // Clear all intervals
  for (let i = 0; i < 1000; i++) {
    clearInterval(i);
    clearTimeout(i);
  }

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });

  // Close UDP port
  udpPort.close();

  // Close HTTP server
  server.close(() => {
    console.log("Server shutdown complete");
    process.exit(0);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
