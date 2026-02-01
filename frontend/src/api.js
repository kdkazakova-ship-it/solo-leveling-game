// frontend/src/api.js
// URL бекенда - используем переменную окружения или дефолтное значение
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://your-railway-app.railway.app/api'  // Замените на ваш Railway URL
    : 'http://localhost:5001/api');

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async register(username, email, password) {
    try {
      console.log('📤 Отправка запроса регистрации на:', `${API_URL}/auth/register`);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log('📥 Статус ответа:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ Ошибка HTTP:', response.status);
        const errorData = await response.json().catch(() => ({ error: 'Не удалось прочитать ответ' }));
        return { success: false, error: errorData.error || `Ошибка сервера: ${response.status}` };
      }

      const data = await response.json();
      console.log('📦 Данные ответа:', data);

      if (data.success) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      return { success: false, error: `Ошибка сети: ${error.message}` };
    }
  }

  async login(email, password) {
    try {
      console.log('📤 Отправка запроса входа на:', `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📥 Статус ответа:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ Ошибка HTTP:', response.status);
        const errorData = await response.json().catch(() => ({ error: 'Не удалось прочитать ответ' }));
        return { success: false, error: errorData.error || `Ошибка сервера: ${response.status}` };
      }

      const data = await response.json();
      console.log('📦 Данные ответа:', data);

      if (data.success) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      return { success: false, error: `Ошибка сети: ${error.message}` };
    }
  }

  async getCurrentUser() {
    if (!this.token) {
      return { success: false, error: 'Нет токена' };
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return { success: false, error: 'Ошибка сети' };
    }
  }

  async saveGameProgress(gameState) {
    if (!this.token) {
      return { success: false, error: 'Нет токена' };
    }

    try {
      const response = await fetch(`${API_URL}/auth/save-progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ gameState }),
      });

      return await response.json();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      return { success: false, error: 'Ошибка сети' };
    }
  }
}

// Создаем глобальный экземпляр API
const api = new ApiService();
window.api = api;
