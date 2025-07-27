# WhaTap Mobile SDK Proxy Server

A proxy server for intercepting and logging data sent by WhaTap Mobile SDKs (Android/iOS). This tool is designed for development and testing purposes to monitor and debug SDK data transmission.

![WhaTap Proxy Server](https://img.shields.io/badge/WhaTap-Proxy%20Server-blue)
![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

- 📊 **Complete Request/Response Logging** - Capture all HTTP traffic from WhaTap SDKs
- 🔄 **Transparent Proxy** - Forward requests to the actual WhaTap server
- 📝 **Structured Logging** - Organized logs with Winston logger
- 🔍 **Request Tracking** - Unique request IDs for easy debugging
- 🌐 **Web UI** - Browse logs through web interface
- 🚀 **Real-time Monitoring** - Live request/response tracking
- 📱 **Multi-platform Support** - Works with both Android and iOS SDKs

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/whatap/whatap-mobile-proxy-server.git
cd whatap-mobile-proxy-server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the server
npm start
```

### Development Mode

```bash
# Run with auto-restart on file changes
npm run dev
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
TARGET_SERVER=https://rumote.whatap-mobile-agent.io

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Optional: Custom headers
CUSTOM_HEADERS={"X-Proxy-Version": "1.0"}
```

## 📱 SDK Configuration

### Android SDK Setup

```kotlin
// Kotlin
WhatapAgent.Builder.newBuilder()
    .setProjectKey("YOUR-PROJECT-KEY")
    .setServerUrl("http://YOUR-IP:8080")  // Proxy server URL
    .setSampling(1.0)
    .build(application)
```

```java
// Java
WhatapAgent.Builder.newBuilder()
    .setProjectKey("YOUR-PROJECT-KEY")
    .setServerUrl("http://YOUR-IP:8080")  // Proxy server URL
    .setSampling(1.0)
    .build(getApplication());
```

### iOS SDK Setup

```swift
// Swift
WhaTapAgent.shared.config.serverUrl = "http://YOUR-IP:8080"
WhaTapAgent.shared.config.projectKey = "YOUR-PROJECT-KEY"
WhaTapAgent.shared.start()
```

```objc
// Objective-C
[[WhaTapAgent shared] configWithServerUrl:@"http://YOUR-IP:8080"];
[[WhaTapAgent shared] configWithProjectKey:@"YOUR-PROJECT-KEY"];
[[WhaTapAgent shared] start];
```

### Network Configuration

#### For Physical Devices
Use your machine's IP address:
```bash
# Find your IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

#### For Android Emulator
```bash
# Use localhost with ADB reverse
adb reverse tcp:8080 tcp:8080
# Then use: http://localhost:8080
```

#### For iOS Simulator
```bash
# Use localhost directly
http://localhost:8080
```

## 📊 Monitoring & Logs

### Real-time Console Output
```bash
# View live logs in terminal
npm start
```

### Log Files
Daily rotating log files are saved in the `logs/` directory:
```
logs/
├── proxy-2025-07-26.log
├── proxy-2025-07-27.log
└── ...
```

### Web UI
Access the web interface for browsing logs:

- **Log Index**: http://localhost:8080/proxy-logs
- **Specific Log**: http://localhost:8080/proxy-logs/proxy-YYYY-MM-DD.log

### Log Format

```json
{
  "requestId": "req-1753538121415-abc123",
  "method": "POST",
  "path": "/log",
  "headers": {
    "content-type": "application/json",
    "user-agent": "whatap-android-agent/1.0.2"
  },
  "body": {
    "logs": [...],
    "meta": {
      "agent_version": "1.0.2",
      "device_name": "Samsung Galaxy S21",
      "project_access_key": "YOUR-PROJECT-KEY"
    }
  },
  "targetUrl": "https://rumote.whatap-mobile-agent.io/log",
  "statusCode": 200,
  "duration": "45ms",
  "timestamp": "2025-07-26T13:55:21.415Z"
}
```

## 🛠️ API Endpoints

### Proxy Endpoints
All requests to the proxy server are forwarded to the target WhaTap server:

- `POST /log` - User logs
- `POST /trace` - Activity/Screen traces
- `POST /metric` - Performance metrics
- `POST /crash` - Crash reports

### Utility Endpoints
- `GET /health` - Health check
- `GET /proxy-logs` - List log files
- `GET /proxy-logs/:filename` - View specific log file

## 🧪 Testing

### Basic Test
```bash
# Test the proxy server
curl -X GET http://localhost:8080/health

# Response
{"status": "ok", "timestamp": "2025-07-26T12:00:00.000Z"}
```

### Simulate SDK Request
```bash
curl -X POST http://localhost:8080/log \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [{"message": "Test log"}],
    "meta": {"project_access_key": "TEST-KEY"}
  }'
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

#### Permission Denied for Logs
```bash
# Fix permissions
chmod -R 755 logs/
```

#### Connection Refused
- Check firewall settings
- Ensure the server is running
- Verify the correct IP address

## 📈 Performance Considerations

- The proxy adds minimal latency (typically < 5ms)
- Log files are rotated daily to prevent disk space issues
- Request/response bodies are limited to prevent memory issues
- Async logging to minimize performance impact

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WhaTap APM for the monitoring platform
- Express.js for the web framework
- Winston for logging
- All contributors and testers

---

**Note**: This proxy server is intended for development and testing purposes only. Do not use in production environments.