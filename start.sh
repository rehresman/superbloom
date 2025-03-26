#!/bin/bash
echo "Starting services..."

# Start Icecast as non-root user
echo "Starting Icecast server..."
su -s /bin/bash -c "icecast2 -c /etc/icecast2/icecast.xml -b" nobody &
sleep 5  # Give Icecast time to start

# Create an MP3 file from the WAV
echo "Converting audio..."
sox /app/test.wav /app/test.mp3

# Stream directly to Icecast using ffmpeg with the right syntax
echo "Starting streaming with ffmpeg..."
ffmpeg -re -stream_loop -1 -i /app/test.mp3 \
    -c copy -content_type audio/mpeg \
    -f mp3 -ice_name "Test Stream" \
    -ice_description "Test Stream" \
    -ice_genre "Test" \
    -ice_url "http://localhost" \
    -ice_public "0" \
    -password hackme \
    icecast://source:hackme@localhost:8000/audio.mp3 &
sleep 3

# Start the Node.js server
echo "Starting Node.js server..."
node server.js