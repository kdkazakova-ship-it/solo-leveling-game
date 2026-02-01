const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Загружаем переменные окружения
dotenv.config();

// Подключаем базу данных
connectDB();

const app = express();

// КРИТИЧНО: Настройка CORS для продакшена и разработки
const allowedOrigins = [
  'http://localhost:5173', // Локальная разработка
  'https://solo-leveling-game-seven.vercel.app', // Ваш Vercel фронтенд
  'https://solo-leveling-game-git-*.vercel.app', // Все ветки Vercel
  'https://solo-leveling-game-*.vercel.app', // Все поддомены Vercel
];

// Кастомный CORS middleware для детального логгирования
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const requestUrl = `${req.method} ${req.url}`;

  console.log(`🌐 Запрос: ${requestUrl}, Origin: ${origin || 'no origin'}`);

  if (origin) {
    // Проверяем разрешен ли origin
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed.includes('*')) {
        // Для паттернов с *: solo-leveling-game-*.vercel.app
        const pattern = allowed.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin);
      console.log(`✅ Разрешен CORS для: ${origin}`);
    } else {
      console.log(`❌ Заблокирован CORS для: ${origin}`);
    }
  }

  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, X-Requested-With',
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 часа

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    console.log(`🔄 Preflight запрос обработан для: ${origin}`);
    return res.status(200).end();
  }

  next();
});

// Также используем стандартный CORS как fallback
app.use(
  cors({
    origin: function (origin, callback) {
      // Разрешить запросы без origin (например, из curl, postman)
      if (!origin) {
        console.log('🔧 Запрос без origin, разрешаем');
        return callback(null, true);
      }

      // Проверяем все разрешенные origins
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(origin);
        }
        return allowed === origin;
      });

      if (isAllowed) {
        console.log(`✅ CORS разрешен для: ${origin}`);
        return callback(null, true);
      } else {
        console.log(`❌ CORS заблокирован для: ${origin}`);
        return callback(new Error(`Origin ${origin} не разрешен`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логгирование всех запросов
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Body:`, req.body || 'empty');
  next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));

// Health check (обязательно для Railway)
app.get('/health', (req, res) => {
  console.log('🏥 Health check запрос');
  res.json({
    status: 'OK',
    message: 'Сервер работает',
    service: 'Solo Leveling API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Тестовый endpoint для проверки CORS
app.get('/api/test-cors', (req, res) => {
  console.log('🧪 Тест CORS запрос');
  res.json({
    success: true,
    message: 'CORS работает корректно!',
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
  });
});

// Тестовый POST endpoint
app.post('/api/test-cors', (req, res) => {
  console.log('🧪 Тест POST CORS запрос:', req.body);
  res.json({
    success: true,
    message: 'POST CORS работает!',
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Корневой запрос');
  res.json({
    message: 'Solo Leveling Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (with Authorization header)',
        save: 'PUT /api/auth/save-progress (with Authorization header)',
      },
      test: {
        cors: 'GET /api/test-cors',
        post: 'POST /api/test-cors',
      },
    },
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins,
    },
    documentation: 'Добавьте документацию по API здесь',
  });
});

// Обработка 404
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Эндпоинт не найден',
    path: req.url,
    method: req.method,
    availableEndpoints: ['/health', '/api/auth/*', '/api/test-cors'],
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('🔥 Ошибка сервера:', err.message);
  console.error(err.stack);

  // CORS ошибки
  if (err.message.includes('CORS') || err.message.includes('Origin')) {
    return res.status(403).json({
      success: false,
      error: 'CORS: Доступ запрещен',
      message: err.message,
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin || 'не указан',
    });
  }

  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Внутренняя ошибка сервера'
        : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// Используем порт из переменных окружения или 3000 для Railway
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Разрешенные origins:`);
  allowedOrigins.forEach((origin) => console.log(`   • ${origin}`));
  console.log('='.repeat(60));
  console.log('Тестовые запросы:');
  console.log(`1. curl https://ваш-домен.railway.app/health`);
  console.log(`2. curl https://ваш-домен.railway.app/api/test-cors`);
  console.log(
    `3. curl -X POST https://ваш-домен.railway.app/api/test-cors -H "Content-Type: application/json" -d '{"test":"data"}'`,
  );
  console.log('='.repeat(60));
});
