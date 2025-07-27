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

## 🛠️ API Endpoints & Data Structure

### Proxy Endpoints
All requests to the proxy server are forwarded to the target WhaTap server:

#### 1. `POST /log` - UserLogger Data (LogRecord Type)
**Description**: Handles user-generated logs and custom events

**Expected Data Structure**:
```json
{
  "resource_logs": [{
    "scope_logs": [{
      "log_records": [{
        "trace_id": null,
        "span_id": null,
        "severity_text": "INFO",
        "severity_number": 9,
        "created_at": 1753600823493,
        "body": "userLog",
        "is_user_log": true,
        "attributes": [
          {"key": "event_name", "value": "userLog"},
          {"key": "messages", "value": "User custom message"}
        ]
      }],
      "scope": {
        "name": "userlog",
        "attributes": [],
        "version": null
      }
    }]
  }],
  "meta": {
    "agent_version": "1.0.2",
    "device_name": "vivo V2041",
    "p_code": 12345,
    "app_version": "1.0",
    "user_id": "f1cebb51-b281-4a00-96ff-34600d0f10eb",
    "project_access_key": "DEMO-PROJECT-KEY-001",
    "os_version": "13",
    "session_id": "989a57fb-059a-4f75-a3c9-3ba8ec9e8966",
    "server_url": "http://localhost:8080/trace"
  }
}
```

**Trigger Events**:
- `UserLogger.print("message")` calls
- `UserLogger.print(mapData)` calls  
- Crash detection
- Custom event logging

#### 2. `POST /trace` - Activity/Fragment Traces (Span Type)
**Description**: Handles Activity/Fragment lifecycle and network request traces

**Expected Data Structure**:
```json
{
  "resource_spans": [{
    "scope_spans": [{
      "spans": [{
        "name": "Created",
        "trace_id": "26bab000e7bc4619bffcea6cce8b2b9c",
        "span_id": "4efc59774dc44046",
        "start_time_unix_milli": 1753600823493,
        "end_time_unix_milli": 1753600823496,
        "attributes": [
          {"key": "activity_name", "value": "NetworkTestActivity"},
          {"key": "screen_name", "value": "NetworkTestActivity"},
          {"key": "start_type", "value": "normal|cold|warm|hot"}
        ],
        "events": [
          {"name": "activityPreCreated", "timestamp_unix_milli": 1753600823493},
          {"name": "activityCreated", "timestamp_unix_milli": 1753600823494}
        ],
        "metrics": {
          "cpu": [26, 0, 0, 0, 0, 0],
          "memory_dalvic": [1165, 1165, 1165, 1165, 1165, 1165],
          "memory_native": [3723, 3723, 3723, 3723, 3723, 3723],
          "memory_other": [30587, 30587, 30587, 30587, 30587, 30587],
          "battery_power_save": 0
        }
      }]
    }]
  }]
}
```

**Trigger Events**:
- Activity onCreate(), onStart(), onResume()
- Fragment lifecycle events
- Network requests (OkHttp, Retrofit, Volley, HttpURLConnection)
- ANR detection (5+ second UI blocking)

#### 3. Network Library Specific Patterns

**Volley Requests**:
```json
{
  "name": "GET",
  "attributes": [
    {"key": "network_library", "value": "Volley"},
    {"key": "full_url", "value": "https://api.example.com/data"},
    {"key": "status_code", "value": "200"}
  ]
}
```

**OkHttp Interceptor**:
```json
{
  "name": "POST", 
  "attributes": [
    {"key": "http_method", "value": "POST"},
    {"key": "screen_name", "value": "NetworkTestActivity"}
  ]
}
```

**OkHttp EventListener**:
```json
{
  "name": "HTTP GET jsonplaceholder.typicode.com",
  "attributes": [
    {"key": "http.status_code", "value": "200"}
  ]
}
```

**HttpURLConnection**:
```json
{
  "name": "GET",
  "attributes": [
    {"key": "network_library", "value": "HttpUrlConnection"}
  ]
}
```

### Utility Endpoints
- `GET /health` - Health check
- `GET /proxy-logs` - List log files
- `GET /proxy-logs/:filename` - View specific log file

## 🧪 Testing Guide

### Basic Health Check
```bash
# Test the proxy server
curl -X GET http://localhost:8080/health

# Expected Response
{"status": "ok", "timestamp": "2025-07-27T12:00:00.000Z"}
```

### 1. Testing UserLogger Data (POST /log)

#### Simple Message Test
```bash
curl -X POST http://localhost:8080/log \
  -H "Content-Type: application/json" \
  -H "User-Agent: whatap-android-agent/1.0.2" \
  -d '{
    "resource_logs": [{
      "scope_logs": [{
        "log_records": [{
          "body": "userLog",
          "is_user_log": true,
          "created_at": '$(date +%s%3N)',
          "attributes": [
            {"key": "event_name", "value": "userLog"},
            {"key": "messages", "value": "Test message from curl"}
          ]
        }],
        "scope": {"name": "userlog"}
      }]
    }],
    "meta": {
      "agent_version": "1.0.2",
      "device_name": "Test Device",
      "project_access_key": "TEST-KEY",
      "session_id": "test-session-123"
    }
  }'
```

#### Custom Data Test
```bash
curl -X POST http://localhost:8080/log \
  -H "Content-Type: application/json" \
  -d '{
    "resource_logs": [{
      "scope_logs": [{
        "log_records": [{
          "body": "userLog", 
          "attributes": [
            {"key": "event_name", "value": "userLog"},
            {"key": "test_type", "value": "curl_test"},
            {"key": "user_id", "value": "test_user_001"},
            {"key": "timestamp", "value": "'$(date +%s%3N)'"}
          ]
        }],
        "scope": {"name": "userlog"}
      }]
    }],
    "meta": {
      "project_access_key": "TEST-KEY",
      "device_name": "curl-test-device"
    }
  }'
```

### 2. Testing Activity Trace Data (POST /trace)

#### Activity Lifecycle Test
```bash
curl -X POST http://localhost:8080/trace \
  -H "Content-Type: application/json" \
  -d '{
    "resource_spans": [{
      "scope_spans": [{
        "spans": [{
          "name": "Created",
          "trace_id": "26bab000e7bc4619bffcea6cce8b2b9c",
          "span_id": "4efc59774dc44046", 
          "start_time_unix_milli": '$(date +%s%3N)',
          "end_time_unix_milli": '$(($(date +%s%3N) + 100))',
          "attributes": [
            {"key": "activity_name", "value": "TestActivity"},
            {"key": "start_type", "value": "normal"}
          ],
          "events": [
            {"name": "activityCreated", "timestamp_unix_milli": '$(date +%s%3N)'}
          ]
        }]
      }]
    }]
  }'
```

#### Network Request Test
```bash
curl -X POST http://localhost:8080/trace \
  -H "Content-Type: application/json" \
  -d '{
    "resource_spans": [{
      "scope_spans": [{
        "spans": [{
          "name": "GET",
          "trace_id": "abc123def456", 
          "span_id": "xyz789",
          "attributes": [
            {"key": "network_library", "value": "OkHttp"},
            {"key": "http_method", "value": "GET"},
            {"key": "url", "value": "https://api.example.com/test"}
          ]
        }]
      }]
    }]
  }'
```

### 3. Real Device Testing with Sample Apps

#### Prerequisites
```bash
# 1. Start proxy server
npm start

# 2. Setup ADB reverse (for Android emulator/device)
adb reverse tcp:8080 tcp:8080

# 3. Install sample app
cd ../
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

#### Test Scenarios

**Scenario 1: Basic UserLogger Test**
1. Launch CalmMind app
2. Navigate to "🧪 Network Test Suite"
3. Click "📋 Test Span vs LogRecord Types"
4. Check proxy logs for `/log` requests

**Scenario 2: Network Library Testing**
1. Click "🌐 Test Library Differences" 
2. Verify different network library patterns in logs
3. Look for `network_library` attributes in requests

**Scenario 3: Performance Metrics**
1. Click "🔍 Test Metrics Collection (10s cycle)"
2. Wait 10-15 seconds
3. Check for metrics arrays with 6 elements each

**Scenario 4: ANR Testing**
1. Click "Trigger ANR (5s sleep)" button
2. Wait for UI to unfreeze
3. Check logs for ANR span data

### 4. Log Analysis

#### Real-time Monitoring
```bash
# Monitor live logs
tail -f logs/proxy-$(date +%Y-%m-%d).log | grep -E "(POST|GET)"

# Filter UserLogger data
tail -f logs/proxy-$(date +%Y-%m-%d).log | grep -A 20 '"path": "/log"'

# Filter Activity traces  
tail -f logs/proxy-$(date +%Y-%m-%d).log | grep -A 20 '"path": "/trace"'
```

#### Automated Analysis
```bash
# Use the provided analysis script
cd ../
./analyze-data-types.sh
```

### 5. Expected Response Patterns

#### Successful Request
```json
{
  "requestId": "req-1753600823493-abc123",
  "statusCode": 200,
  "duration": "45ms", 
  "message": "📤 Outgoing Response"
}
```

#### Failed Request (404)
```json
{
  "requestId": "req-1753600823493-def456", 
  "statusCode": 404,
  "data": "404 page not found",
  "message": "📤 Outgoing Response"
}
```

### 6. Validation Checklist

For successful testing, verify:

- ✅ **UserLogger Data**: `/log` endpoint receives requests with `name: "userlog"`
- ✅ **Activity Traces**: `/trace` endpoint receives spans with `name: "Created"`  
- ✅ **Network Requests**: Library-specific attributes in span data
- ✅ **Metrics Arrays**: CPU and memory arrays have exactly 6 elements
- ✅ **Session Tracking**: Consistent session_id across requests
- ✅ **Device Info**: Proper device_name and os_version in meta

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