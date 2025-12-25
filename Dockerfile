# Base image with Node.js
FROM node:18-bullseye-slim

# 1. Install System Dependencies (Chromium + FFmpeg)
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set Environment Variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 2. Set Working Directory
WORKDIR /app

# 3. Copy Everything (From Root)
COPY . .

# 4. Setup Renderer
WORKDIR /app/renderer
RUN npm ci

# 5. Build the Frontend (Web UI)
WORKDIR /app/renderer/web-ui
RUN npm install
RUN npm run build

# 6. Final Setup
WORKDIR /app/renderer
EXPOSE 3005
ENV PORT=3005

# 7. Start Command
CMD ["npm", "run", "start-server"]
