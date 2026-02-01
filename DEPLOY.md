# Инструкция по деплою на GitHub Pages

## Настройка для GitHub Pages

### 1. Обновите Railway URL в коде

Откройте файл `frontend/src/api.js` и замените:
```javascript
'https://your-railway-app.railway.app/api'
```
на ваш реальный Railway URL, например:
```javascript
'https://solo-leveling-backend.railway.app/api'
```

### 2. Создайте файл `.env.production` (опционально)

Создайте файл `frontend/.env.production`:
```
VITE_API_URL=https://ваш-railway-url.railway.app/api
```

### 3. Соберите проект

```bash
npm run build
```

Это создаст папку `dist` с собранными файлами.

### 4. Настройте GitHub Pages

1. Перейдите в настройки вашего репозитория на GitHub
2. Settings → Pages
3. Source: выберите "Deploy from a branch"
4. Branch: выберите ветку (например, `main` или `gh-pages`)
5. Folder: выберите `/dist` или `/frontend/dist` (в зависимости от структуры)

### 5. Альтернативный способ через GitHub Actions

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.RAILWAY_API_URL }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 6. Проверка

После деплоя проверьте:
- Стили загружаются: https://kdkazakova-ship-it.github.io/solo-leveling-game/frontend/
- API работает: откройте консоль браузера (F12) и проверьте запросы к API

## Важные моменты

1. **Base URL**: Убедитесь, что в `vite.config.js` указан правильный `base: '/solo-leveling-game/frontend/'`
2. **API URL**: Обязательно обновите Railway URL в `frontend/src/api.js`
3. **CORS**: Убедитесь, что на Railway настроен CORS для домена GitHub Pages

## Настройка CORS на Railway

В вашем `backend/server.js` убедитесь, что CORS настроен для GitHub Pages:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://kdkazakova-ship-it.github.io'
  ],
  credentials: true
}));
```
