const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const path = require('path');

// Загружаем переменные окружения
dotenv.config();

// Подключаем базу данных
connectDB();

const app = express();

// Настройка CORS для фронтенда на порту 5173
app.use(
  cors({
    origin: 'http://localhost:5173', // Точный адрес вашего фронтенда
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Middleware
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер работает' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API is running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      docs: 'Add your API documentation here',
    },
  });
});

// Только для продакшена: обслуживание фронтенда
// УДАЛИТЬ или закомментировать эти строки, так как фронтенд на отдельном порту
// app.use(express.static('../frontend'));
// app.get('*', (req, res) => {
//   res.sendFile('index.html', { root: '../frontend' });
// });

// Принудительно используем порт 5001 (порт 5000 занят)
const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 API доступен по: http://localhost:${PORT}`);
  console.log(`🔗 Фронтенд работает на: http://localhost:5173`);
  console.log(`📡 Проверьте здоровье сервера: http://localhost:${PORT}/health`);
});
