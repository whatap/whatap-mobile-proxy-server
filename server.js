const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const winston = require('winston');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const TARGET_SERVER = process.env.TARGET_SERVER || 'https://demo.whatap.io';

// 로그 디렉토리 생성
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Winston 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // 파일 저장
    new winston.transports.File({ 
      filename: path.join(logDir, `proxy-${new Date().toISOString().split('T')[0]}.log`)
    })
  ]
});

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));

// HTTP 요청 로깅 (개발 환경)
app.use(morgan('dev'));

// 요청 ID 생성 미들웨어
app.use((req, res, next) => {
  req.requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  next();
});

// 모든 요청을 프록시 처리
app.all('*', async (req, res) => {
  const startTime = Date.now();
  const targetUrl = `${TARGET_SERVER}${req.path}`;
  
  // 요청 정보 로깅
  logger.info('📥 Incoming Request', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    headers: req.headers,
    body: req.body,
    targetUrl: targetUrl
  });

  try {
    // 원본 서버로 요청 전달
    const axiosConfig = {
      method: req.method,
      url: targetUrl,
      params: req.query,
      headers: {
        ...req.headers,
        host: new URL(TARGET_SERVER).host,
        'x-forwarded-for': req.ip,
        'x-proxy-request-id': req.requestId
      },
      data: req.body,
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: () => true // 모든 상태 코드 허용
    };

    // Content-Type에 따른 데이터 처리
    if (req.headers['content-type']?.includes('application/octet-stream')) {
      axiosConfig.data = req.body;
      axiosConfig.responseType = 'arraybuffer';
    }

    const response = await axios(axiosConfig);
    const duration = Date.now() - startTime;

    // 응답 정보 로깅
    logger.info('📤 Outgoing Response', {
      requestId: req.requestId,
      statusCode: response.status,
      duration: `${duration}ms`,
      headers: response.headers,
      dataSize: response.data ? JSON.stringify(response.data).length : 0,
      data: response.data
    });

    // 응답 전달
    res.status(response.status);
    
    // 응답 헤더 복사
    Object.entries(response.headers).forEach(([key, value]) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.send(response.data);

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('❌ Proxy Error', {
      requestId: req.requestId,
      duration: `${duration}ms`,
      error: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data
    });

    res.status(500).json({
      error: 'Proxy Error',
      message: error.message,
      requestId: req.requestId,
      targetUrl: targetUrl
    });
  }
});

// 로그 조회 엔드포인트
app.get('/proxy-logs', (req, res) => {
  const logFiles = fs.readdirSync(logDir)
    .filter(file => file.endsWith('.log'))
    .sort((a, b) => b.localeCompare(a));

  res.json({
    logs: logFiles,
    currentLog: `proxy-${new Date().toISOString().split('T')[0]}.log`
  });
});

// 특정 로그 파일 조회
app.get('/proxy-logs/:filename', (req, res) => {
  const filePath = path.join(logDir, req.params.filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Log file not found' });
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(line => line);
  
  // 최근 100개 로그만 반환
  const recentLogs = lines.slice(-100).map(line => {
    try {
      return JSON.parse(line);
    } catch (e) {
      return { raw: line };
    }
  });

  res.json({
    filename: req.params.filename,
    totalLines: lines.length,
    logs: recentLogs
  });
});

// 서버 시작
app.listen(PORT, () => {
  logger.info(`🚀 WhaTap Proxy Server started on port ${PORT}`);
  logger.info(`🎯 Proxying requests to: ${TARGET_SERVER}`);
  logger.info(`📁 Logs directory: ${logDir}`);
  logger.info(`📊 View logs at: http://localhost:${PORT}/proxy-logs`);
});

// 프로세스 종료 처리
process.on('SIGINT', () => {
  logger.info('🛑 Proxy server shutting down...');
  process.exit(0);
});