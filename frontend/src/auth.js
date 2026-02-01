// frontend/src/auth.js
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;

    this.init();
  }

  async init() {
    // Проверяем токен при загрузке
    const token = localStorage.getItem('token');

    if (token && window.api) {
      const result = await window.api.getCurrentUser();

      if (result.success) {
        this.currentUser = result.user;
        this.isAuthenticated = true;
        this.onLoginSuccess(result.user);
      } else {
        this.logout();
      }
    } else {
      this.showLoginModal();
    }
  }

  async login(email, password) {
    if (!window.api) {
      console.error('❌ window.api не найден!');
      return { success: false, error: 'API не загружен' };
    }

    console.log('🔄 Выполняю API запрос на вход...');
    const result = await window.api.login(email, password);
    console.log('📥 Ответ API:', result);

    if (result.success) {
      this.currentUser = result.user;
      this.isAuthenticated = true;
      this.onLoginSuccess(result.user);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  }

  async register(username, email, password, confirmPassword) {
    if (password !== confirmPassword) {
      return { success: false, error: 'Пароли не совпадают' };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Пароль должен быть не менее 6 символов',
      };
    }

    if (!window.api) {
      console.error('❌ window.api не найден!');
      return { success: false, error: 'API не загружен' };
    }

    console.log('🔄 Выполняю API запрос на регистрацию...');
    const result = await window.api.register(username, email, password);
    console.log('📥 Ответ API:', result);

    if (result.success) {
      this.currentUser = result.user;
      this.isAuthenticated = true;
      this.onLoginSuccess(result.user);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  }

  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    window.api.removeToken();
    localStorage.removeItem('soloLevelingGameState');

    this.onLogout();
    this.showLoginModal();

    if (window.showNotification) {
      window.showNotification('👋 До свидания!', 'Вы вышли из системы', 'info');
    }
  }

  onLoginSuccess(user) {
    // Скрываем модальное окно
    document.getElementById('login-modal').style.display = 'none';

    // Показываем информацию пользователя
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('user-id-display').textContent = user.username;

    // Синхронизируем состояние игры
    if (user.gameState && window.gameState) {
      Object.assign(window.gameState, user.gameState);
      if (window.updateStats) window.updateStats();
      if (window.generateDailyQuests) window.generateDailyQuests();
      if (window.updateCoinsDisplay) window.updateCoinsDisplay();
    } else if (user.gameState) {
      // Если gameState еще не определен, сохраняем в localStorage
      localStorage.setItem('soloLevelingGameState', JSON.stringify(user.gameState));
    }

    // Добавляем событие
    if (window.addEvent) window.addEvent(`🔑 Вход выполнен: ${user.username}`, 'success');
    if (window.showNotification) {
      window.showNotification(
        '✅ Вход выполнен',
        `Добро пожаловать, ${user.username}!`,
        'success',
      );
    }
  }

  onLogout() {
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('login-modal').style.display = 'flex';
  }

  showLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
  }
}

// Создаем глобальный экземпляр AuthManager
const authManager = new AuthManager();
window.authManager = authManager;
