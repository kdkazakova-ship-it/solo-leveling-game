const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Проверяем существующего пользователя
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Пользователь с таким email или именем уже существует',
      });
    }

    // Создаем нового пользователя
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Создаем JWT токен
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameState: user.gameState,
      },
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ищем пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Создаем JWT токен
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Обновляем время последнего входа
    user.gameState.lastPlayed = Date.now();
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameState: user.gameState,
      },
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение данных пользователя
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameState: user.gameState,
      },
    });
  } catch (error) {
    console.error('Ошибка получения данных:', error);
    res.status(401).json({ error: 'Неверный токен' });
  }
});

// Сохранение прогресса игры
router.put('/save-progress', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { gameState } = req.body;

    if (!gameState) {
      return res.status(400).json({ error: 'Нет данных для сохранения' });
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        gameState: { ...gameState, lastPlayed: Date.now() },
        updatedAt: Date.now(),
      },
      { new: true },
    ).select('-password');

    res.json({
      success: true,
      message: 'Прогресс сохранен',
      gameState: user.gameState,
    });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
