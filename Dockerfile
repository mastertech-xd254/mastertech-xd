# Use Node.js LTS with Debian Buster
FROM node:lts-buster

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg imagemagick webp && \
    apt-get upgrade -y && \
    npm install -g pm2 && \
    rm -rf /var/lib/apt/lists/*

# Clone your bot repository
RUN git clone https://github.com/mastertech-xd254/mastertech-xd.git /root/mastertech

# Set working directory
WORKDIR /root/mastertech

# Install npm dependencies
COPY package.json .
RUN npm install --legacy-peer-deps

# Copy the rest of the project files
COPY . .

# Expose the desired port (change if needed)
EXPOSE 5000

# Start the bot using npm script or direct file
CMD ["node", "masterpeace.js"]
