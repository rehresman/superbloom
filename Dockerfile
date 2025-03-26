FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    icecast2 \
    ffmpeg \
    sox \
    libsox-fmt-mp3 \
    curl \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /app

# Copy files
COPY package.json server.js ./
COPY public ./public
COPY icecast.xml /etc/icecast2/icecast.xml

# Copy the startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Install Node.js dependencies
RUN npm install

# Create a simple audio file
RUN sox -n -r 44100 -c 2 /app/test.wav synth 60 sine 440 sine 880

# Expose ports
EXPOSE 3000 8000

# Set entry point
CMD ["/app/start.sh"]