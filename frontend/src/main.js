// Подключаем API
import './api.js';
// Подключаем Auth Manager
import './auth.js';




// Game state
const gameState = {
    level: 1,
    attributes: {
        strength: 1,
        agility: 1,
        perception: 1,
        stamina: 1,
        intelligence: 1
    },
    totalPoints: 5,
    pointsToNextLevel: 10,
    currentPoints: 0,
    dailyQuests: [],
    weeklyQuest: null,
    questResetTime: null,
    weeklyResetTime: null,
    status: null,
    profession: null,
    replaceCount: 3,
    maxAttributeValue: 500,
    mandatoryQuestIndex: -1,
    consecutiveDays: 0,
    disciplineLevel: 0,
    weeklyStats: {
        strength: { points: 0, actions: [] },
        agility: { points: 0, actions: [] },
        perception: { points: 0, actions: [] },
        stamina: { points: 0, actions: [] },
        intelligence: { points: 0, actions: [] }
    },
    currentQuestIndex: -1,
    level150Achieved: false,
    coins: 0,
    chestsBought: [],
    maxReplaceCount: 3,
    maxDailyQuests: 6,
    noMandatoryPenalty: false,
    expMultiplier: 1,
    tempBonuses: [],
    events: [],
    theme: 'dark',
    customQuests: [],
    userId: null, // NEW: ID пользователя
    userCode: null // NEW: Кодовое слово пользователя
};

// Экспортируем gameState в window для глобального доступа
window.gameState = gameState;

// Обновляем функцию сохранения игры
gameState.saveGame = async function() {
  if (window.api && window.api.token) {
    const result = await window.api.saveGameProgress(gameState);
    if (result.success) {
      console.log('✅ Прогресс сохранен в облако');
    } else {
      console.warn('⚠️ Не удалось сохранить в облако, сохраняю локально');
      localStorage.setItem('soloLevelingGameState', JSON.stringify(gameState));
    }
  } else {
    localStorage.setItem('soloLevelingGameState', JSON.stringify(gameState));
  }
};

// Автосохранение каждые 30 секунд
setInterval(() => {
  if (gameState) {
    gameState.saveGame();
  }
}, 30000);

// Weekly quests database
const weeklyQuests = [
    { title: "Проведи целый день без телефона и интернета", desc: "Отключи все цифровые устройства на 24 часа" },
    { title: "Откажись от сахара на 3 дня", desc: "Не употребляй сахар в любом виде в течение 3 дней" },
    { title: "Прочитай книгу", desc: "Прочитай книгу объемом не менее 200 страниц" },
    { title: "Принимай холодный душ каждое утро 5 дней подряд", desc: "Начинай каждое утро с холодного душа" },
    { title: "5 дней подряд просыпайся в 6 утра", desc: "Вставай в 6 утра независимо от дня недели" },
    { title: "Выполни утреннюю пробежку на 7 км", desc: "Пробеги 7 км за одну тренировку" },
    { title: "Выучи новый навык за 7 дней", desc: "Освой базовый уровень нового навыка за неделю" }
];

// Database of quests (20 per attribute)
const questsDatabase = {
    strength: [
        { title: "100 отжиманий", desc: "Выполните {count} отжиманий за один подход", points: 3, base: 100 },
        { title: "50 приседаний", desc: "Выполните {count} приседаний без перерыва", points: 2, base: 50 },
        { title: "20 подтягиваний", desc: "Выполните {count} подтягиваний (можно с перерывами)", points: 3, base: 20 },
        { title: "3 минуты планки", desc: "Удерживайте положение планки {count} минут", points: 2, base: 3 },
        { title: "50 выпадов", desc: "Выполните {count} выпадов (по {half} на каждую ногу)", points: 2, base: 50 },
        { title: "30 отжиманий на стуле", desc: "Выполните {count} отжиманий с использованием стула", points: 2, base: 30 },
        { title: "100 скручиваний", desc: "Выполните {count} скручиваний на пресс", points: 3, base: 100 },
        { title: "40 приседаний с прыжком", desc: "Выполните {count} приседаний с выпрыгиванием", points: 3, base: 40 },
        { title: "5 минут упражнений с эспандером", desc: "Тренируйте руки с эспандером {count} минут", points: 2, base: 5 },
        { title: "30 подъемов ног", desc: "Выполните {count} подъемов ног лежа на спине", points: 2, base: 30 },
        { title: "20 отжиманий с хлопком", desc: "Выполните {count} взрывных отжиманий с хлопком", points: 3, base: 20 },
        { title: "40 подъемов на носки", desc: "Выполните {count} подъемов на носки для икр", points: 1, base: 40 },
        { title: "25 бёрпи", desc: "Выполните {count} бёрпи (можно с перерывами)", points: 3, base: 25 },
        { title: "15 подтягиваний широким хватом", desc: "Выполните {count} подтягиваний широким хватом", points: 3, base: 15 },
        { title: "60 секунд стульчик у стены", desc: "Удерживайте позицию 'стульчик' у стены {count} секунд", points: 2, base: 60 },
        { title: "40 скручиваний с поворотом", desc: "Выполните {count} скручиваний с поворотом корпуса", points: 2, base: 40 },
        { title: "30 отжиманий узким хватом", desc: "Выполните {count} отжиманий с узкой постановкой рук", points: 2, base: 30 },
        { title: "50 подъемов корпуса", desc: "Выполните {count} подъемов корпуса для пресса", points: 2, base: 50 },
        { title: "20 отжиманий с ногами на возвышении", desc: "Выполните {count} отжиманий с ногами на стуле", points: 3, base: 20 },
        { title: "100 подъемов гантелей", desc: "Выполните {count} подъемов гантелей (любое упражнение)", points: 3, base: 100 }
    ],
    agility: [
        { title: "1000 прыжков на скакалке", desc: "Выполните {count} прыжков на скакалке", points: 3, base: 1000 },
        { title: "15 минут танцев", desc: "Танцуйте под любимую музыку {count} минут", points: 2, base: 15 },
        { title: "20 минут йоги", desc: "Практикуйте йогу {count} минут", points: 2, base: 20 },
        { title: "30 боксерских ударов", desc: "Выполните {count} боксерских комбинаций в воздухе", points: 2, base: 30 },
        { title: "10 минут прыжков джек", desc: "Выполняйте прыжки джек {count} минут", points: 3, base: 10 },
        { title: "5 минут прыжков на одной ноге", desc: "Прыгайте на одной ноге {count} минут (по {half} на каждую)", points: 2, base: 5 },
        { title: "15 минут зумбы", desc: "Занимайтесь зумбой или активными танцами {count} минут", points: 2, base: 15 },
        { title: "30 выпадов с прыжком", desc: "Выполните {count} выпадов с прыжком и сменой ног", points: 3, base: 30 },
        { title: "40 боковых прыжков", desc: "Выполните {count} прыжков в стороны через линию", points: 2, base: 40 },
        { title: "20 минут упражнений на растяжку", desc: "Выполняйте упражнения на растяжку {count} минут", points: 2, base: 20 },
        { title: "50 прыжков через скамью", desc: "Прыгайте через небольшую преграду {count} раз", points: 3, base: 50 },
        { title: "10 минут бега на месте", desc: "Бегайте на месте в высоком темпе {count} минут", points: 2, base: 10 },
        { title: "30 скручиваний корпуса", desc: "Выполните {count} быстрых скручиваний корпуса стоя", points: 2, base: 30 },
        { title: "15 минут упражнений с резиновой лентой", desc: "Тренируйтесь с резиновой лентой {count} минут", points: 2, base: 15 },
        { title: "40 приставных шагов", desc: "Выполните {count} приставных шагов в каждую сторону", points: 2, base: 40 },
        { title: "20 прыжков в длину", desc: "Выполните {count} прыжков в длину с места", points: 2, base: 20 },
        { title: "10 минут упражнений на координацию", desc: "Выполняйте упражнения на координацию {count} минут", points: 2, base: 10 },
        { title: "30 махов ногами", desc: "Выполните {count} махов ногами вперед-назад и в стороны", points: 2, base: 30 },
        { title: "15 минут тенниса с стеной", desc: "Играйте в теннис со стеной {count} минут", points: 3, base: 15 },
        { title: "50 прыжков с поворотом", desc: "Выполните {count} прыжков с поворотом на 180 градусов", points: 3, base: 50 }
    ],
    perception: [
        { title: "15 минут медитации", desc: "Медитируйте {count} минут, концентрируясь на дыхании", points: 2, base: 15 },
        { title: "10 минут осознанного наблюдения", desc: "Наблюдайте за природой или окружением {count} минут", points: 2, base: 10 },
        { title: "20 минут без гаджетов", desc: "Проведите {count} минут без телефона и компьютера", points: 2, base: 20 },
        { title: "30 минут прослушивания классики", desc: "Внимательно слушайте классическую музыку {count} минут", points: 3, base: 30 },
        { title: "Описать 10 предметов", desc: "Выберите {count} предметов и подробно опишите каждый", points: 3, base: 10 },
        { title: "10 минут слепой ходьбы", desc: "Пройдитесь по дому с закрытыми глазами {count} минут", points: 3, base: 10 },
        { title: "20 минут рисования", desc: "Рисуйте что-либо, обращая внимание на детали, {count} минут", points: 2, base: 20 },
        { title: "15 минут ароматерапии", desc: "Исследуйте разные ароматы с закрытыми глазами {count} минут", points: 2, base: 15 },
        { title: "30 минут чтения вслух", desc: "Читайте книку вслух, обращая внимание на интонацию, {count} минут", points: 2, base: 30 },
        { title: "Просмотр фильма без звука", desc: "Посмотрите {count} минут фильма без звука, следите за визуалом", points: 2, base: 20 },
        { title: "10 минут дыхательных упражнений", desc: "Практикуйте глубокое дыхание {count} минут", points: 2, base: 10 },
        { title: "20 минут пазлов", desc: "Соберите пазл или решите головоломку {count} минут", points: 2, base: 20 },
        { title: "15 минут наблюдения за животными", desc: "Наблюдайте за домашними животными или птицами {count} минут", points: 2, base: 15 },
        { title: "30 минут без фонового шума", desc: "Проведите {count} минут в полной тишине", points: 3, base: 30 },
        { title: "10 минут тактильных ощущений", desc: "Исследуйте разные текстуры с закрытыми глазами {count} минут", points: 2, base: 10 },
        { title: "20 минут созерцания искусства", desc: "Рассматривайте произведения искусства онлайн {count} минут", points: 2, base: 20 },
        { title: "15 минут ведения дневника", desc: "Опишите свои ощущения и мысли за день {count} минут", points: 2, base: 15 },
        { title: "10 минут концентрации на пламени", desc: "Смотрите на пламя свечи {count} минут", points: 2, base: 10 },
        { title: "20 минут без многозадачности", desc: "Выполняйте только одно дело {count} минут", points: 2, base: 20 },
        { title: "30 минут на природе", desc: "Проведите {count} минут на природе, обращая внимание на детали", points: 3, base: 30 }
    ],
    stamina: [
        { title: "20-минутная пробежка", desc: "Пробегите в легком темпе {count} минут без остановки", points: 3, base: 20 },
        { title: "30 минут велосипеда", desc: "Прокатитесь на велосипеде {count} минут", points: 3, base: 30 },
        { title: "40 минут быстрой ходьбы", desc: "Идите быстрым шагом {count} минут", points: 3, base: 40 },
        { title: "15 минут плавания", desc: "Плавайте в бассейне или открытой воде {count} минут", points: 3, base: 15 },
        { title: "60 минут работы в саду", desc: "Поработайте в саду или на даче {count} минут", points: 3, base: 60 },
        { title: "30 минут активной уборки", desc: "Выполняйте активную уборку дома {count} минут", points: 2, base: 30 },
        { title: "20 минут степ-аэробики", desc: "Занимайтесь степ-аэробикой {count} минут", points: 3, base: 20 },
        { title: "45 минут пешей прогулки", desc: "Гуляйте в среднем темпе {count} минут", points: 2, base: 45 },
        { title: "30 минут игры с детьми", desc: "Активно играйте с детьми {count} минут", points: 2, base: 30 },
        { title: "20 минут ходьбы по лестнице", desc: "Ходите вверх-вниз по лестнице {count} минут", points: 3, base: 20 },
        { title: "60 минут генеральной уборки", desc: "Проведите генеральную уборку {count} минут", points: 3, base: 60 },
        { title: "30 минут танцевального фитнеса", desc: "Занимайтесь танцевальным фитнесом {count} минут", points: 3, base: 30 },
        { title: "45 минут работы стоя", desc: "Работайте стоя {count} минут (за столом, кухней и т.д.)", points: 2, base: 45 },
        { title: "20 минут круговой тренировки", desc: "Выполните круговую тренировку {count} минут", points: 3, base: 20 },
        { title: "30 минут катания на роликах", desc: "Катайтесь на роликах или коньках {count} минут", points: 3, base: 30 },
        { title: "60 минут работы на даче", desc: "Поработайте на дачном участке {count} минут", points: 3, base: 60 },
        { title: "40 минут прогулки с собакой", desc: "Гуляйте с собакой в активном темпе {count} минут", points: 2, base: 40 },
        { title: "25 минут аквааэробики", desc: "Занимайтесь аквааэробикой в бассейне или ванне {count} минут", points: 3, base: 25 },
        { title: "35 минут скандинавской ходьбы", desc: "Практикуйте скандинавскую ходьбу {count} минут", points: 3, base: 35 },
        { title: "50 минут работы по дому", desc: "Выполняйте различные работы по дому {count} минут", points: 3, base: 50 }
    ],
    intelligence: [
        { title: "30 минут чтения", desc: "Читайте книгу или научную статью {count} минут", points: 3, base: 30 },
        { title: "20 минут изучения языка", desc: "Занимайтесь изучением нового языка {count} минут", points: 2, base: 20 },
        { title: "15 решения головоломок", desc: "Решите несколько сложных головоломок за {count} минут", points: 2, base: 15 },
        { title: "30 минут документального фильма", desc: "Посмотрите научно-популярный фильм {count} минут", points: 2, base: 30 },
        { title: "20 минут обучения новому навыку", desc: "Потратьте {count} минут на изучение нового навыка", points: 2, base: 20 },
        { title: "40 минут написания текста", desc: "Напишите статью, эссе или рассказ за {count} минут", points: 3, base: 40 },
        { title: "30 минут шахмат", desc: "Сыграйте в шахматы (можно онлайн) {count} минут", points: 3, base: 30 },
        { title: "20 минут изучения истории", desc: "Изучите исторический период или событие {count} минут", points: 2, base: 20 },
        { title: "25 минут программирования", desc: "Поработайте над программистским проектом {count} минут", points: 3, base: 25 },
        { title: "30 минут анализа проблемы", desc: "Проанализируйте сложную проблему и предложите решения за {count} минут", points: 3, base: 30 },
        { title: "20 минут ментальной арифметики", desc: "Практикуйте устный счет и вычисления {count} минут", points: 2, base: 20 },
        { title: "40 минут онлайн-курса", desc: "Пройдите часть онлайн-курса по новой теме за {count} минут", points: 3, base: 40 },
        { title: "30 минут стратегической игры", desc: "Сыграйте в стратегическую игру (шахматы, го и т.д.) {count} минут", points: 2, base: 30 },
        { title: "20 минут запоминания", desc: "Попрактикуйте техники запоминания {count} минут", points: 2, base: 20 },
        { title: "30 минут изучения карты", desc: "Изучите географическую карту нового региона {count} минут", points: 2, base: 30 },
        { title: "25 минут научного подкаста", desc: "Прослушайте научно-популярный подкаст {count} минут", points: 2, base: 25 },
        { title: "20 минут кроссвордов", desc: "Решите кроссворд или сканворд за {count} минут", points: 2, base: 20 },
        { title: "40 минут изучения искусства", desc: "Изучите творчество какого-либо художника {count} минут", points: 2, base: 40 },
        { title: "30 минут финансового планирования", desc: "Займитесь финансовым планированием и анализом {count} минут", points: 3, base: 30 },
        { title: "25 минут философских размышлений", desc: "Размышляйте на философскую тему {count} минут", points: 2, base: 25 }
    ]
};

// Обязательные квесты
const mandatoryQuests = [
    { title: "Проведи 30 минут на свежем воздухе", desc: "Выйди на улицу и проведи время на природе", points: 0 },
    { title: "Выпей 2 литра воды", desc: "Соблюди водный баланс в течение дня", points: 0 },
    { title: "Сделай 5 добрых дел", desc: "Помоги другим людям или животным", points: 0 },
    { title: "Спи не менее 7 часов", desc: "Обеспечь себе полноценный ночной сон", points: 0 },
    { title: "Запиши 3 благодарности", desc: "Запиши три вещи, за которые ты благодарен сегодня", points: 0 }
];

// Достижения дисциплины
const disciplineLevels = [
    { name: "Новичок", days: 7, title: "Знаток дисциплины" },
    { name: "Знаток", days: 14, title: "Эксперт дисциплины" },
    { name: "Эксперт", days: 21, title: "Мастер дисциплины" },
    { name: "Мастер", days: 28, title: "Бог дисциплины", max: true }
];

// Описания характеристик
const attributeDescriptions = {
    strength: "Физическая мощь и мышечная развитость. Влияет на выполнение силовых упражнений и физической работы.",
    agility: "Координация, скорость реакции и гибкость. Важна для спортивных и подвижных задач, требующих ловкости.",
    perception: "Осознанность, внимание к деталям и способность замечать изменения. Развивает наблюдательность и чувствительность к окружению.",
    stamina: "Способность выдерживать длительные нагрузки без усталости. Увеличивает работоспособность и выносливость в повседневных задачах.",
    intelligence: "Умственные способности, логика и обучаемость. Помогает в решении сложных задач, обучении новым навыкам и анализе информации."
};

// Описания сундуков
const chestDescriptions = {
    common: "Сюрприз от системы",
    rare: "Подарок от системы",
    epic: "Благославение системы",
    legendary: "Любимчик системы"
};

// DOM elements
const levelElement = document.getElementById('level');
const levelProgressBar = document.getElementById('level-progress-bar');
const levelProgressContainer = document.getElementById('level-progress-container');
const attributeCards = {
    strength: document.getElementById('strength-card'),
    agility: document.getElementById('agility-card'),
    perception: document.getElementById('perception-card'),
    stamina: document.getElementById('stamina-card'),
    intelligence: document.getElementById('intelligence-card')
};
const attributeValues = document.querySelectorAll('.attribute-value');
const progressBars = document.querySelectorAll('.progress-bar');
const questsContainer = document.getElementById('quests-container');
const achievementCards = {
    status: document.getElementById('status-achievement'),
    profession: document.getElementById('profession-achievement'),
    rules: document.getElementById('rules-achievement'),
    master: document.getElementById('master-achievement')
};
const startButton = document.getElementById('start-btn');
const questsSection = document.getElementById('quests-section');
const timerElement = document.getElementById('timer');
const statusIndicator = document.getElementById('status-indicator');
const professionIndicator = document.getElementById('profession-indicator');
const replaceQuestBtn = document.getElementById('replace-quest-btn');
const addCustomQuestBtn = document.getElementById('add-custom-quest-btn');
const replaceConfirmModal = document.getElementById('replace-confirm-modal');
const replaceModalText = document.getElementById('replace-modal-text');
const confirmReplaceBtn = document.getElementById('confirm-replace-btn');
const cancelReplaceBtn = document.getElementById('cancel-replace-btn');
const customQuestModal = document.getElementById('custom-quest-modal');
const customQuestTitle = document.getElementById('custom-quest-title');
const customQuestDesc = document.getElementById('custom-quest-desc');
const saveCustomQuestBtn = document.getElementById('save-custom-quest-btn');
const cancelCustomQuestBtn = document.getElementById('cancel-custom-quest-btn');
const statusModal = document.getElementById('status-modal');
const professionModal = document.getElementById('profession-modal');
const professionMessage = document.getElementById('profession-message');
const punishmentModal = document.getElementById('punishment-modal');
const punishmentMessage = document.getElementById('punishment-message');
const weeklyQuestTitle = document.getElementById('weekly-quest-title');
const weeklyQuestDesc = document.getElementById('weekly-quest-desc');
const weeklyQuestBtn = document.getElementById('weekly-quest-btn');
const weeklyTimerElement = document.getElementById('weekly-timer');
const weeklyQuestCard = document.getElementById('weekly-quest-card');
const sundayNotice = document.getElementById('sunday-notice');
const weekReport = document.getElementById('week-report');
const weekReportContent = document.getElementById('week-report-content');
const completedAll = document.getElementById('completed-all');
const confirmQuestModal = document.getElementById('confirm-quest-modal');
const confirmQuestMessage = document.getElementById('confirm-quest-message');
const confirmQuestBtn = document.getElementById('confirm-quest-btn');
const cancelQuestBtn = document.getElementById('cancel-quest-btn');
const attributeModal = document.getElementById('attribute-modal');
const attributeModalTitle = document.getElementById('attribute-modal-title');
const attributeModalDesc = document.getElementById('attribute-modal-desc');
const achievementModal = document.getElementById('achievement-info-modal');
const achievementModalTitle = document.getElementById('achievement-modal-title');
const achievementModalDesc = document.getElementById('achievement-modal-desc');
const coinsElement = document.getElementById('coins');
const walletElement = document.getElementById('wallet');
const levelContainer = document.getElementById('level-container');
const shopItemModal = document.getElementById('shop-item-modal');
const shopItemTitle = document.getElementById('shop-item-title');
const shopItemContent = document.getElementById('shop-item-content');
const shopItemPrice = document.getElementById('shop-item-price');
const confirmBuyBtn = document.getElementById('confirm-buy-btn');
const cancelBuyBtn = document.getElementById('cancel-buy-btn');
const levelInfoModal = document.getElementById('level-info-modal');
const levelInfoContent = document.getElementById('level-info-content');
const shopGrid = document.getElementById('shop-grid');
const eventsList = document.getElementById('events-list');
const notificationsContainer = document.getElementById('notifications-container');
const themeToggle = document.getElementById('theme-toggle');
const loginModal = document.getElementById('login-modal');
const userCodeInput = document.getElementById('user-code');
const loginBtn = document.getElementById('login-btn');
const generateCodeBtn = document.getElementById('generate-code-btn');
const userInfo = document.getElementById('user-info');
const userIdDisplay = document.getElementById('user-id-display');
const logoutBtn = document.getElementById('logout-btn');
const weeklyConfirmModal = document.getElementById('weekly-confirm-modal');
const weeklyConfirmMessage = document.getElementById('weekly-confirm-message');
const confirmWeeklyBtn = document.getElementById('confirm-weekly-btn');
const cancelWeeklyBtn = document.getElementById('cancel-weekly-btn');
const rulesModal = document.getElementById('rules-modal');
const closeRulesBtn = document.getElementById('close-rules-modal');

// NEW: Система пользователей
let currentUser = null;

// Generate random user ID
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Generate easy-to-remember code
function generateEasyCode() {
    const adjectives = ['быстрый', 'умный', 'сильный', 'ловкий', 'стойкий', 'смелый', 'яркий', 'тихий', 'горячий', 'холодный'];
    const nouns = ['тигр', 'орел', 'волк', 'дракон', 'феникс', 'леопард', 'ястреб', 'медведь', 'лев', 'единорог'];
    const numbers = Math.floor(100 + Math.random() * 900);
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adj}_${noun}_${numbers}`;
}

// Save user data
function saveUserData(userId, userCode, data) {
    const userKey = `user_${userId}`;
    const userData = {
        userId: userId,
        userCode: userCode,
        data: data,
        lastLogin: Date.now()
    };
    
    localStorage.setItem(userKey, JSON.stringify(userData));
    
    // Также сохраняем mapping code->userId для быстрого поиска
    const codeMap = JSON.parse(localStorage.getItem('userCodeMap') || '{}');
    codeMap[userCode] = userId;
    localStorage.setItem('userCodeMap', JSON.stringify(codeMap));
}

// Load user data
function loadUserData(userId) {
    const userKey = `user_${userId}`;
    const userData = localStorage.getItem(userKey);
    
    if (userData) {
        return JSON.parse(userData);
    }
    
    return null;
}

// Find user by code
function findUserByCode(code) {
    const codeMap = JSON.parse(localStorage.getItem('userCodeMap') || '{}');
    const userId = codeMap[code];
    
    if (userId) {
        return loadUserData(userId);
    }
    
    return null;
}

// Login user
function loginUser(userCode) {
    let userData = findUserByCode(userCode);
    
    if (!userData) {
        // Create new user
        const userId = generateUserId();
        userData = {
            userId: userId,
            userCode: userCode,
            data: { ...gameState },
            lastLogin: Date.now()
        };
        
        saveUserData(userId, userCode, gameState);
        showNotification('👋 Добро пожаловать!', 'Создан новый аккаунт', 'success');
    } else {
        // Load existing user data
        Object.assign(gameState, userData.data);
        showNotification('👋 С возвращением!', 'Ваш прогресс загружен', 'success');
    }
    
    currentUser = userData.userId;
    gameState.userId = userData.userId;
    gameState.userCode = userData.userCode;
    
    // Update UI
    userIdDisplay.textContent = userData.userCode;
    userInfo.style.display = 'flex';
    loginModal.style.display = 'none';
    
    // Save to session for quick access
    sessionStorage.setItem('currentUserId', userData.userId);
    
    // Initialize game with loaded data
    initGameWithData();
}

// Logout user
function logoutUser() {
    // Save current progress before logout
    if (currentUser) {
        saveUserData(currentUser, gameState.userCode, gameState);
    }
    
    currentUser = null;
    gameState.userId = null;
    gameState.userCode = null;
    
    // Clear session
    sessionStorage.removeItem('currentUserId');
    
    // Reset UI
    userInfo.style.display = 'none';
    loginModal.style.display = 'flex';
    
    // Reset game state to defaults (but keep in memory for new login)
    Object.assign(gameState, {
        level: 1,
        attributes: {
            strength: 1,
            agility: 1,
            perception: 1,
            stamina: 1,
            intelligence: 1
        },
        totalPoints: 5,
        pointsToNextLevel: 10,
        currentPoints: 0,
        dailyQuests: [],
        weeklyQuest: null,
        questResetTime: null,
        weeklyResetTime: null,
        status: null,
        profession: null,
        replaceCount: 3,
        maxAttributeValue: 500,
        mandatoryQuestIndex: -1,
        consecutiveDays: 0,
        disciplineLevel: 0,
        weeklyStats: {
            strength: { points: 0, actions: [] },
            agility: { points: 0, actions: [] },
            perception: { points: 0, actions: [] },
            stamina: { points: 0, actions: [] },
            intelligence: { points: 0, actions: [] }
        },
        currentQuestIndex: -1,
        level150Achieved: false,
        coins: 0,
        chestsBought: [],
        maxReplaceCount: 3,
        maxDailyQuests: 6,
        noMandatoryPenalty: false,
        expMultiplier: 1,
        tempBonuses: [],
        events: [],
        theme: 'dark',
        customQuests: [],
        userId: null,
        userCode: null
    });
    
    showNotification('👋 До свидания!', 'Вы вышли из системы', 'info');
}

// Check auto-login
function checkAutoLogin() {
    const savedUserId = sessionStorage.getItem('currentUserId');
    
    if (savedUserId) {
        const userData = loadUserData(savedUserId);
        if (userData) {
            currentUser = userData.userId;
            Object.assign(gameState, userData.data);
            
            // Update UI
            userIdDisplay.textContent = userData.userCode;
            userInfo.style.display = 'flex';
            
            initGameWithData();
            return true;
        }
    }
    
    return false;
}

// Initialize game with loaded data
function initGameWithData() {
    checkSundayBonus();
    setupEventListeners();
    startTimers();
    generateDailyQuests();
    generateWeeklyQuest();
    updateStats();
    updateReplaceCounter();
    updateCoinsDisplay();
    renderEvents();
    applyTheme();
    
    // Add login event
    addEvent(`🔑 Вход в систему: ${gameState.userCode}`, 'info');
}

// Initialize game
function initGame() {
    // Всегда настраиваем обработчики событий для всех кнопок
    setupEventListeners();
    
    // Check if user is already logged in
    if (!checkAutoLogin()) {
        // Show login modal
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
    }
    
    // Setup login event listeners (для старой системы входа)
    setupLoginListeners();
}

// Setup login event listeners
function setupLoginListeners() {
    loginBtn.addEventListener('click', function() {
        const code = userCodeInput.value.trim();
        
        if (code.length < 4) {
            alert('Кодовое слово должно содержать минимум 4 символа');
            return;
        }
        
        loginUser(code);
    });
    
    generateCodeBtn.addEventListener('click', function() {
        const easyCode = generateEasyCode();
        userCodeInput.value = easyCode;
        showNotification('✨ Сгенерирован код', `Ваш код: ${easyCode}`, 'info');
    });
    
    logoutBtn.addEventListener('click', logoutUser);
    
    // Allow Enter key to login
    userCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
}

// Save game state
function saveGame() {
    if (currentUser) {
        saveUserData(currentUser, gameState.userCode, gameState);
    }
}

// Load game state from localStorage
function loadGame() {
    // Already loaded in loginUser or checkAutoLogin
    return;
}

// Apply theme
function applyTheme() {
    if (gameState.theme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
    } else {
        document.body.classList.remove('light-theme');
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
    }
}

// Toggle theme
function toggleTheme() {
    if (gameState.theme === 'dark') {
        gameState.theme = 'light';
    } else {
        gameState.theme = 'dark';
    }
    applyTheme();
    saveGame();
}

// Check if it's Sunday for bonus
function checkSundayBonus() {
    const today = new Date();
    if (today.getDay() === 0) { // 0 = Sunday
        sundayNotice.style.display = 'block';
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('sunday');
        });
    }
}

// Set quest reset time (next 24 hours)
function setQuestResetTime() {
    const now = Date.now();
    gameState.questResetTime = now + 24 * 60 * 60 * 1000;
    saveGame();
}

// Set weekly quest reset time (next 7 days)
function setWeeklyResetTime() {
    const now = Date.now();
    gameState.weeklyResetTime = now + 7 * 24 * 60 * 60 * 1000;
    saveGame();
}

// Update replace quest counter display
function updateReplaceCounter() {
    replaceQuestBtn.disabled = gameState.replaceCount <= 0;
}

// Update coins display
function updateCoinsDisplay() {
    coinsElement.textContent = gameState.coins;
}

// Generate daily quests
function generateDailyQuests() {
    questsContainer.innerHTML = '';
    
    if (gameState.dailyQuests && gameState.dailyQuests.length > 0) {
        gameState.dailyQuests.forEach((quest, index) => {
            const questCard = createQuestCard(quest, index);
            questsContainer.appendChild(questCard);
        });
        return;
    }
    
    gameState.dailyQuests = [];
    
    // Обычные квесты (количество зависит от купленных сундуков)
    const regularQuestCount = gameState.maxDailyQuests - 1; // Один слот для обязательного квеста
    
    // Выбираем случайные атрибуты для квестов
    const attributes = Object.keys(questsDatabase);
    for (let i = 0; i < regularQuestCount; i++) {
        const attribute = attributes[i % attributes.length];
        const quests = questsDatabase[attribute];
        const randomIndex = Math.floor(Math.random() * quests.length);
        const baseQuest = quests[randomIndex];
        
        // Рассчитываем сложность на основе уровня
        const difficultyMultiplier = 1 + (Math.floor(gameState.level / 10) * 0.1);
        const adjustedCount = Math.round(baseQuest.base * difficultyMultiplier);
        
        // Форматируем описание
        let desc = baseQuest.desc.replace('{count}', adjustedCount);
        desc = desc.replace('{half}', Math.round(adjustedCount / 2));
        
        // ИСПРАВЛЕНО: Шанс 50% на получение монеты
        const coinReward = Math.random() < 0.5;
        
        const quest = {
            title: baseQuest.title,
            desc: desc,
            points: baseQuest.points,
            attribute: attribute,
            completed: false,
            mandatory: false,
            base: baseQuest.base,
            adjustedCount: adjustedCount,
            coinReward: coinReward
        };
        
        gameState.dailyQuests.push(quest);
    }
    
    // Обязательный квест
    const mandatoryIndex = Math.floor(Math.random() * mandatoryQuests.length);
    const mandatoryQuest = mandatoryQuests[mandatoryIndex];
    gameState.dailyQuests.push({
        title: mandatoryQuest.title,
        desc: mandatoryQuest.desc,
        points: mandatoryQuest.points,
        attribute: 'all',
        completed: false,
        mandatory: true,
        coinReward: false
    });
    
    gameState.mandatoryQuestIndex = gameState.maxDailyQuests - 1;
    
    // NEW: Добавляем пользовательские квесты
    if (gameState.customQuests && gameState.customQuests.length > 0) {
        gameState.customQuests.forEach(quest => {
            if (!quest.completed) {
                gameState.dailyQuests.push({
                    ...quest,
                    custom: true
                });
            }
        });
    }
    
    gameState.dailyQuests.forEach((quest, index) => {
        const questCard = createQuestCard(quest, index);
        questsContainer.appendChild(questCard);
    });
    
    saveGame();
    updateReplaceCounter();
}

// Create quest card DOM element
function createQuestCard(quest, index) {
    const questCard = document.createElement('div');
    questCard.className = 'quest-card';
    questCard.dataset.index = index;
    
    if (quest.mandatory) {
        questCard.classList.add('mandatory-quest');
    } else if (quest.custom) {
        questCard.classList.add('custom-quest');
    }
    
    let rewardText = quest.mandatory ? 
        'Избежит наказания' : 
        `+${quest.points} к ${getAttributeName(quest.attribute)}`;
    
    // NEW: Для пользовательских квестов специальная награда
    if (quest.custom) {
        rewardText = '+1 ко всем характеристикам';
    }
    
    if (quest.coinReward || quest.custom) {
        rewardText += ` <span class="coin-icon">+1 L</span>`;
    }
    
    questCard.innerHTML = `
        ${quest.mandatory ? '<div class="mandatory-label">⚠️ Обязательный</div>' : ''}
        ${quest.custom ? '<div class="custom-label">✨ Свой квест</div>' : ''}
        <div class="quest-title">${quest.title}</div>
        <div class="quest-desc">${quest.desc}</div>
        <div class="quest-reward">
            <i class="fas fa-plus-circle"></i> ${rewardText}
        </div>
        <button class="quest-btn ${quest.completed ? 'completed' : ''}" 
                data-attribute="${quest.attribute}" 
                data-points="${quest.points}"
                data-coin="${quest.coinReward || quest.custom}"
                data-index="${index}">
            ${quest.completed ? 'Выполнено!' : 'Выполнить'}
        </button>
    `;
    return questCard;
}

// Generate weekly quest
function generateWeeklyQuest() {
    if (gameState.weeklyQuest) {
        weeklyQuestTitle.textContent = gameState.weeklyQuest.title;
        weeklyQuestDesc.textContent = gameState.weeklyQuest.desc;
        weeklyQuestBtn.textContent = gameState.weeklyQuest.completed ? 'Выполнено!' : 'Выполнить';
        weeklyQuestBtn.classList.toggle('completed', gameState.weeklyQuest.completed);
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * weeklyQuests.length);
    gameState.weeklyQuest = {
        ...weeklyQuests[randomIndex],
        completed: false
    };
    
    weeklyQuestTitle.textContent = gameState.weeklyQuest.title;
    weeklyQuestDesc.textContent = gameState.weeklyQuest.desc;
    weeklyQuestBtn.textContent = 'Выполнить';
    weeklyQuestBtn.classList.remove('completed');
    
    saveGame();
}

function getAttributeName(attr) {
    const names = {
        strength: "Силе",
        agility: "Ловкости",
        perception: "Восприятию",
        stamina: "Выносливости",
        intelligence: "Интеллекту",
        all: "всем характеристикам"
    };
    return names[attr] || attr;
}

// Show replace confirmation modal
function showReplaceConfirmModal() {
    if (gameState.replaceCount <= 0) {
        alert('У вас больше нет доступных замен квестов, подождите завтрашний день');
        return;
    }
    
    replaceModalText.innerHTML = `У вас осталось <strong>${gameState.replaceCount}</strong> замен. Вы уверены, что хотите заменить квест?`;
    replaceConfirmModal.style.display = 'flex';
}

// Hide replace confirmation modal
function hideReplaceConfirmModal() {
    replaceConfirmModal.style.display = 'none';
}

// NEW: Показать модальное окно создания квеста
function showCustomQuestModal() {
    customQuestTitle.value = '';
    customQuestDesc.value = '';
    customQuestModal.style.display = 'flex';
}

// NEW: Скрыть модальное окно создания квеста
function hideCustomQuestModal() {
    customQuestModal.style.display = 'none';
}

// NEW: Сохранить пользовательский квест
function saveCustomQuest() {
    const title = customQuestTitle.value.trim();
    const desc = customQuestDesc.value.trim();
    
    if (!title) {
        alert('Пожалуйста, введите название квеста');
        return;
    }
    
    if (!desc) {
        alert('Пожалуйста, введите описание квеста');
        return;
    }
    
    const customQuest = {
        title: title,
        desc: desc,
        points: 1,
        attribute: 'all',
        completed: false,
        custom: true,
        coinReward: true
    };
    
    // Добавляем квест в массив пользовательских квестов
    if (!gameState.customQuests) {
        gameState.customQuests = [];
    }
    gameState.customQuests.push(customQuest);
    
    // Добавляем квест в список ежедневных квестов
    gameState.dailyQuests.push(customQuest);
    
    // Обновляем отображение квестов
    generateDailyQuests();
    saveGame();
    hideCustomQuestModal();
    
    // Добавляем событие в ленту
    addEvent(`✨ Создан новый квест: "${title}"`, 'info');
    showNotification('✨ Новый квест!', 'Вы создали свой собственный квест', 'success');
}

// NEW: Показать подтверждение выполнения еженедельного квеста
function showWeeklyConfirmModal() {
    if (gameState.weeklyQuest.completed) {
        alert('Вы уже выполнили этот еженедельный квест!');
        return;
    }
    
    weeklyConfirmMessage.textContent = `Вы подтверждаете, что завершили еженедельный квест "${gameState.weeklyQuest.title}"?`;
    weeklyConfirmModal.style.display = 'flex';
}

// NEW: Скрыть подтверждение выполнения еженедельного квеста
function hideWeeklyConfirmModal() {
    weeklyConfirmModal.style.display = 'none';
}

// Activate quest replace mode
function activateReplaceMode() {
    questsContainer.classList.add('replace-mode');
    hideReplaceConfirmModal();
    
    // Добавляем обработчики для выбора квеста для замены
    const questCards = document.querySelectorAll('.quest-card');
    questCards.forEach(card => {
        card.addEventListener('click', handleQuestSelectionForReplacement);
    });
    
    showNotification('🔁 Режим замены', 'Выберите квест для замены', 'info');
}

// Handle quest selection for replacement
function handleQuestSelectionForReplacement(event) {
    const questCard = event.currentTarget;
    const questIndex = parseInt(questCard.dataset.index);
    
    // Отменяем замену если кликнули на кнопку выполнения
    if (event.target.classList.contains('quest-btn')) {
        return;
    }
    
    // NEW: Нельзя заменить пользовательские квесты
    if (gameState.dailyQuests[questIndex].custom) {
        alert('Этот квест создан вами и не может быть заменен!');
        return;
    }
    
    replaceQuest(questCard, questIndex);
    
    // Удаляем обработчики после замена
    const questCards = document.querySelectorAll('.quest-card');
    questCards.forEach(card => {
        card.removeEventListener('click', handleQuestSelectionForReplacement);
    });
    
    questsContainer.classList.remove('replace-mode');
}

// Replace a quest
function replaceQuest(questCard, questIndex) {
    if (questIndex === gameState.mandatoryQuestIndex && !gameState.noMandatoryPenalty) {
        alert('Этот квест обязательный! Его нельзя заменить.');
        return;
    }
    
    const attribute = gameState.dailyQuests[questIndex].attribute;
    const quests = questsDatabase[attribute];
    
    const randomIndex = Math.floor(Math.random() * quests.length);
    const baseQuest = quests[randomIndex];
    
    // Рассчитываем сложность на основе уровня
    const difficultyMultiplier = 1 + (Math.floor(gameState.level / 10) * 0.1);
    const adjustedCount = Math.round(baseQuest.base * difficultyMultiplier);
    
    // Форматируем описание
    let desc = baseQuest.desc.replace('{count}', adjustedCount);
    desc = desc.replace('{half}', Math.round(adjustedCount / 2));
    
    // ИСПРАВЛЕНО: Шанс 50% на получение монеты
    const coinReward = Math.random() < 0.5;
    
    const newQuest = {
        title: baseQuest.title,
        desc: desc,
        points: baseQuest.points,
        attribute: attribute,
        completed: false,
        mandatory: false,
        base: baseQuest.base,
        adjustedCount: adjustedCount,
        coinReward: coinReward
    };
    
    gameState.dailyQuests[questIndex] = newQuest;
    gameState.replaceCount--;
    
    generateDailyQuests();
    saveGame();
    
    replaceQuestBtn.classList.add('rotating');
    setTimeout(() => {
        replaceQuestBtn.classList.remove('rotating');
    }, 1000);
    
    // Добавляем событие в ленту
    addEvent(`🔁 Замена квеста: "${newQuest.title}"`, 'warning');
    showNotification('🔁 Квест заменен!', `Новый квест: "${newQuest.title}"`, 'info');
}

// Check if mandatory quest was completed
function checkMandatoryQuest() {
    const mandatoryQuest = gameState.dailyQuests[gameState.mandatoryQuestIndex];
    
    if (mandatoryQuest && !mandatoryQuest.completed && !gameState.noMandatoryPenalty) {
        // Определяем множитель штрафа (2x в воскресенье)
        const penaltyMultiplier = new Date().getDay() === 0 ? 2 : 1;
        let actualPoints = penaltyMultiplier;
        
        // Применяем бонусы от сундуков
        actualPoints = Math.round(actualPoints * gameState.expMultiplier);
        
        punishmentMessage.textContent = `Вы не выполнили обязательный квест! Ваше наказание: -${penaltyMultiplier} ко всем характеристикам.`;
        punishmentModal.style.display = 'flex';
        
        // Применяем наказание
        Object.keys(gameState.attributes).forEach(attr => {
            gameState.attributes[attr] = Math.max(1, gameState.attributes[attr] - actualPoints);
        });
        
        saveGame();
        updateStats();
        
        // Добавляем событие в ленту
        addEvent(`⚠️ Штраф: не выполнен обязательный квест`, 'danger');
        showNotification('⚠️ Штраф!', 'Вы не выполнили обязательный квест', 'danger');
    }
    
    // Проверяем выполнение всех квестов для достижения дисциплины
    checkAllQuestsCompleted();
}

// Reset weekly quest
function resetWeeklyQuest() {
    gameState.weeklyQuest = null;
    generateWeeklyQuest();
    setWeeklyResetTime();
}

// Show weekly report
function showWeeklyReport() {
    weekReport.style.display = 'block';
    
    let reportHTML = '<ul>';
    let totalPoints = 0;
    
    Object.keys(gameState.weeklyStats).forEach(attr => {
        if (gameState.weeklyStats[attr].points > 0) {
            totalPoints += gameState.weeklyStats[attr].points;
            reportHTML += `<li><b>${getAttributeName(attr)}</b>: +${gameState.weeklyStats[attr].points} очков`;
            
            if (gameState.weeklyStats[attr].actions.length > 0) {
                reportHTML += `<ul>`;
                gameState.weeklyStats[attr].actions.forEach(action => {
                    reportHTML += `<li>${action}</li>`;
                });
                reportHTML += `</ul>`;
            }
            
            reportHTML += `</li>`;
        }
    });
    
    reportHTML += `</ul>`;
    reportHTML += `<p><b>Итого за неделю</b>: +${totalPoints} очков характеристик</p>`;
    reportHTML += `<p>Так держать! Продолжайте в том же духе!</p>`;
    
    weekReportContent.innerHTML = reportHTML;
    
    // Сбрасываем статистику за неделю
    Object.keys(gameState.weeklyStats).forEach(attr => {
        gameState.weeklyStats[attr] = { points: 0, actions: [] };
    });
    saveGame();
    
    // Добавляем событие в ленту
    addEvent(`📊 Недельный отчет: +${totalPoints} очков характеристик`, 'info');
    showNotification('📊 Недельный отчет готов!', `Вы получили +${totalPoints} очков характеристик`, 'info');
}

// Calculate points needed for next level
function calculatePointsToNextLevel() {
    const levelGroup = Math.floor((gameState.level - 1) / 10);
    let requiredPoints = 10 + levelGroup;
    
    // После 100 уровня фиксируем на 20 очках
    if (requiredPoints > 20) {
        requiredPoints = 20;
    }
    
    return requiredPoints;
}

// Update stats display
function updateStats() {
    levelElement.textContent = `Уровень ${gameState.level}`;
    
    // Обновляем требуемое количество очков для следующего уровня
    gameState.pointsToNextLevel = calculatePointsToNextLevel();
    
    const levelProgressPercentage = (gameState.currentPoints / gameState.pointsToNextLevel) * 100;
    levelProgressBar.style.width = `${levelProgressPercentage}%`;
    
    Object.keys(gameState.attributes).forEach((attr, index) => {
        const value = gameState.attributes[attr];
        attributeValues[index].textContent = `${value} / ${gameState.maxAttributeValue}`;
        
        const progressPercentage = (value / gameState.maxAttributeValue) * 100;
        progressBars[index].style.width = `${progressPercentage}%`;
    });
    
    // Обновление достижений
    if (gameState.level >= 50) {
        achievementCards.status.classList.remove('locked');
        if (!gameState.status) {
            setTimeout(() => {
                showStatusModal();
            }, 500);
        }
    }
    
    if (gameState.level >= 75) {
        achievementCards.profession.classList.remove('locked');
        if (!gameState.profession) {
            setTimeout(() => {
                assignProfession();
            }, 500);
        }
    }
    
    if (gameState.level >= 150) {
        achievementCards.master.classList.remove('locked');
        if (!gameState.level150Achieved) {
            gameState.level150Achieved = true;
            saveGame();
        }
    }
    
    if (gameState.status) {
        statusIndicator.textContent = gameState.status;
        statusIndicator.style.display = 'inline-block';
    }
    
    if (gameState.profession) {
        professionIndicator.textContent = gameState.profession;
        professionIndicator.style.display = 'inline-block';
    }
}

// Check if all quests are completed
function checkAllQuestsCompleted() {
    const allCompleted = gameState.dailyQuests.every(quest => quest.completed);
    
    if (allCompleted) {
        // Увеличиваем счетчик дней подряд
        gameState.consecutiveDays++;
        
        // Проверяем достижения дисциплины
        const currentLevel = disciplineLevels[gameState.disciplineLevel];
        if (!currentLevel.max && gameState.consecutiveDays >= currentLevel.days) {
            if (gameState.disciplineLevel < disciplineLevels.length - 1) {
                gameState.disciplineLevel++;
                
                // Добавляем событие в ленту
                addEvent(`🏆 Новый уровень дисциплины: ${disciplineLevels[gameState.disciplineLevel].name}`, 'success');
                showNotification('🏆 Улучшение дисциплины!', `Вы достигли уровня: ${disciplineLevels[gameState.disciplineLevel].name}`, 'success');
            }
        }
        
        // Показываем сообщение
        completedAll.style.display = 'block';
        saveGame();
        
        // Добавляем событие в ленту
        addEvent('🎯 Все квесты выполнены!', 'success');
        showNotification('🎯 Успех!', 'Все квесты за сегодня выполнены!', 'success');
    } else {
        // Сбрасываем счетчик дней подряд, если не все квесты выполнены
        if (gameState.consecutiveDays > 0) {
            gameState.consecutiveDays = 0;
            saveGame();
            
            // Добавляем событие в ленту
            addEvent('⚠️ Серия дисциплины прервана', 'warning');
            showNotification('⚠️ Внимание!', 'Серия дисциплины прервана', 'warning');
        }
    }
}

// Show status selection modal
function showStatusModal() {
    statusModal.style.display = 'flex';
}

// Assign profession based on highest attribute
function assignProfession() {
    let highestAttribute = 'strength';
    let highestValue = gameState.attributes.strength;
    
    Object.keys(gameState.attributes).forEach(attr => {
        if (gameState.attributes[attr] > highestValue) {
            highestValue = gameState.attributes[attr];
            highestAttribute = attr;
        }
    });
    
    let profession = '';
    switch (highestAttribute) {
        case 'strength': profession = 'Качок'; break;
        case 'agility': profession = 'Атлет'; break;
        case 'perception': profession = 'Мудрец'; break;
        case 'stamina': profession = 'Стайер'; break;
        case 'intelligence': profession = 'Интеллектуал'; break;
        default: profession = 'Эксперт';
    }
    
    gameState.profession = profession;
    saveGame();
    
    professionMessage.textContent = `Поздравляем! Вам присвоена профессия: ${profession}`;
    professionModal.style.display = 'flex';
    
    // Добавляем событие в ленту
    addEvent(`🎓 Получена профессия: ${profession}`, 'success');
    showNotification('🎓 Новая профессия!', `Вам присвоена профессия: ${profession}`, 'success');
}

// Add points to attribute
function addPoints(attribute, points, questCard, questIndex, coinReward) {
    // Определяем множитель (2x в воскресенье)
    const multiplier = new Date().getDay() === 0 ? 2 : 1;
    let actualPoints = points * multiplier;
    
    // Применяем бонусы от сундуков
    actualPoints = Math.round(actualPoints * gameState.expMultiplier);
    
    // NEW: Для пользовательских квестов всегда даем +1 ко всем характеристикам
    if (gameState.dailyQuests[questIndex].custom) {
        actualPoints = 1;
        attribute = 'all';
    }
    
    // Добавляем очки к атрибуту
    if (attribute === 'all') {
        Object.keys(gameState.attributes).forEach(attr => {
            gameState.attributes[attr] += actualPoints;
            
            // Ограничиваем максимальное значение
            if (gameState.attributes[attr] > gameState.maxAttributeValue) {
                gameState.attributes[attr] = gameState.maxAttributeValue;
            }
        });
    } else {
        gameState.attributes[attribute] += actualPoints;
        
        // Ограничиваем максимальное значение
        if (gameState.attributes[attribute] > gameState.maxAttributeValue) {
            gameState.attributes[attribute] = gameState.maxAttributeValue;
        }
    }
    
    gameState.totalPoints += actualPoints;
    gameState.currentPoints += actualPoints;
    
    // Добавляем монеты, если есть награда
    if (coinReward) {
        gameState.coins += 1;
        updateCoinsDisplay();
        
        // Анимация монеты
        animateCoin(questCard.querySelector('.quest-btn'));
        
        // Добавляем событие в ленту
        addEvent(`🪙 Получена монета за выполнение квеста`, 'info');
        showNotification('🪙 Монета получена!', 'За выполнение квеста', 'info');
    }
    
    // Помечаем квест как выполненный
    gameState.dailyQuests[questIndex].completed = true;
    
    // NEW: Если это пользовательский квест, помечаем его как выполненный в массиве customQuests
    if (gameState.dailyQuests[questIndex].custom) {
        const customQuestTitle = gameState.dailyQuests[questIndex].title;
        if (gameState.customQuests) {
            const customQuest = gameState.customQuests.find(q => q.title === customQuestTitle && !q.completed);
            if (customQuest) {
                customQuest.completed = true;
            }
        }
    }
    
    // Добавляем статистику за неделю
    if (attribute === 'all') {
        Object.keys(gameState.attributes).forEach(attr => {
            gameState.weeklyStats[attr].points += actualPoints;
        });
    } else {
        gameState.weeklyStats[attribute].points += actualPoints;
        gameState.weeklyStats[attribute].actions.push(gameState.dailyQuests[questIndex].title);
    }
    
    saveGame();
    
    // Добавляем событие в ленту
    addEvent(`✅ Выполнен квест: "${gameState.dailyQuests[questIndex].title}"`, 'success');
    showNotification('✅ Квест выполнен!', `+${actualPoints} к ${getAttributeName(attribute)}`, 'success');
    
    // Проверяем, нужно ли повысить уровень
    while (gameState.currentPoints >= gameState.pointsToNextLevel) {
        gameState.currentPoints -= gameState.pointsToNextLevel;
        gameState.level++;
        
        // Пересчитываем требования для следующего уровня
        gameState.pointsToNextLevel = calculatePointsToNextLevel();
        
        // Анимация повышения уровня
        levelElement.classList.add('glowing');
        levelElement.style.animation = 'level-up 0.5s ease-in-out';
        setTimeout(() => {
            levelElement.classList.remove('glowing');
            levelElement.style.animation = '';
        }, 2000);
        
        // Добавляем событие в ленту
        addEvent(`🎉 Повышение уровня: ${gameState.level}`, 'success');
        showNotification('🎉 Уровень повышен!', `Поздравляем с достижением ${gameState.level} уровня!`, 'success');
    }
    
    // Animate quest card disappearance
    questCard.classList.add('completed');
    setTimeout(() => {
        questCard.remove();
    }, 500);
    
    // Scroll to attribute card with animation
    setTimeout(() => {
        attributeCards[attribute].scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight animation
        attributeCards[attribute].classList.add('highlight');
        setTimeout(() => {
            attributeCards[attribute].classList.remove('highlight');
        }, 1500);
    }, 600);
    
    updateStats();
    saveGame();
    
    // Проверяем выполнение всех квестов
    checkAllQuestsCompleted();
}

// Complete weekly quest
function completeWeeklyQuest() {
    // Add points to all attributes
    Object.keys(gameState.attributes).forEach(attr => {
        gameState.attributes[attr] += 2;
        
        // Ограничиваем максимальное значение
        if (gameState.attributes[attr] > gameState.maxAttributeValue) {
            gameState.attributes[attr] = gameState.maxAttributeValue;
        }
    });
    
    gameState.totalPoints += 10;
    gameState.currentPoints += 10;
    gameState.weeklyQuest.completed = true;
    
    // Добавляем монеты
    gameState.coins += 3;
    updateCoinsDisplay();
    
    // Анимация монет
    animateCoin(weeklyQuestBtn);
    
    // Проверяем, нужно ли повысить уровень
    while (gameState.currentPoints >= gameState.pointsToNextLevel) {
        gameState.currentPoints -= gameState.pointsToNextLevel;
        gameState.level++;
        
        // Пересчитываем требования для следующего уровня
        gameState.pointsToNextLevel = calculatePointsToNextLevel();
    }
    
    weeklyQuestBtn.textContent = 'Выполнено!';
    weeklyQuestBtn.classList.add('completed');
    
    saveGame();
    updateStats();
    
    // Add animation
    weeklyQuestCard.classList.add('glowing');
    setTimeout(() => {
        weeklyQuestCard.classList.remove('glowing');
    }, 2000);
    
    // Добавляем событие в ленту
    addEvent(`🌟 Выполнен еженедельный квест: "${gameState.weeklyQuest.title}"`, 'success');
    showNotification('🌟 Успех!', 'Еженедельный квест выполнен!', 'success');
}

// Show quest confirmation modal
function showQuestConfirmation(questIndex) {
    const quest = gameState.dailyQuests[questIndex];
    confirmQuestMessage.textContent = `Вы подтверждаете, что завершили квест "${quest.title}"?`;
    gameState.currentQuestIndex = questIndex;
    confirmQuestModal.style.display = 'flex';
}

// Show attribute description modal
function showAttributeModal(attribute) {
    attributeModalTitle.textContent = attributeCards[attribute].querySelector('.attribute-name').textContent;
    attributeModalDesc.textContent = attributeDescriptions[attribute];
    attributeModal.style.display = 'flex';
}

// NEW: Show rules modal (заменяет достижение Дисциплина)
function showRulesModal() {
    rulesModal.style.display = 'flex';
}

// Show achievement info modal
function showAchievementInfo(type) {
    let title = '';
    let description = '';
    
    switch(type) {
        case 'status':
            title = 'Статус';
            if (gameState.level < 50) {
                description = `Необходимо достигнуть 50 уровня, чтобы открыть статус. Текущий уровень: ${gameState.level}`;
            } else {
                description = 'Выберите свой уникальный статус, который будет отражать ваш путь развития.';
            }
            break;
            
        case 'profession':
            title = 'Профессия';
            if (gameState.level < 75) {
                description = `Необходимо достигнуть 75 уровня, чтобы выбрать профессию. Текущий уровень: ${gameState.level}`;
            } else {
                description = 'Выберите профессию, которая определит вашу дальнейшую специализацию.';
            }
            break;
            
        case 'master':
            title = 'Мастер всех стихий';
            if (gameState.level < 150) {
                description = `Необходимо достигнуть 150 уровня, чтобы получить это достижение. Текущий уровень: ${gameState.level}`;
            } else {
                description = 'Человек, который совершил невозможное!';
            }
            break;
    }
    
    achievementModalTitle.textContent = title;
    achievementModalDesc.textContent = description;
    achievementModal.style.display = 'flex';
}

// Show shop item modal
function showShopItemModal(type) {
    shopItemTitle.textContent = document.querySelector(`.shop-item.${type} .shop-title`).textContent;
    shopItemContent.textContent = `Внутри: ${chestDescriptions[type]}`;
    shopItemPrice.textContent = document.querySelector(`.shop-item.${type} .shop-price span`).textContent;
    shopItemPrice.dataset.type = type;
    shopItemModal.style.display = 'flex';
}

// Buy shop item
function buyShopItem(type) {
    const price = parseInt(document.querySelector(`.shop-item.${type} .shop-price span`).textContent);
    
    if (gameState.coins >= price) {
        gameState.coins -= price;
        gameState.chestsBought.push(type);
        
        // Apply chest bonuses
        switch(type) {
            case 'common':
                // +3 ко всем характеристикам
                Object.keys(gameState.attributes).forEach(attr => {
                    gameState.attributes[attr] += 3;
                });
                // +1 замена в день
                gameState.maxReplaceCount += 1;
                gameState.replaceCount = gameState.maxReplaceCount;
                break;
                
            case 'rare':
                // +5 ко всем характеристикам
                Object.keys(gameState.attributes).forEach(attr => {
                    gameState.attributes[attr] += 5;
                });
                // +100% к улучшениям на 48 часов
                const rareBonus = {
                    multiplier: 1.0,
                    expires: Date.now() + 48 * 60 * 60 * 1000
                };
                gameState.tempBonuses.push(rareBonus);
                // +1 ежедневный квест
                gameState.maxDailyQuests += 1;
                // +1 замена в день
                gameState.maxReplaceCount += 1;
                gameState.replaceCount = gameState.maxReplaceCount;
                break;
                
            case 'epic':
                // +50 к случайному атрибуту
                const attributes = Object.keys(gameState.attributes);
                const randomAttr = attributes[Math.floor(Math.random() * attributes.length)];
                gameState.attributes[randomAttr] += 50;
                // +1 ежедневный квест
                gameState.maxDailyQuests += 1;
                // +2 замены в день
                gameState.maxReplaceCount += 2;
                gameState.replaceCount = gameState.maxReplaceCount;
                // Отмена обязательного квеста
                gameState.noMandatoryPenalty = true;
                // +150% к улучшениям на 72 часа
                const epicBonus = {
                    multiplier: 1.5,
                    expires: Date.now() + 72 * 60 * 60 * 1000
                };
                gameState.tempBonuses.push(epicBonus);
                break;
                
            case 'legendary':
                // +200% к улучшениям навсегда
                gameState.expMultiplier += 2.0;
                // Отмена наказания за обязательный квест
                gameState.noMandatoryPenalty = true;
                // +2 ежедневных квеста
                gameState.maxDailyQuests += 2;
                // Неограниченные замены
                gameState.maxReplaceCount = Infinity;
                gameState.replaceCount = Infinity;
                break;
        }
        
        // Удаляем купленный сундук из магазина
        document.querySelector(`.shop-item.${type}`).remove();
        
        updateCoinsDisplay();
        saveGame();
        updateStats();
        generateDailyQuests(); // Regenerate quests with new count
        
        shopItemModal.style.display = 'none';
        
        // Анимация открытия сундука
        const chestIcon = document.querySelector(`.shop-item.${type} .chest-icon i`);
        if (chestIcon) {
            chestIcon.classList.add('chest-opening');
            setTimeout(() => {
                chestIcon.classList.remove('chest-opening');
            }, 500);
        }
        
        // Добавляем событие в ленту
        addEvent(`🎁 Куплен ${type} сундук`, 'info');
        showNotification('🎁 Сундук куплен!', `Вы получили: ${chestDescriptions[type]}`, 'success');
    } else {
        alert(`У вас недостаточно монет L для этой покупки. Требуется: ${price}, у вас: ${gameState.coins}`);
    }
}

// Show level info modal
function showLevelInfo() {
    const pointsLeft = gameState.pointsToNextLevel - gameState.currentPoints;
    levelInfoContent.textContent = `До следующего уровня осталось: ${pointsLeft} очков опыта`;
    levelInfoModal.style.display = 'flex';
}

// NEW: Show notification
function showNotification(title, content, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-title">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'danger' ? 'times-circle' : 'info-circle'}"></i>
            ${title}
        </div>
        <div class="notification-content">${content}</div>
    `;
    
    notificationsContainer.appendChild(notification);
    
    // Remove notification after animation
    setTimeout(() => {
        notification.remove();
    }, 3500);
}

// NEW: Add event to feed
function addEvent(content, type = 'info') {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const event = {
        content: content,
        type: type,
        timestamp: now.getTime()
    };
    
    gameState.events.unshift(event);
    if (gameState.events.length > 20) {
        gameState.events.pop();
    }
    
    saveGame();
    renderEvents();
}

// NEW: Render events to feed
function renderEvents() {
    eventsList.innerHTML = '';
    
    gameState.events.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${event.type}`;
        
        const now = new Date();
        const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        eventItem.innerHTML = `
            <div class="event-icon">
                <i class="fas fa-${event.type === 'success' ? 'check' : event.type === 'warning' ? 'exclamation' : event.type === 'danger' ? 'times' : 'info'}"></i>
            </div>
            <div class="event-content">${event.content}</div>
            <div class="event-time">${time}</div>
        `;
        
        eventsList.appendChild(eventItem);
    });
}

// NEW: Animate coin
function animateCoin(startElement) {
    const coin = document.createElement('div');
    coin.innerHTML = '🪙';
    coin.style.position = 'fixed';
    coin.style.zIndex = '1000';
    coin.style.fontSize = '20px';
    
    // Get start position
    const startRect = startElement.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    
    // Get end position
    const walletRect = walletElement.getBoundingClientRect();
    const endX = walletRect.left + walletRect.width / 2;
    const endY = walletRect.top + walletRect.height / 2;
    
    // Calculate distance
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    // Set initial position
    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;
    coin.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(coin);
    
    // Set CSS variables for animation
    coin.style.setProperty('--tx', `${deltaX}px`);
    coin.style.setProperty('--ty', `${deltaY}px`);
    
    // Animate
    coin.style.animation = 'fly-coin 1s forwards';
    
    // Remove coin after animation
    setTimeout(() => {
        coin.remove();
    }, 1000);
}

// Setup event listeners
function setupEventListeners() {
    // Проверяем, что DOM загружен
    if (!document.getElementById('start-btn')) {
        console.warn('⚠️ DOM еще не загружен, повторная попытка через 100ms...');
        setTimeout(setupEventListeners, 100);
        return;
    }
    
    console.log('🔧 Настройка обработчиков событий...');
    
    // Кнопка "Начать прокачку" прокручивает к квестам
    if (startButton) {
        startButton.addEventListener('click', function() {
            this.classList.add('active');
            setTimeout(() => {
                this.classList.remove('active');
                if (questsSection) {
                    questsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        });
    }
    
    // Переключатель темы
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Добавляем обработчики событий для кнопок квестов
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('quest-btn') && !e.target.classList.contains('completed')) {
            const button = e.target;
            const questIndex = parseInt(button.dataset.index);
            showQuestConfirmation(questIndex);
        }
    });
    
    // Кнопка замены квеста
    if (replaceQuestBtn) {
        replaceQuestBtn.addEventListener('click', showReplaceConfirmModal);
    }
    
    // NEW: Кнопка добавления своего квеста
    if (addCustomQuestBtn) {
        addCustomQuestBtn.addEventListener('click', showCustomQuestModal);
    }
    
    // Кнопка подтверждения замены
    if (confirmReplaceBtn) {
        confirmReplaceBtn.addEventListener('click', activateReplaceMode);
    }
    
    // Кнопка отмены замены
    if (cancelReplaceBtn) {
        cancelReplaceBtn.addEventListener('click', hideReplaceConfirmModal);
    }
    
    // NEW: Кнопка сохранения пользовательского квеста
    if (saveCustomQuestBtn) {
        saveCustomQuestBtn.addEventListener('click', saveCustomQuest);
    }
    
    // NEW: Кнопка отмены создания пользовательского квеста
    if (cancelCustomQuestBtn) {
        cancelCustomQuestBtn.addEventListener('click', hideCustomQuestModal);
    }
    
    // Кнопка выполнения еженедельного квеста
    if (weeklyQuestBtn) {
        weeklyQuestBtn.addEventListener('click', function() {
            if (gameState.weeklyQuest && !gameState.weeklyQuest.completed) {
                showWeeklyConfirmModal();
            }
        });
    }
    
    // NEW: Кнопка подтверждения еженедельного квеста
    if (confirmWeeklyBtn) {
        confirmWeeklyBtn.addEventListener('click', function() {
            hideWeeklyConfirmModal();
            completeWeeklyQuest();
        });
    }
    
    // NEW: Кнопка отмены еженедельного квеста
    if (cancelWeeklyBtn) {
        cancelWeeklyBtn.addEventListener('click', hideWeeklyConfirmModal);
    }
    
    // Модальное окно статуса
    document.querySelectorAll('.modal-option[data-status]').forEach(option => {
        option.addEventListener('click', function() {
            gameState.status = this.dataset.status;
            statusIndicator.textContent = gameState.status;
            statusIndicator.style.display = 'inline-block';
            statusModal.style.display = 'none';
            saveGame();
            
            // Добавляем событие в ленту
            addEvent(`🏷️ Установлен статус: ${gameState.status}`, 'info');
            showNotification('🏷️ Новый статус!', `Вы выбрали: ${gameState.status}`, 'info');
        });
    });
    
    // Модальное окно профессии
    const closeProfessionBtn = document.getElementById('close-profession-modal');
    if (closeProfessionBtn && professionModal) {
        closeProfessionBtn.addEventListener('click', function() {
            professionModal.style.display = 'none';
        });
    }
    
    // Модальное окно наказания
    const closePunishmentBtn = document.getElementById('close-punishment-modal');
    if (closePunishmentBtn && punishmentModal) {
        closePunishmentBtn.addEventListener('click', function() {
            punishmentModal.style.display = 'none';
        });
    }
    
    // Кнопки закрытия модальных окон
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Подтверждение выполнения квеста
    if (confirmQuestBtn && confirmQuestModal) {
        confirmQuestBtn.addEventListener('click', function() {
            const questIndex = gameState.currentQuestIndex;
            const questCard = document.querySelector(`.quest-card[data-index="${questIndex}"]`);
            if (!questCard) return;
            
            const button = questCard.querySelector('.quest-btn');
            if (!button) return;
            
            const attribute = button.dataset.attribute;
            const points = parseInt(button.dataset.points);
            const coinReward = button.dataset.coin === 'true';
            
            // Закрываем модальное окно
            confirmQuestModal.style.display = 'none';
            
            // Помечаем как выполненный
            button.textContent = 'Выполнено!';
            button.classList.add('completed');
            
            // Добавляем очки и прокручиваем к атрибуту
            addPoints(attribute, points, questCard, questIndex, coinReward);
        });
    }
    
    // Отмена выполнения квеста
    if (cancelQuestBtn && confirmQuestModal) {
        cancelQuestBtn.addEventListener('click', function() {
            confirmQuestModal.style.display = 'none';
        });
    }
    
    // Показать описание характеристики при клике
    Object.keys(attributeCards).forEach(attr => {
        if (attributeCards[attr]) {
            attributeCards[attr].addEventListener('click', function() {
                showAttributeModal(attr);
            });
        }
    });
    
    // Закрыть модальное окно характеристики
    const closeAttributeBtn = document.getElementById('close-attribute-modal');
    if (closeAttributeBtn && attributeModal) {
        closeAttributeBtn.addEventListener('click', function() {
            attributeModal.style.display = 'none';
        });
    }
    
    // NEW: Показать правила прокачки при клике
    if (achievementCards.rules) {
        achievementCards.rules.addEventListener('click', function() {
            showRulesModal();
        });
    }
    
    // NEW: Закрыть модальное окно правил
    if (closeRulesBtn && rulesModal) {
        closeRulesBtn.addEventListener('click', function() {
            rulesModal.style.display = 'none';
        });
    }
    
    // Показать информацию о достижении при клике
    if (achievementCards.status) {
        achievementCards.status.addEventListener('click', function() {
            showAchievementInfo('status');
        });
    }
    
    if (achievementCards.profession) {
        achievementCards.profession.addEventListener('click', function() {
            showAchievementInfo('profession');
        });
    }
    
    if (achievementCards.master) {
        achievementCards.master.addEventListener('click', function() {
            showAchievementInfo('master');
        });
    }
    
    // Закрыть модальное окно достижения
    const closeAchievementBtn = document.getElementById('close-achievement-modal');
    if (closeAchievementBtn && achievementModal) {
        closeAchievementBtn.addEventListener('click', function() {
            achievementModal.style.display = 'none';
        });
    }
    
    // Кнопки магазина
    document.querySelectorAll('.shop-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const shopItem = this.closest('.shop-item');
            const type = shopItem.dataset.type;
            showShopItemModal(type);
        });
    });
    
    // Подтверждение покупки в магазине
    if (confirmBuyBtn && shopItemPrice) {
        confirmBuyBtn.addEventListener('click', function() {
            const type = shopItemPrice.dataset.type;
            buyShopItem(type);
        });
    }
    
    // Отмена покупки в магазине
    if (cancelBuyBtn && shopItemModal) {
        cancelBuyBtn.addEventListener('click', function() {
            shopItemModal.style.display = 'none';
        });
    }
    
    // Клик по кошельку - переход в магазин
    if (walletElement) {
        walletElement.addEventListener('click', function() {
            const shopSection = document.getElementById('shop-section');
            if (shopSection) {
                shopSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Клик по уровню или прогресс бару - показать информацию
    if (levelContainer) {
        levelContainer.addEventListener('click', showLevelInfo);
    }
    if (levelProgressContainer) {
        levelProgressContainer.addEventListener('click', showLevelInfo);
    }
    
    // Закрыть модальное окно уровня
    const closeLevelBtn = document.getElementById('close-level-modal');
    if (closeLevelBtn && levelInfoModal) {
        closeLevelBtn.addEventListener('click', function() {
            levelInfoModal.style.display = 'none';
        });
    }
    
    // Клик по сундуку для просмотра информации
    document.querySelectorAll('.shop-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Если клик не по кнопке - открываем информацию
            if (!e.target.classList.contains('shop-btn')) {
                const type = this.dataset.type;
                showShopItemModal(type);
                
                // Анимация открытия сундука
                const chest = this.querySelector('.chest-icon i');
                if (chest) {
                    chest.classList.add('chest-opening');
                    setTimeout(() => {
                        chest.classList.remove('chest-opening');
                    }, 500);
                }
            }
        });
    });
    
    // Закрываем модальные окна при клике снаружи
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Timer for quest reset
function startTimers() {
    // Daily timer
    const dailyTimer = setInterval(() => {
        const now = Date.now();
        const timeLeft = gameState.questResetTime - now;
        
        if (timeLeft < 0) {
            checkMandatoryQuest();
            resetQuests();
            setQuestResetTime();
            generateDailyQuests();
            completedAll.style.display = 'none';
        }
        
        const seconds = Math.floor(timeLeft / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
    
    // Weekly timer
    const weeklyTimer = setInterval(() => {
        const now = Date.now();
        const timeLeft = gameState.weeklyResetTime - now;
        
        if (timeLeft < 0) {
            showWeeklyReport();
            resetWeeklyQuest();
            setWeeklyResetTime();
        }
        
        const seconds = Math.floor(timeLeft / 1000);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        weeklyTimerElement.textContent = `${days}д ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// Reset quests
function resetQuests() {
    gameState.dailyQuests = [];
    gameState.replaceCount = gameState.maxReplaceCount;
    gameState.mandatoryQuestIndex = -1;
    generateDailyQuests();
    saveGame();
    
    // Добавляем событие в ленту
    addEvent('🔄 Обновлены ежедневные квесты', 'info');
    showNotification('🔄 Обновление!', 'Появились новые ежедневные квесты', 'info');
}

// Экспортируем функции в window для использования в других модулях
window.showNotification = showNotification;
window.addEvent = addEvent;
window.updateStats = updateStats;
window.generateDailyQuests = generateDailyQuests;
window.updateCoinsDisplay = updateCoinsDisplay;

// Initialize the game when page loads
window.addEventListener('DOMContentLoaded', initGame);



// Обработчики для авторизации
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Инициализация обработчиков авторизации...');
  console.log('authManager:', window.authManager);
  console.log('api:', window.api);
  console.log('showNotification:', typeof window.showNotification);
  
  // Проверяем, что все модули загружены
  if (!window.authManager) {

    // Game state
    const gameState = {
      level: 1,
      attributes: {
        strength: 1,
        agility: 1,
        perception: 1,
        stamina: 1,
        intelligence: 1,
      },
      totalPoints: 5,
      pointsToNextLevel: 10,
      currentPoints: 0,
      dailyQuests: [],
      weeklyQuest: null,
      questResetTime: null,
      weeklyResetTime: null,
      status: null,
      profession: null,
      replaceCount: 3,
      maxAttributeValue: 500,
      mandatoryQuestIndex: -1,
      consecutiveDays: 0,
      disciplineLevel: 0,
      weeklyStats: {
        strength: { points: 0, actions: [] },
        agility: { points: 0, actions: [] },
        perception: { points: 0, actions: [] },
        stamina: { points: 0, actions: [] },
        intelligence: { points: 0, actions: [] },
      },
      currentQuestIndex: -1,
      level150Achieved: false,
      coins: 0,
      chestsBought: [],
      maxReplaceCount: 3,
      maxDailyQuests: 6,
      noMandatoryPenalty: false,
      expMultiplier: 1,
      tempBonuses: [],
      events: [],
      theme: 'dark',
      customQuests: [],
      userId: null, // NEW: ID пользователя
      userCode: null, // NEW: Кодовое слово пользователя
    };

    // Экспортируем gameState в window для глобального доступа
    window.gameState = gameState;

    // Обновляем функцию сохранения игры
    gameState.saveGame = async function () {
      if (window.api && window.api.token) {
        const result = await window.api.saveGameProgress(gameState);
        if (result.success) {
          console.log('✅ Прогресс сохранен в облако');
        } else {
          console.warn('⚠️ Не удалось сохранить в облако, сохраняю локально');
          localStorage.setItem(
            'soloLevelingGameState',
            JSON.stringify(gameState),
          );
        }
      } else {
        localStorage.setItem(
          'soloLevelingGameState',
          JSON.stringify(gameState),
        );
      }
    };

    // Автосохранение каждые 30 секунд
    setInterval(() => {
      if (gameState) {
        gameState.saveGame();
      }
    }, 30000);

    // Weekly quests database
    const weeklyQuests = [
      {
        title: 'Проведи целый день без телефона и интернета',
        desc: 'Отключи все цифровые устройства на 24 часа',
      },
      {
        title: 'Откажись от сахара на 3 дня',
        desc: 'Не употребляй сахар в любом виде в течение 3 дней',
      },
      {
        title: 'Прочитай книгу',
        desc: 'Прочитай книгу объемом не менее 200 страниц',
      },
      {
        title: 'Принимай холодный душ каждое утро 5 дней подряд',
        desc: 'Начинай каждое утро с холодного душа',
      },
      {
        title: '5 дней подряд просыпайся в 6 утра',
        desc: 'Вставай в 6 утра независимо от дня недели',
      },
      {
        title: 'Выполни утреннюю пробежку на 7 км',
        desc: 'Пробеги 7 км за одну тренировку',
      },
      {
        title: 'Выучи новый навык за 7 дней',
        desc: 'Освой базовый уровень нового навыка за неделю',
      },
    ];

    // Database of quests (20 per attribute)
    const questsDatabase = {
      strength: [
        {
          title: '100 отжиманий',
          desc: 'Выполните {count} отжиманий за один подход',
          points: 3,
          base: 100,
        },
        {
          title: '50 приседаний',
          desc: 'Выполните {count} приседаний без перерыва',
          points: 2,
          base: 50,
        },
        {
          title: '20 подтягиваний',
          desc: 'Выполните {count} подтягиваний (можно с перерывами)',
          points: 3,
          base: 20,
        },
        {
          title: '3 минуты планки',
          desc: 'Удерживайте положение планки {count} минут',
          points: 2,
          base: 3,
        },
        {
          title: '50 выпадов',
          desc: 'Выполните {count} выпадов (по {half} на каждую ногу)',
          points: 2,
          base: 50,
        },
        {
          title: '30 отжиманий на стуле',
          desc: 'Выполните {count} отжиманий с использованием стула',
          points: 2,
          base: 30,
        },
        {
          title: '100 скручиваний',
          desc: 'Выполните {count} скручиваний на пресс',
          points: 3,
          base: 100,
        },
        {
          title: '40 приседаний с прыжком',
          desc: 'Выполните {count} приседаний с выпрыгиванием',
          points: 3,
          base: 40,
        },
        {
          title: '5 минут упражнений с эспандером',
          desc: 'Тренируйте руки с эспандером {count} минут',
          points: 2,
          base: 5,
        },
        {
          title: '30 подъемов ног',
          desc: 'Выполните {count} подъемов ног лежа на спине',
          points: 2,
          base: 30,
        },
        {
          title: '20 отжиманий с хлопком',
          desc: 'Выполните {count} взрывных отжиманий с хлопком',
          points: 3,
          base: 20,
        },
        {
          title: '40 подъемов на носки',
          desc: 'Выполните {count} подъемов на носки для икр',
          points: 1,
          base: 40,
        },
        {
          title: '25 бёрпи',
          desc: 'Выполните {count} бёрпи (можно с перерывами)',
          points: 3,
          base: 25,
        },
        {
          title: '15 подтягиваний широким хватом',
          desc: 'Выполните {count} подтягиваний широким хватом',
          points: 3,
          base: 15,
        },
        {
          title: '60 секунд стульчик у стены',
          desc: "Удерживайте позицию 'стульчик' у стены {count} секунд",
          points: 2,
          base: 60,
        },
        {
          title: '40 скручиваний с поворотом',
          desc: 'Выполните {count} скручиваний с поворотом корпуса',
          points: 2,
          base: 40,
        },
        {
          title: '30 отжиманий узким хватом',
          desc: 'Выполните {count} отжиманий с узкой постановкой рук',
          points: 2,
          base: 30,
        },
        {
          title: '50 подъемов корпуса',
          desc: 'Выполните {count} подъемов корпуса для пресса',
          points: 2,
          base: 50,
        },
        {
          title: '20 отжиманий с ногами на возвышении',
          desc: 'Выполните {count} отжиманий с ногами на стуле',
          points: 3,
          base: 20,
        },
        {
          title: '100 подъемов гантелей',
          desc: 'Выполните {count} подъемов гантелей (любое упражнение)',
          points: 3,
          base: 100,
        },
      ],
      agility: [
        {
          title: '1000 прыжков на скакалке',
          desc: 'Выполните {count} прыжков на скакалке',
          points: 3,
          base: 1000,
        },
        {
          title: '15 минут танцев',
          desc: 'Танцуйте под любимую музыку {count} минут',
          points: 2,
          base: 15,
        },
        {
          title: '20 минут йоги',
          desc: 'Практикуйте йогу {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '30 боксерских ударов',
          desc: 'Выполните {count} боксерских комбинаций в воздухе',
          points: 2,
          base: 30,
        },
        {
          title: '10 минут прыжков джек',
          desc: 'Выполняйте прыжки джек {count} минут',
          points: 3,
          base: 10,
        },
        {
          title: '5 минут прыжков на одной ноге',
          desc: 'Прыгайте на одной ноге {count} минут (по {half} на каждую)',
          points: 2,
          base: 5,
        },
        {
          title: '15 минут зумбы',
          desc: 'Занимайтесь зумбой или активными танцами {count} минут',
          points: 2,
          base: 15,
        },
        {
          title: '30 выпадов с прыжком',
          desc: 'Выполните {count} выпадов с прыжком и сменой ног',
          points: 3,
          base: 30,
        },
        {
          title: '40 боковых прыжков',
          desc: 'Выполните {count} прыжков в стороны через линию',
          points: 2,
          base: 40,
        },
        {
          title: '20 минут упражнений на растяжку',
          desc: 'Выполняйте упражнения на растяжку {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '50 прыжков через скамью',
          desc: 'Прыгайте через небольшую преграду {count} раз',
          points: 3,
          base: 50,
        },
        {
          title: '10 минут бега на месте',
          desc: 'Бегайте на месте в высоком темпе {count} минут',
          points: 2,
          base: 10,
        },
        {
          title: '30 скручиваний корпуса',
          desc: 'Выполните {count} быстрых скручиваний корпуса стоя',
          points: 2,
          base: 30,
        },
        {
          title: '15 минут упражнений с резиновой лентой',
          desc: 'Тренируйтесь с резиновой лентой {count} минут',
          points: 2,
          base: 15,
        },
        {
          title: '40 приставных шагов',
          desc: 'Выполните {count} приставных шагов в каждую сторону',
          points: 2,
          base: 40,
        },
        {
          title: '20 прыжков в длину',
          desc: 'Выполните {count} прыжков в длину с места',
          points: 2,
          base: 20,
        },
        {
          title: '10 минут упражнений на координацию',
          desc: 'Выполняйте упражнения на координацию {count} минут',
          points: 2,
          base: 10,
        },
        {
          title: '30 махов ногами',
          desc: 'Выполните {count} махов ногами вперед-назад и в стороны',
          points: 2,
          base: 30,
        },
        {
          title: '15 минут тенниса с стеной',
          desc: 'Играйте в теннис со стеной {count} минут',
          points: 3,
          base: 15,
        },
        {
          title: '50 прыжков с поворотом',
          desc: 'Выполните {count} прыжков с поворотом на 180 градусов',
          points: 3,
          base: 50,
        },
      ],
      perception: [
        {
          title: '15 минут медитации',
          desc: 'Медитируйте {count} минут, концентрируясь на дыхании',
          points: 2,
          base: 15,
        },
        {
          title: '10 минут осознанного наблюдения',
          desc: 'Наблюдайте за природой или окружением {count} минут',
          points: 2,
          base: 10,
        },
        {
          title: '20 минут без гаджетов',
          desc: 'Проведите {count} минут без телефона и компьютера',
          points: 2,
          base: 20,
        },
        {
          title: '30 минут прослушивания классики',
          desc: 'Внимательно слушайте классическую музыку {count} минут',
          points: 3,
          base: 30,
        },
        {
          title: 'Описать 10 предметов',
          desc: 'Выберите {count} предметов и подробно опишите каждый',
          points: 3,
          base: 10,
        },
        {
          title: '10 минут слепой ходьбы',
          desc: 'Пройдитесь по дому с закрытыми глазами {count} минут',
          points: 3,
          base: 10,
        },
        {
          title: '20 минут рисования',
          desc: 'Рисуйте что-либо, обращая внимание на детали, {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '15 минут ароматерапии',
          desc: 'Исследуйте разные ароматы с закрытыми глазами {count} минут',
          points: 2,
          base: 15,
        },
        {
          title: '30 минут чтения вслух',
          desc: 'Читайте книку вслух, обращая внимание на интонацию, {count} минут',
          points: 2,
          base: 30,
        },
        {
          title: 'Просмотр фильма без звука',
          desc: 'Посмотрите {count} минут фильма без звука, следите за визуалом',
          points: 2,
          base: 20,
        },
        {
          title: '10 минут дыхательных упражнений',
          desc: 'Практикуйте глубокое дыхание {count} минут',
          points: 2,
          base: 10,
        },
        {
          title: '20 минут пазлов',
          desc: 'Соберите пазл или решите головоломку {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '15 минут наблюдения за животными',
          desc: 'Наблюдайте за домашними животными или птицами {count} минут',
          points: 2,
          base: 15,
        },
        {
          title: '30 минут без фонового шума',
          desc: 'Проведите {count} минут в полной тишине',
          points: 3,
          base: 30,
        },
        {
          title: '10 минут тактильных ощущений',
          desc: 'Исследуйте разные текстуры с закрытыми глазами {count} минут',
          points: 2,
          base: 10,
        },
        {
          title: '20 минут созерцания искусства',
          desc: 'Рассматривайте произведения искусства онлайн {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '15 минут ведения дневника',
          desc: 'Опишите свои ощущения и мысли за день {count} минут',
          points: 2,
          base: 15,
        },
        {
          title: '10 минут концентрации на пламени',
          desc: 'Смотрите на пламя свечи {count} минут',
          points: 2,
          base: 10,
        },
        {
          title: '20 минут без многозадачности',
          desc: 'Выполняйте только одно дело {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '30 минут на природе',
          desc: 'Проведите {count} минут на природе, обращая внимание на детали',
          points: 3,
          base: 30,
        },
      ],
      stamina: [
        {
          title: '20-минутная пробежка',
          desc: 'Пробегите в легком темпе {count} минут без остановки',
          points: 3,
          base: 20,
        },
        {
          title: '30 минут велосипеда',
          desc: 'Прокатитесь на велосипеде {count} минут',
          points: 3,
          base: 30,
        },
        {
          title: '40 минут быстрой ходьбы',
          desc: 'Идите быстрым шагом {count} минут',
          points: 3,
          base: 40,
        },
        {
          title: '15 минут плавания',
          desc: 'Плавайте в бассейне или открытой воде {count} минут',
          points: 3,
          base: 15,
        },
        {
          title: '60 минут работы в саду',
          desc: 'Поработайте в саду или на даче {count} минут',
          points: 3,
          base: 60,
        },
        {
          title: '30 минут активной уборки',
          desc: 'Выполняйте активную уборку дома {count} минут',
          points: 2,
          base: 30,
        },
        {
          title: '20 минут степ-аэробики',
          desc: 'Занимайтесь степ-аэробикой {count} минут',
          points: 3,
          base: 20,
        },
        {
          title: '45 минут пешей прогулки',
          desc: 'Гуляйте в среднем темпе {count} минут',
          points: 2,
          base: 45,
        },
        {
          title: '30 минут игры с детьми',
          desc: 'Активно играйте с детьми {count} минут',
          points: 2,
          base: 30,
        },
        {
          title: '20 минут ходьбы по лестнице',
          desc: 'Ходите вверх-вниз по лестнице {count} минут',
          points: 3,
          base: 20,
        },
        {
          title: '60 минут генеральной уборки',
          desc: 'Проведите генеральную уборку {count} минут',
          points: 3,
          base: 60,
        },
        {
          title: '30 минут танцевального фитнеса',
          desc: 'Занимайтесь танцевальным фитнесом {count} минут',
          points: 3,
          base: 30,
        },
        {
          title: '45 минут работы стоя',
          desc: 'Работайте стоя {count} минут (за столом, кухней и т.д.)',
          points: 2,
          base: 45,
        },
        {
          title: '20 минут круговой тренировки',
          desc: 'Выполните круговую тренировку {count} минут',
          points: 3,
          base: 20,
        },
        {
          title: '30 минут катания на роликах',
          desc: 'Катайтесь на роликах или коньках {count} минут',
          points: 3,
          base: 30,
        },
        {
          title: '60 минут работы на даче',
          desc: 'Поработайте на дачном участке {count} минут',
          points: 3,
          base: 60,
        },
        {
          title: '40 минут прогулки с собакой',
          desc: 'Гуляйте с собакой в активном темпе {count} минут',
          points: 2,
          base: 40,
        },
        {
          title: '25 минут аквааэробики',
          desc: 'Занимайтесь аквааэробикой в бассейне или ванне {count} минут',
          points: 3,
          base: 25,
        },
        {
          title: '35 минут скандинавской ходьбы',
          desc: 'Практикуйте скандинавскую ходьбу {count} минут',
          points: 3,
          base: 35,
        },
        {
          title: '50 минут работы по дому',
          desc: 'Выполняйте различные работы по дому {count} минут',
          points: 3,
          base: 50,
        },
      ],
      intelligence: [
        {
          title: '30 минут чтения',
          desc: 'Читайте книгу или научную статью {count} минут',
          points: 3,
          base: 30,
        },
        {
          title: '20 минут изучения языка',
          desc: 'Занимайтесь изучением нового языка {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '15 решения головоломок',
          desc: 'Решите несколько сложных головоломок за {count} минут',
          points: 2,
          base: 15,
        },
        {
          title: '30 минут документального фильма',
          desc: 'Посмотрите научно-популярный фильм {count} минут',
          points: 2,
          base: 30,
        },
        {
          title: '20 минут обучения новому навыку',
          desc: 'Потратьте {count} минут на изучение нового навыка',
          points: 2,
          base: 20,
        },
        {
          title: '40 минут написания текста',
          desc: 'Напишите статью, эссе или рассказ за {count} минут',
          points: 3,
          base: 40,
        },
        {
          title: '30 минут шахмат',
          desc: 'Сыграйте в шахматы (можно онлайн) {count} минут',
          points: 3,
          base: 30,
        },
        {
          title: '20 минут изучения истории',
          desc: 'Изучите исторический период или событие {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '25 минут программирования',
          desc: 'Поработайте над программистским проектом {count} минут',
          points: 3,
          base: 25,
        },
        {
          title: '30 минут анализа проблемы',
          desc: 'Проанализируйте сложную проблему и предложите решения за {count} минут',
          points: 3,
          base: 30,
        },
        {
          title: '20 минут ментальной арифметики',
          desc: 'Практикуйте устный счет и вычисления {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '40 минут онлайн-курса',
          desc: 'Пройдите часть онлайн-курса по новой теме за {count} минут',
          points: 3,
          base: 40,
        },
        {
          title: '30 минут стратегической игры',
          desc: 'Сыграйте в стратегическую игру (шахматы, го и т.д.) {count} минут',
          points: 2,
          base: 30,
        },
        {
          title: '20 минут запоминания',
          desc: 'Попрактикуйте техники запоминания {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '30 минут изучения карты',
          desc: 'Изучите географическую карту нового региона {count} минут',
          points: 2,
          base: 30,
        },
        {
          title: '25 минут научного подкаста',
          desc: 'Прослушайте научно-популярный подкаст {count} минут',
          points: 2,
          base: 25,
        },
        {
          title: '20 минут кроссвордов',
          desc: 'Решите кроссворд или сканворд за {count} минут',
          points: 2,
          base: 20,
        },
        {
          title: '40 минут изучения искусства',
          desc: 'Изучите творчество какого-либо художника {count} минут',
          points: 2,
          base: 40,
        },
        {
          title: '30 минут финансового планирования',
          desc: 'Займитесь финансовым планированием и анализом {count} минут',
          points: 3,
          base: 30,
        },
        {
          title: '25 минут философских размышлений',
          desc: 'Размышляйте на философскую тему {count} минут',
          points: 2,
          base: 25,
        },
      ],
    };

    // Обязательные квесты
    const mandatoryQuests = [
      {
        title: 'Проведи 30 минут на свежем воздухе',
        desc: 'Выйди на улицу и проведи время на природе',
        points: 0,
      },
      {
        title: 'Выпей 2 литра воды',
        desc: 'Соблюди водный баланс в течение дня',
        points: 0,
      },
      {
        title: 'Сделай 5 добрых дел',
        desc: 'Помоги другим людям или животным',
        points: 0,
      },
      {
        title: 'Спи не менее 7 часов',
        desc: 'Обеспечь себе полноценный ночной сон',
        points: 0,
      },
      {
        title: 'Запиши 3 благодарности',
        desc: 'Запиши три вещи, за которые ты благодарен сегодня',
        points: 0,
      },
    ];

    // Достижения дисциплины
    const disciplineLevels = [
      { name: 'Новичок', days: 7, title: 'Знаток дисциплины' },
      { name: 'Знаток', days: 14, title: 'Эксперт дисциплины' },
      { name: 'Эксперт', days: 21, title: 'Мастер дисциплины' },
      { name: 'Мастер', days: 28, title: 'Бог дисциплины', max: true },
    ];

    // Описания характеристик
    const attributeDescriptions = {
      strength:
        'Физическая мощь и мышечная развитость. Влияет на выполнение силовых упражнений и физической работы.',
      agility:
        'Координация, скорость реакции и гибкость. Важна для спортивных и подвижных задач, требующих ловкости.',
      perception:
        'Осознанность, внимание к деталям и способность замечать изменения. Развивает наблюдательность и чувствительность к окружению.',
      stamina:
        'Способность выдерживать длительные нагрузки без усталости. Увеличивает работоспособность и выносливость в повседневных задачах.',
      intelligence:
        'Умственные способности, логика и обучаемость. Помогает в решении сложных задач, обучении новым навыкам и анализе информации.',
    };

    // Описания сундуков
    const chestDescriptions = {
      common: 'Сюрприз от системы',
      rare: 'Подарок от системы',
      epic: 'Благославение системы',
      legendary: 'Любимчик системы',
    };

    // DOM elements
    const levelElement = document.getElementById('level');
    const levelProgressBar = document.getElementById('level-progress-bar');
    const levelProgressContainer = document.getElementById(
      'level-progress-container',
    );
    const attributeCards = {
      strength: document.getElementById('strength-card'),
      agility: document.getElementById('agility-card'),
      perception: document.getElementById('perception-card'),
      stamina: document.getElementById('stamina-card'),
      intelligence: document.getElementById('intelligence-card'),
    };
    const attributeValues = document.querySelectorAll('.attribute-value');
    const progressBars = document.querySelectorAll('.progress-bar');
    const questsContainer = document.getElementById('quests-container');
    const achievementCards = {
      status: document.getElementById('status-achievement'),
      profession: document.getElementById('profession-achievement'),
      rules: document.getElementById('rules-achievement'),
      master: document.getElementById('master-achievement'),
    };
    const startButton = document.getElementById('start-btn');
    const questsSection = document.getElementById('quests-section');
    const timerElement = document.getElementById('timer');
    const statusIndicator = document.getElementById('status-indicator');
    const professionIndicator = document.getElementById('profession-indicator');
    const replaceQuestBtn = document.getElementById('replace-quest-btn');
    const addCustomQuestBtn = document.getElementById('add-custom-quest-btn');
    const replaceConfirmModal = document.getElementById(
      'replace-confirm-modal',
    );
    const replaceModalText = document.getElementById('replace-modal-text');
    const confirmReplaceBtn = document.getElementById('confirm-replace-btn');
    const cancelReplaceBtn = document.getElementById('cancel-replace-btn');
    const customQuestModal = document.getElementById('custom-quest-modal');
    const customQuestTitle = document.getElementById('custom-quest-title');
    const customQuestDesc = document.getElementById('custom-quest-desc');
    const saveCustomQuestBtn = document.getElementById('save-custom-quest-btn');
    const cancelCustomQuestBtn = document.getElementById(
      'cancel-custom-quest-btn',
    );
    const statusModal = document.getElementById('status-modal');
    const professionModal = document.getElementById('profession-modal');
    const professionMessage = document.getElementById('profession-message');
    const punishmentModal = document.getElementById('punishment-modal');
    const punishmentMessage = document.getElementById('punishment-message');
    const weeklyQuestTitle = document.getElementById('weekly-quest-title');
    const weeklyQuestDesc = document.getElementById('weekly-quest-desc');
    const weeklyQuestBtn = document.getElementById('weekly-quest-btn');
    const weeklyTimerElement = document.getElementById('weekly-timer');
    const weeklyQuestCard = document.getElementById('weekly-quest-card');
    const sundayNotice = document.getElementById('sunday-notice');
    const weekReport = document.getElementById('week-report');
    const weekReportContent = document.getElementById('week-report-content');
    const completedAll = document.getElementById('completed-all');
    const confirmQuestModal = document.getElementById('confirm-quest-modal');
    const confirmQuestMessage = document.getElementById(
      'confirm-quest-message',
    );
    const confirmQuestBtn = document.getElementById('confirm-quest-btn');
    const cancelQuestBtn = document.getElementById('cancel-quest-btn');
    const attributeModal = document.getElementById('attribute-modal');
    const attributeModalTitle = document.getElementById(
      'attribute-modal-title',
    );
    const attributeModalDesc = document.getElementById('attribute-modal-desc');
    const achievementModal = document.getElementById('achievement-info-modal');
    const achievementModalTitle = document.getElementById(
      'achievement-modal-title',
    );
    const achievementModalDesc = document.getElementById(
      'achievement-modal-desc',
    );
    const coinsElement = document.getElementById('coins');
    const walletElement = document.getElementById('wallet');
    const levelContainer = document.getElementById('level-container');
    const shopItemModal = document.getElementById('shop-item-modal');
    const shopItemTitle = document.getElementById('shop-item-title');
    const shopItemContent = document.getElementById('shop-item-content');
    const shopItemPrice = document.getElementById('shop-item-price');
    const confirmBuyBtn = document.getElementById('confirm-buy-btn');
    const cancelBuyBtn = document.getElementById('cancel-buy-btn');
    const levelInfoModal = document.getElementById('level-info-modal');
    const levelInfoContent = document.getElementById('level-info-content');
    const shopGrid = document.getElementById('shop-grid');
    const eventsList = document.getElementById('events-list');
    const notificationsContainer = document.getElementById(
      'notifications-container',
    );
    const themeToggle = document.getElementById('theme-toggle');
    const loginModal = document.getElementById('login-modal');
    const userCodeInput = document.getElementById('user-code');
    const loginBtn = document.getElementById('login-btn');
    const generateCodeBtn = document.getElementById('generate-code-btn');
    const userInfo = document.getElementById('user-info');
    const userIdDisplay = document.getElementById('user-id-display');
    const logoutBtn = document.getElementById('logout-btn');
    const weeklyConfirmModal = document.getElementById('weekly-confirm-modal');
    const weeklyConfirmMessage = document.getElementById(
      'weekly-confirm-message',
    );
    const confirmWeeklyBtn = document.getElementById('confirm-weekly-btn');
    const cancelWeeklyBtn = document.getElementById('cancel-weekly-btn');
    const rulesModal = document.getElementById('rules-modal');
    const closeRulesBtn = document.getElementById('close-rules-modal');

    // NEW: Система пользователей
    let currentUser = null;

    // Generate random user ID
    function generateUserId() {
      return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    // Generate easy-to-remember code
    function generateEasyCode() {
      const adjectives = [
        'быстрый',
        'умный',
        'сильный',
        'ловкий',
        'стойкий',
        'смелый',
        'яркий',
        'тихий',
        'горячий',
        'холодный',
      ];
      const nouns = [
        'тигр',
        'орел',
        'волк',
        'дракон',
        'феникс',
        'леопард',
        'ястреб',
        'медведь',
        'лев',
        'единорог',
      ];
      const numbers = Math.floor(100 + Math.random() * 900);

      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];

      return `${adj}_${noun}_${numbers}`;
    }

    // Save user data
    function saveUserData(userId, userCode, data) {
      const userKey = `user_${userId}`;
      const userData = {
        userId: userId,
        userCode: userCode,
        data: data,
        lastLogin: Date.now(),
      };

      localStorage.setItem(userKey, JSON.stringify(userData));

      // Также сохраняем mapping code->userId для быстрого поиска
      const codeMap = JSON.parse(localStorage.getItem('userCodeMap') || '{}');
      codeMap[userCode] = userId;
      localStorage.setItem('userCodeMap', JSON.stringify(codeMap));
    }

    // Load user data
    function loadUserData(userId) {
      const userKey = `user_${userId}`;
      const userData = localStorage.getItem(userKey);

      if (userData) {
        return JSON.parse(userData);
      }

      return null;
    }

    // Find user by code
    function findUserByCode(code) {
      const codeMap = JSON.parse(localStorage.getItem('userCodeMap') || '{}');
      const userId = codeMap[code];

      if (userId) {
        return loadUserData(userId);
      }

      return null;
    }

    // Login user
    function loginUser(userCode) {
      let userData = findUserByCode(userCode);

      if (!userData) {
        // Create new user
        const userId = generateUserId();
        userData = {
          userId: userId,
          userCode: userCode,
          data: { ...gameState },
          lastLogin: Date.now(),
        };

        saveUserData(userId, userCode, gameState);
        showNotification(
          '👋 Добро пожаловать!',
          'Создан новый аккаунт',
          'success',
        );
      } else {
        // Load existing user data
        Object.assign(gameState, userData.data);
        showNotification(
          '👋 С возвращением!',
          'Ваш прогресс загружен',
          'success',
        );
      }

      currentUser = userData.userId;
      gameState.userId = userData.userId;
      gameState.userCode = userData.userCode;

      // Update UI
      userIdDisplay.textContent = userData.userCode;
      userInfo.style.display = 'flex';
      loginModal.style.display = 'none';

      // Save to session for quick access
      sessionStorage.setItem('currentUserId', userData.userId);

      // Initialize game with loaded data
      initGameWithData();
    }

    // Logout user
    function logoutUser() {
      // Save current progress before logout
      if (currentUser) {
        saveUserData(currentUser, gameState.userCode, gameState);
      }

      currentUser = null;
      gameState.userId = null;
      gameState.userCode = null;

      // Clear session
      sessionStorage.removeItem('currentUserId');

      // Reset UI
      userInfo.style.display = 'none';
      loginModal.style.display = 'flex';

      // Reset game state to defaults (but keep in memory for new login)
      Object.assign(gameState, {
        level: 1,
        attributes: {
          strength: 1,
          agility: 1,
          perception: 1,
          stamina: 1,
          intelligence: 1,
        },
        totalPoints: 5,
        pointsToNextLevel: 10,
        currentPoints: 0,
        dailyQuests: [],
        weeklyQuest: null,
        questResetTime: null,
        weeklyResetTime: null,
        status: null,
        profession: null,
        replaceCount: 3,
        maxAttributeValue: 500,
        mandatoryQuestIndex: -1,
        consecutiveDays: 0,
        disciplineLevel: 0,
        weeklyStats: {
          strength: { points: 0, actions: [] },
          agility: { points: 0, actions: [] },
          perception: { points: 0, actions: [] },
          stamina: { points: 0, actions: [] },
          intelligence: { points: 0, actions: [] },
        },
        currentQuestIndex: -1,
        level150Achieved: false,
        coins: 0,
        chestsBought: [],
        maxReplaceCount: 3,
        maxDailyQuests: 6,
        noMandatoryPenalty: false,
        expMultiplier: 1,
        tempBonuses: [],
        events: [],
        theme: 'dark',
        customQuests: [],
        userId: null,
        userCode: null,
      });

      showNotification('👋 До свидания!', 'Вы вышли из системы', 'info');
    }

    // Check auto-login
    function checkAutoLogin() {
      const savedUserId = sessionStorage.getItem('currentUserId');

      if (savedUserId) {
        const userData = loadUserData(savedUserId);
        if (userData) {
          currentUser = userData.userId;
          Object.assign(gameState, userData.data);

          // Update UI
          userIdDisplay.textContent = userData.userCode;
          userInfo.style.display = 'flex';

          initGameWithData();
          return true;
        }
      }

      return false;
    }

    // Initialize game with loaded data
    function initGameWithData() {
      checkSundayBonus();
      setupEventListeners();
      startTimers();
      generateDailyQuests();
      generateWeeklyQuest();
      updateStats();
      updateReplaceCounter();
      updateCoinsDisplay();
      renderEvents();
      applyTheme();

      // Add login event
      addEvent(`🔑 Вход в систему: ${gameState.userCode}`, 'info');
    }

    // Initialize game
    function initGame() {
      // Check if user is already logged in
      if (!checkAutoLogin()) {
        // Show login modal
        loginModal.style.display = 'flex';
      }

      // Setup login event listeners
      setupLoginListeners();
    }

    // Setup login event listeners
    function setupLoginListeners() {
      loginBtn.addEventListener('click', function () {
        const code = userCodeInput.value.trim();

        if (code.length < 4) {
          alert('Кодовое слово должно содержать минимум 4 символа');
          return;
        }

        loginUser(code);
      });

      generateCodeBtn.addEventListener('click', function () {
        const easyCode = generateEasyCode();
        userCodeInput.value = easyCode;
        showNotification('✨ Сгенерирован код', `Ваш код: ${easyCode}`, 'info');
      });

      logoutBtn.addEventListener('click', logoutUser);

      // Allow Enter key to login
      userCodeInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          loginBtn.click();
        }
      });
    }

    // Save game state
    function saveGame() {
      if (currentUser) {
        saveUserData(currentUser, gameState.userCode, gameState);
      }
    }

    // Load game state from localStorage
    function loadGame() {
      // Already loaded in loginUser or checkAutoLogin
      return;
    }

    // Apply theme
    function applyTheme() {
      if (gameState.theme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.querySelector('i').classList.remove('fa-moon');
        themeToggle.querySelector('i').classList.add('fa-sun');
      } else {
        document.body.classList.remove('light-theme');
        themeToggle.querySelector('i').classList.remove('fa-sun');
        themeToggle.querySelector('i').classList.add('fa-moon');
      }
    }

    // Toggle theme
    function toggleTheme() {
      if (gameState.theme === 'dark') {
        gameState.theme = 'light';
      } else {
        gameState.theme = 'dark';
      }
      applyTheme();
      saveGame();
    }

    // Check if it's Sunday for bonus
    function checkSundayBonus() {
      const today = new Date();
      if (today.getDay() === 0) {
        // 0 = Sunday
        sundayNotice.style.display = 'block';
        document.querySelectorAll('.section').forEach((section) => {
          section.classList.add('sunday');
        });
      }
    }

    // Set quest reset time (next 24 hours)
    function setQuestResetTime() {
      const now = Date.now();
      gameState.questResetTime = now + 24 * 60 * 60 * 1000;
      saveGame();
    }

    // Set weekly quest reset time (next 7 days)
    function setWeeklyResetTime() {
      const now = Date.now();
      gameState.weeklyResetTime = now + 7 * 24 * 60 * 60 * 1000;
      saveGame();
    }

    // Update replace quest counter display
    function updateReplaceCounter() {
      replaceQuestBtn.disabled = gameState.replaceCount <= 0;
    }

    // Update coins display
    function updateCoinsDisplay() {
      coinsElement.textContent = gameState.coins;
    }

    // Generate daily quests
    function generateDailyQuests() {
      questsContainer.innerHTML = '';

      if (gameState.dailyQuests && gameState.dailyQuests.length > 0) {
        gameState.dailyQuests.forEach((quest, index) => {
          const questCard = createQuestCard(quest, index);
          questsContainer.appendChild(questCard);
        });
        return;
      }

      gameState.dailyQuests = [];

      // Обычные квесты (количество зависит от купленных сундуков)
      const regularQuestCount = gameState.maxDailyQuests - 1; // Один слот для обязательного квеста

      // Выбираем случайные атрибуты для квестов
      const attributes = Object.keys(questsDatabase);
      for (let i = 0; i < regularQuestCount; i++) {
        const attribute = attributes[i % attributes.length];
        const quests = questsDatabase[attribute];
        const randomIndex = Math.floor(Math.random() * quests.length);
        const baseQuest = quests[randomIndex];

        // Рассчитываем сложность на основе уровня
        const difficultyMultiplier = 1 + Math.floor(gameState.level / 10) * 0.1;
        const adjustedCount = Math.round(baseQuest.base * difficultyMultiplier);

        // Форматируем описание
        let desc = baseQuest.desc.replace('{count}', adjustedCount);
        desc = desc.replace('{half}', Math.round(adjustedCount / 2));

        // ИСПРАВЛЕНО: Шанс 50% на получение монеты
        const coinReward = Math.random() < 0.5;

        const quest = {
          title: baseQuest.title,
          desc: desc,
          points: baseQuest.points,
          attribute: attribute,
          completed: false,
          mandatory: false,
          base: baseQuest.base,
          adjustedCount: adjustedCount,
          coinReward: coinReward,
        };

        gameState.dailyQuests.push(quest);
      }

      // Обязательный квест
      const mandatoryIndex = Math.floor(Math.random() * mandatoryQuests.length);
      const mandatoryQuest = mandatoryQuests[mandatoryIndex];
      gameState.dailyQuests.push({
        title: mandatoryQuest.title,
        desc: mandatoryQuest.desc,
        points: mandatoryQuest.points,
        attribute: 'all',
        completed: false,
        mandatory: true,
        coinReward: false,
      });

      gameState.mandatoryQuestIndex = gameState.maxDailyQuests - 1;

      // NEW: Добавляем пользовательские квесты
      if (gameState.customQuests && gameState.customQuests.length > 0) {
        gameState.customQuests.forEach((quest) => {
          if (!quest.completed) {
            gameState.dailyQuests.push({
              ...quest,
              custom: true,
            });
          }
        });
      }

      gameState.dailyQuests.forEach((quest, index) => {
        const questCard = createQuestCard(quest, index);
        questsContainer.appendChild(questCard);
      });

      saveGame();
      updateReplaceCounter();
    }

    // Create quest card DOM element
    function createQuestCard(quest, index) {
      const questCard = document.createElement('div');
      questCard.className = 'quest-card';
      questCard.dataset.index = index;

      if (quest.mandatory) {
        questCard.classList.add('mandatory-quest');
      } else if (quest.custom) {
        questCard.classList.add('custom-quest');
      }

      let rewardText = quest.mandatory
        ? 'Избежит наказания'
        : `+${quest.points} к ${getAttributeName(quest.attribute)}`;

      // NEW: Для пользовательских квестов специальная награда
      if (quest.custom) {
        rewardText = '+1 ко всем характеристикам';
      }

      if (quest.coinReward || quest.custom) {
        rewardText += ` <span class="coin-icon">+1 L</span>`;
      }

      questCard.innerHTML = `
        ${quest.mandatory ? '<div class="mandatory-label">⚠️ Обязательный</div>' : ''}
        ${quest.custom ? '<div class="custom-label">✨ Свой квест</div>' : ''}
        <div class="quest-title">${quest.title}</div>
        <div class="quest-desc">${quest.desc}</div>
        <div class="quest-reward">
            <i class="fas fa-plus-circle"></i> ${rewardText}
        </div>
        <button class="quest-btn ${quest.completed ? 'completed' : ''}" 
                data-attribute="${quest.attribute}" 
                data-points="${quest.points}"
                data-coin="${quest.coinReward || quest.custom}"
                data-index="${index}">
            ${quest.completed ? 'Выполнено!' : 'Выполнить'}
        </button>
    `;
      return questCard;
    }

    // Generate weekly quest
    function generateWeeklyQuest() {
      if (gameState.weeklyQuest) {
        weeklyQuestTitle.textContent = gameState.weeklyQuest.title;
        weeklyQuestDesc.textContent = gameState.weeklyQuest.desc;
        weeklyQuestBtn.textContent = gameState.weeklyQuest.completed
          ? 'Выполнено!'
          : 'Выполнить';
        weeklyQuestBtn.classList.toggle(
          'completed',
          gameState.weeklyQuest.completed,
        );
        return;
      }

      const randomIndex = Math.floor(Math.random() * weeklyQuests.length);
      gameState.weeklyQuest = {
        ...weeklyQuests[randomIndex],
        completed: false,
      };

      weeklyQuestTitle.textContent = gameState.weeklyQuest.title;
      weeklyQuestDesc.textContent = gameState.weeklyQuest.desc;
      weeklyQuestBtn.textContent = 'Выполнить';
      weeklyQuestBtn.classList.remove('completed');

      saveGame();
    }

    function getAttributeName(attr) {
      const names = {
        strength: 'Силе',
        agility: 'Ловкости',
        perception: 'Восприятию',
        stamina: 'Выносливости',
        intelligence: 'Интеллекту',
        all: 'всем характеристикам',
      };
      return names[attr] || attr;
    }

    // Show replace confirmation modal
    function showReplaceConfirmModal() {
      if (gameState.replaceCount <= 0) {
        alert(
          'У вас больше нет доступных замен квестов, подождите завтрашний день',
        );
        return;
      }

      replaceModalText.innerHTML = `У вас осталось <strong>${gameState.replaceCount}</strong> замен. Вы уверены, что хотите заменить квест?`;
      replaceConfirmModal.style.display = 'flex';
    }

    // Hide replace confirmation modal
    function hideReplaceConfirmModal() {
      replaceConfirmModal.style.display = 'none';
    }

    // NEW: Показать модальное окно создания квеста
    function showCustomQuestModal() {
      customQuestTitle.value = '';
      customQuestDesc.value = '';
      customQuestModal.style.display = 'flex';
    }

    // NEW: Скрыть модальное окно создания квеста
    function hideCustomQuestModal() {
      customQuestModal.style.display = 'none';
    }

    // NEW: Сохранить пользовательский квест
    function saveCustomQuest() {
      const title = customQuestTitle.value.trim();
      const desc = customQuestDesc.value.trim();

      if (!title) {
        alert('Пожалуйста, введите название квеста');
        return;
      }

      if (!desc) {
        alert('Пожалуйста, введите описание квеста');
        return;
      }

      const customQuest = {
        title: title,
        desc: desc,
        points: 1,
        attribute: 'all',
        completed: false,
        custom: true,
        coinReward: true,
      };

      // Добавляем квест в массив пользовательских квестов
      if (!gameState.customQuests) {
        gameState.customQuests = [];
      }
      gameState.customQuests.push(customQuest);

      // Добавляем квест в список ежедневных квестов
      gameState.dailyQuests.push(customQuest);

      // Обновляем отображение квестов
      generateDailyQuests();
      saveGame();
      hideCustomQuestModal();

      // Добавляем событие в ленту
      addEvent(`✨ Создан новый квест: "${title}"`, 'info');
      showNotification(
        '✨ Новый квест!',
        'Вы создали свой собственный квест',
        'success',
      );
    }

    // NEW: Показать подтверждение выполнения еженедельного квеста
    function showWeeklyConfirmModal() {
      if (gameState.weeklyQuest.completed) {
        alert('Вы уже выполнили этот еженедельный квест!');
        return;
      }

      weeklyConfirmMessage.textContent = `Вы подтверждаете, что завершили еженедельный квест "${gameState.weeklyQuest.title}"?`;
      weeklyConfirmModal.style.display = 'flex';
    }

    // NEW: Скрыть подтверждение выполнения еженедельного квеста
    function hideWeeklyConfirmModal() {
      weeklyConfirmModal.style.display = 'none';
    }

    // Activate quest replace mode
    function activateReplaceMode() {
      questsContainer.classList.add('replace-mode');
      hideReplaceConfirmModal();

      // Добавляем обработчики для выбора квеста для замены
      const questCards = document.querySelectorAll('.quest-card');
      questCards.forEach((card) => {
        card.addEventListener('click', handleQuestSelectionForReplacement);
      });

      showNotification('🔁 Режим замены', 'Выберите квест для замены', 'info');
    }

    // Handle quest selection for replacement
    function handleQuestSelectionForReplacement(event) {
      const questCard = event.currentTarget;
      const questIndex = parseInt(questCard.dataset.index);

      // Отменяем замену если кликнули на кнопку выполнения
      if (event.target.classList.contains('quest-btn')) {
        return;
      }

      // NEW: Нельзя заменить пользовательские квесты
      if (gameState.dailyQuests[questIndex].custom) {
        alert('Этот квест создан вами и не может быть заменен!');
        return;
      }

      replaceQuest(questCard, questIndex);

      // Удаляем обработчики после замена
      const questCards = document.querySelectorAll('.quest-card');
      questCards.forEach((card) => {
        card.removeEventListener('click', handleQuestSelectionForReplacement);
      });

      questsContainer.classList.remove('replace-mode');
    }

    // Replace a quest
    function replaceQuest(questCard, questIndex) {
      if (
        questIndex === gameState.mandatoryQuestIndex &&
        !gameState.noMandatoryPenalty
      ) {
        alert('Этот квест обязательный! Его нельзя заменить.');
        return;
      }

      const attribute = gameState.dailyQuests[questIndex].attribute;
      const quests = questsDatabase[attribute];

      const randomIndex = Math.floor(Math.random() * quests.length);
      const baseQuest = quests[randomIndex];

      // Рассчитываем сложность на основе уровня
      const difficultyMultiplier = 1 + Math.floor(gameState.level / 10) * 0.1;
      const adjustedCount = Math.round(baseQuest.base * difficultyMultiplier);

      // Форматируем описание
      let desc = baseQuest.desc.replace('{count}', adjustedCount);
      desc = desc.replace('{half}', Math.round(adjustedCount / 2));

      // ИСПРАВЛЕНО: Шанс 50% на получение монеты
      const coinReward = Math.random() < 0.5;

      const newQuest = {
        title: baseQuest.title,
        desc: desc,
        points: baseQuest.points,
        attribute: attribute,
        completed: false,
        mandatory: false,
        base: baseQuest.base,
        adjustedCount: adjustedCount,
        coinReward: coinReward,
      };

      gameState.dailyQuests[questIndex] = newQuest;
      gameState.replaceCount--;

      generateDailyQuests();
      saveGame();

      replaceQuestBtn.classList.add('rotating');
      setTimeout(() => {
        replaceQuestBtn.classList.remove('rotating');
      }, 1000);

      // Добавляем событие в ленту
      addEvent(`🔁 Замена квеста: "${newQuest.title}"`, 'warning');
      showNotification(
        '🔁 Квест заменен!',
        `Новый квест: "${newQuest.title}"`,
        'info',
      );
    }

    // Check if mandatory quest was completed
    function checkMandatoryQuest() {
      const mandatoryQuest =
        gameState.dailyQuests[gameState.mandatoryQuestIndex];

      if (
        mandatoryQuest &&
        !mandatoryQuest.completed &&
        !gameState.noMandatoryPenalty
      ) {
        // Определяем множитель штрафа (2x в воскресенье)
        const penaltyMultiplier = new Date().getDay() === 0 ? 2 : 1;
        let actualPoints = penaltyMultiplier;

        // Применяем бонусы от сундуков
        actualPoints = Math.round(actualPoints * gameState.expMultiplier);

        punishmentMessage.textContent = `Вы не выполнили обязательный квест! Ваше наказание: -${penaltyMultiplier} ко всем характеристикам.`;
        punishmentModal.style.display = 'flex';

        // Применяем наказание
        Object.keys(gameState.attributes).forEach((attr) => {
          gameState.attributes[attr] = Math.max(
            1,
            gameState.attributes[attr] - actualPoints,
          );
        });

        saveGame();
        updateStats();

        // Добавляем событие в ленту
        addEvent(`⚠️ Штраф: не выполнен обязательный квест`, 'danger');
        showNotification(
          '⚠️ Штраф!',
          'Вы не выполнили обязательный квест',
          'danger',
        );
      }

      // Проверяем выполнение всех квестов для достижения дисциплины
      checkAllQuestsCompleted();
    }

    // Reset weekly quest
    function resetWeeklyQuest() {
      gameState.weeklyQuest = null;
      generateWeeklyQuest();
      setWeeklyResetTime();
    }

    // Show weekly report
    function showWeeklyReport() {
      weekReport.style.display = 'block';

      let reportHTML = '<ul>';
      let totalPoints = 0;

      Object.keys(gameState.weeklyStats).forEach((attr) => {
        if (gameState.weeklyStats[attr].points > 0) {
          totalPoints += gameState.weeklyStats[attr].points;
          reportHTML += `<li><b>${getAttributeName(attr)}</b>: +${gameState.weeklyStats[attr].points} очков`;

          if (gameState.weeklyStats[attr].actions.length > 0) {
            reportHTML += `<ul>`;
            gameState.weeklyStats[attr].actions.forEach((action) => {
              reportHTML += `<li>${action}</li>`;
            });
            reportHTML += `</ul>`;
          }

          reportHTML += `</li>`;
        }
      });

      reportHTML += `</ul>`;
      reportHTML += `<p><b>Итого за неделю</b>: +${totalPoints} очков характеристик</p>`;
      reportHTML += `<p>Так держать! Продолжайте в том же духе!</p>`;

      weekReportContent.innerHTML = reportHTML;

      // Сбрасываем статистику за неделю
      Object.keys(gameState.weeklyStats).forEach((attr) => {
        gameState.weeklyStats[attr] = { points: 0, actions: [] };
      });
      saveGame();

      // Добавляем событие в ленту
      addEvent(
        `📊 Недельный отчет: +${totalPoints} очков характеристик`,
        'info',
      );
      showNotification(
        '📊 Недельный отчет готов!',
        `Вы получили +${totalPoints} очков характеристик`,
        'info',
      );
    }

    // Calculate points needed for next level
    function calculatePointsToNextLevel() {
      const levelGroup = Math.floor((gameState.level - 1) / 10);
      let requiredPoints = 10 + levelGroup;

      // После 100 уровня фиксируем на 20 очках
      if (requiredPoints > 20) {
        requiredPoints = 20;
      }

      return requiredPoints;
    }

    // Update stats display
    function updateStats() {
      levelElement.textContent = `Уровень ${gameState.level}`;

      // Обновляем требуемое количество очков для следующего уровня
      gameState.pointsToNextLevel = calculatePointsToNextLevel();

      const levelProgressPercentage =
        (gameState.currentPoints / gameState.pointsToNextLevel) * 100;
      levelProgressBar.style.width = `${levelProgressPercentage}%`;

      Object.keys(gameState.attributes).forEach((attr, index) => {
        const value = gameState.attributes[attr];
        attributeValues[index].textContent =
          `${value} / ${gameState.maxAttributeValue}`;

        const progressPercentage = (value / gameState.maxAttributeValue) * 100;
        progressBars[index].style.width = `${progressPercentage}%`;
      });

      // Обновление достижений
      if (gameState.level >= 50) {
        achievementCards.status.classList.remove('locked');
        if (!gameState.status) {
          setTimeout(() => {
            showStatusModal();
          }, 500);
        }
      }

      if (gameState.level >= 75) {
        achievementCards.profession.classList.remove('locked');
        if (!gameState.profession) {
          setTimeout(() => {
            assignProfession();
          }, 500);
        }
      }

      if (gameState.level >= 150) {
        achievementCards.master.classList.remove('locked');
        if (!gameState.level150Achieved) {
          gameState.level150Achieved = true;
          saveGame();
        }
      }

      if (gameState.status) {
        statusIndicator.textContent = gameState.status;
        statusIndicator.style.display = 'inline-block';
      }

      if (gameState.profession) {
        professionIndicator.textContent = gameState.profession;
        professionIndicator.style.display = 'inline-block';
      }
    }

    // Check if all quests are completed
    function checkAllQuestsCompleted() {
      const allCompleted = gameState.dailyQuests.every(
        (quest) => quest.completed,
      );

      if (allCompleted) {
        // Увеличиваем счетчик дней подряд
        gameState.consecutiveDays++;

        // Проверяем достижения дисциплины
        const currentLevel = disciplineLevels[gameState.disciplineLevel];
        if (
          !currentLevel.max &&
          gameState.consecutiveDays >= currentLevel.days
        ) {
          if (gameState.disciplineLevel < disciplineLevels.length - 1) {
            gameState.disciplineLevel++;

            // Добавляем событие в ленту
            addEvent(
              `🏆 Новый уровень дисциплины: ${disciplineLevels[gameState.disciplineLevel].name}`,
              'success',
            );
            showNotification(
              '🏆 Улучшение дисциплины!',
              `Вы достигли уровня: ${disciplineLevels[gameState.disciplineLevel].name}`,
              'success',
            );
          }
        }

        // Показываем сообщение
        completedAll.style.display = 'block';
        saveGame();

        // Добавляем событие в ленту
        addEvent('🎯 Все квесты выполнены!', 'success');
        showNotification(
          '🎯 Успех!',
          'Все квесты за сегодня выполнены!',
          'success',
        );
      } else {
        // Сбрасываем счетчик дней подряд, если не все квесты выполнены
        if (gameState.consecutiveDays > 0) {
          gameState.consecutiveDays = 0;
          saveGame();

          // Добавляем событие в ленту
          addEvent('⚠️ Серия дисциплины прервана', 'warning');
          showNotification(
            '⚠️ Внимание!',
            'Серия дисциплины прервана',
            'warning',
          );
        }
      }
    }

    // Show status selection modal
    function showStatusModal() {
      statusModal.style.display = 'flex';
    }

    // Assign profession based on highest attribute
    function assignProfession() {
      let highestAttribute = 'strength';
      let highestValue = gameState.attributes.strength;

      Object.keys(gameState.attributes).forEach((attr) => {
        if (gameState.attributes[attr] > highestValue) {
          highestValue = gameState.attributes[attr];
          highestAttribute = attr;
        }
      });

      let profession = '';
      switch (highestAttribute) {
        case 'strength':
          profession = 'Качок';
          break;
        case 'agility':
          profession = 'Атлет';
          break;
        case 'perception':
          profession = 'Мудрец';
          break;
        case 'stamina':
          profession = 'Стайер';
          break;
        case 'intelligence':
          profession = 'Интеллектуал';
          break;
        default:
          profession = 'Эксперт';
      }

      gameState.profession = profession;
      saveGame();

      professionMessage.textContent = `Поздравляем! Вам присвоена профессия: ${profession}`;
      professionModal.style.display = 'flex';

      // Добавляем событие в ленту
      addEvent(`🎓 Получена профессия: ${profession}`, 'success');
      showNotification(
        '🎓 Новая профессия!',
        `Вам присвоена профессия: ${profession}`,
        'success',
      );
    }

    // Add points to attribute
    function addPoints(attribute, points, questCard, questIndex, coinReward) {
      // Определяем множитель (2x в воскресенье)
      const multiplier = new Date().getDay() === 0 ? 2 : 1;
      let actualPoints = points * multiplier;

      // Применяем бонусы от сундуков
      actualPoints = Math.round(actualPoints * gameState.expMultiplier);

      // NEW: Для пользовательских квестов всегда даем +1 ко всем характеристикам
      if (gameState.dailyQuests[questIndex].custom) {
        actualPoints = 1;
        attribute = 'all';
      }

      // Добавляем очки к атрибуту
      if (attribute === 'all') {
        Object.keys(gameState.attributes).forEach((attr) => {
          gameState.attributes[attr] += actualPoints;

          // Ограничиваем максимальное значение
          if (gameState.attributes[attr] > gameState.maxAttributeValue) {
            gameState.attributes[attr] = gameState.maxAttributeValue;
          }
        });
      } else {
        gameState.attributes[attribute] += actualPoints;

        // Ограничиваем максимальное значение
        if (gameState.attributes[attribute] > gameState.maxAttributeValue) {
          gameState.attributes[attribute] = gameState.maxAttributeValue;
        }
      }

      gameState.totalPoints += actualPoints;
      gameState.currentPoints += actualPoints;

      // Добавляем монеты, если есть награда
      if (coinReward) {
        gameState.coins += 1;
        updateCoinsDisplay();

        // Анимация монеты
        animateCoin(questCard.querySelector('.quest-btn'));

        // Добавляем событие в ленту
        addEvent(`🪙 Получена монета за выполнение квеста`, 'info');
        showNotification('🪙 Монета получена!', 'За выполнение квеста', 'info');
      }

      // Помечаем квест как выполненный
      gameState.dailyQuests[questIndex].completed = true;

      // NEW: Если это пользовательский квест, помечаем его как выполненный в массиве customQuests
      if (gameState.dailyQuests[questIndex].custom) {
        const customQuestTitle = gameState.dailyQuests[questIndex].title;
        if (gameState.customQuests) {
          const customQuest = gameState.customQuests.find(
            (q) => q.title === customQuestTitle && !q.completed,
          );
          if (customQuest) {
            customQuest.completed = true;
          }
        }
      }

      // Добавляем статистику за неделю
      if (attribute === 'all') {
        Object.keys(gameState.attributes).forEach((attr) => {
          gameState.weeklyStats[attr].points += actualPoints;
        });
      } else {
        gameState.weeklyStats[attribute].points += actualPoints;
        gameState.weeklyStats[attribute].actions.push(
          gameState.dailyQuests[questIndex].title,
        );
      }

      saveGame();

      // Добавляем событие в ленту
      addEvent(
        `✅ Выполнен квест: "${gameState.dailyQuests[questIndex].title}"`,
        'success',
      );
      showNotification(
        '✅ Квест выполнен!',
        `+${actualPoints} к ${getAttributeName(attribute)}`,
        'success',
      );

      // Проверяем, нужно ли повысить уровень
      while (gameState.currentPoints >= gameState.pointsToNextLevel) {
        gameState.currentPoints -= gameState.pointsToNextLevel;
        gameState.level++;

        // Пересчитываем требования для следующего уровня
        gameState.pointsToNextLevel = calculatePointsToNextLevel();

        // Анимация повышения уровня
        levelElement.classList.add('glowing');
        levelElement.style.animation = 'level-up 0.5s ease-in-out';
        setTimeout(() => {
          levelElement.classList.remove('glowing');
          levelElement.style.animation = '';
        }, 2000);

        // Добавляем событие в ленту
        addEvent(`🎉 Повышение уровня: ${gameState.level}`, 'success');
        showNotification(
          '🎉 Уровень повышен!',
          `Поздравляем с достижением ${gameState.level} уровня!`,
          'success',
        );
      }

      // Animate quest card disappearance
      questCard.classList.add('completed');
      setTimeout(() => {
        questCard.remove();
      }, 500);

      // Scroll to attribute card with animation
      setTimeout(() => {
        attributeCards[attribute].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        // Add highlight animation
        attributeCards[attribute].classList.add('highlight');
        setTimeout(() => {
          attributeCards[attribute].classList.remove('highlight');
        }, 1500);
      }, 600);

      updateStats();
      saveGame();

      // Проверяем выполнение всех квестов
      checkAllQuestsCompleted();
    }

    // Complete weekly quest
    function completeWeeklyQuest() {
      // Add points to all attributes
      Object.keys(gameState.attributes).forEach((attr) => {
        gameState.attributes[attr] += 2;

        // Ограничиваем максимальное значение
        if (gameState.attributes[attr] > gameState.maxAttributeValue) {
          gameState.attributes[attr] = gameState.maxAttributeValue;
        }
      });

      gameState.totalPoints += 10;
      gameState.currentPoints += 10;
      gameState.weeklyQuest.completed = true;

      // Добавляем монеты
      gameState.coins += 3;
      updateCoinsDisplay();

      // Анимация монет
      animateCoin(weeklyQuestBtn);

      // Проверяем, нужно ли повысить уровень
      while (gameState.currentPoints >= gameState.pointsToNextLevel) {
        gameState.currentPoints -= gameState.pointsToNextLevel;
        gameState.level++;

        // Пересчитываем требования для следующего уровня
        gameState.pointsToNextLevel = calculatePointsToNextLevel();
      }

      weeklyQuestBtn.textContent = 'Выполнено!';
      weeklyQuestBtn.classList.add('completed');

      saveGame();
      updateStats();

      // Add animation
      weeklyQuestCard.classList.add('glowing');
      setTimeout(() => {
        weeklyQuestCard.classList.remove('glowing');
      }, 2000);

      // Добавляем событие в ленту
      addEvent(
        `🌟 Выполнен еженедельный квест: "${gameState.weeklyQuest.title}"`,
        'success',
      );
      showNotification('🌟 Успех!', 'Еженедельный квест выполнен!', 'success');
    }

    // Show quest confirmation modal
    function showQuestConfirmation(questIndex) {
      const quest = gameState.dailyQuests[questIndex];
      confirmQuestMessage.textContent = `Вы подтверждаете, что завершили квест "${quest.title}"?`;
      gameState.currentQuestIndex = questIndex;
      confirmQuestModal.style.display = 'flex';
    }

    // Show attribute description modal
    function showAttributeModal(attribute) {
      attributeModalTitle.textContent =
        attributeCards[attribute].querySelector('.attribute-name').textContent;
      attributeModalDesc.textContent = attributeDescriptions[attribute];
      attributeModal.style.display = 'flex';
    }

    // NEW: Show rules modal (заменяет достижение Дисциплина)
    function showRulesModal() {
      rulesModal.style.display = 'flex';
    }

    // Show achievement info modal
    function showAchievementInfo(type) {
      let title = '';
      let description = '';

      switch (type) {
        case 'status':
          title = 'Статус';
          if (gameState.level < 50) {
            description = `Необходимо достигнуть 50 уровня, чтобы открыть статус. Текущий уровень: ${gameState.level}`;
          } else {
            description =
              'Выберите свой уникальный статус, который будет отражать ваш путь развития.';
          }
          break;

        case 'profession':
          title = 'Профессия';
          if (gameState.level < 75) {
            description = `Необходимо достигнуть 75 уровня, чтобы выбрать профессию. Текущий уровень: ${gameState.level}`;
          } else {
            description =
              'Выберите профессию, которая определит вашу дальнейшую специализацию.';
          }
          break;

        case 'master':
          title = 'Мастер всех стихий';
          if (gameState.level < 150) {
            description = `Необходимо достигнуть 150 уровня, чтобы получить это достижение. Текущий уровень: ${gameState.level}`;
          } else {
            description = 'Человек, который совершил невозможное!';
          }
          break;
      }

      achievementModalTitle.textContent = title;
      achievementModalDesc.textContent = description;
      achievementModal.style.display = 'flex';
    }

    // Show shop item modal
    function showShopItemModal(type) {
      shopItemTitle.textContent = document.querySelector(
        `.shop-item.${type} .shop-title`,
      ).textContent;
      shopItemContent.textContent = `Внутри: ${chestDescriptions[type]}`;
      shopItemPrice.textContent = document.querySelector(
        `.shop-item.${type} .shop-price span`,
      ).textContent;
      shopItemPrice.dataset.type = type;
      shopItemModal.style.display = 'flex';
    }

    // Buy shop item
    function buyShopItem(type) {
      const price = parseInt(
        document.querySelector(`.shop-item.${type} .shop-price span`)
          .textContent,
      );

      if (gameState.coins >= price) {
        gameState.coins -= price;
        gameState.chestsBought.push(type);

        // Apply chest bonuses
        switch (type) {
          case 'common':
            // +3 ко всем характеристикам
            Object.keys(gameState.attributes).forEach((attr) => {
              gameState.attributes[attr] += 3;
            });
            // +1 замена в день
            gameState.maxReplaceCount += 1;
            gameState.replaceCount = gameState.maxReplaceCount;
            break;

          case 'rare':
            // +5 ко всем характеристикам
            Object.keys(gameState.attributes).forEach((attr) => {
              gameState.attributes[attr] += 5;
            });
            // +100% к улучшениям на 48 часов
            const rareBonus = {
              multiplier: 1.0,
              expires: Date.now() + 48 * 60 * 60 * 1000,
            };
            gameState.tempBonuses.push(rareBonus);
            // +1 ежедневный квест
            gameState.maxDailyQuests += 1;
            // +1 замена в день
            gameState.maxReplaceCount += 1;
            gameState.replaceCount = gameState.maxReplaceCount;
            break;

          case 'epic':
            // +50 к случайному атрибуту
            const attributes = Object.keys(gameState.attributes);
            const randomAttr =
              attributes[Math.floor(Math.random() * attributes.length)];
            gameState.attributes[randomAttr] += 50;
            // +1 ежедневный квест
            gameState.maxDailyQuests += 1;
            // +2 замены в день
            gameState.maxReplaceCount += 2;
            gameState.replaceCount = gameState.maxReplaceCount;
            // Отмена обязательного квеста
            gameState.noMandatoryPenalty = true;
            // +150% к улучшениям на 72 часа
            const epicBonus = {
              multiplier: 1.5,
              expires: Date.now() + 72 * 60 * 60 * 1000,
            };
            gameState.tempBonuses.push(epicBonus);
            break;

          case 'legendary':
            // +200% к улучшениям навсегда
            gameState.expMultiplier += 2.0;
            // Отмена наказания за обязательный квест
            gameState.noMandatoryPenalty = true;
            // +2 ежедневных квеста
            gameState.maxDailyQuests += 2;
            // Неограниченные замены
            gameState.maxReplaceCount = Infinity;
            gameState.replaceCount = Infinity;
            break;
        }

        // Удаляем купленный сундук из магазина
        document.querySelector(`.shop-item.${type}`).remove();

        updateCoinsDisplay();
        saveGame();
        updateStats();
        generateDailyQuests(); // Regenerate quests with new count

        shopItemModal.style.display = 'none';

        // Анимация открытия сундука
        const chestIcon = document.querySelector(
          `.shop-item.${type} .chest-icon i`,
        );
        if (chestIcon) {
          chestIcon.classList.add('chest-opening');
          setTimeout(() => {
            chestIcon.classList.remove('chest-opening');
          }, 500);
        }

        // Добавляем событие в ленту
        addEvent(`🎁 Куплен ${type} сундук`, 'info');
        showNotification(
          '🎁 Сундук куплен!',
          `Вы получили: ${chestDescriptions[type]}`,
          'success',
        );
      } else {
        alert(
          `У вас недостаточно монет L для этой покупки. Требуется: ${price}, у вас: ${gameState.coins}`,
        );
      }
    }

    // Show level info modal
    function showLevelInfo() {
      const pointsLeft = gameState.pointsToNextLevel - gameState.currentPoints;
      levelInfoContent.textContent = `До следующего уровня осталось: ${pointsLeft} очков опыта`;
      levelInfoModal.style.display = 'flex';
    }

    // NEW: Show notification
    function showNotification(title, content, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.innerHTML = `
        <div class="notification-title">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'danger' ? 'times-circle' : 'info-circle'}"></i>
            ${title}
        </div>
        <div class="notification-content">${content}</div>
    `;

      notificationsContainer.appendChild(notification);

      // Remove notification after animation
      setTimeout(() => {
        notification.remove();
      }, 3500);
    }

    // NEW: Add event to feed
    function addEvent(content, type = 'info') {
      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const event = {
        content: content,
        type: type,
        timestamp: now.getTime(),
      };

      gameState.events.unshift(event);
      if (gameState.events.length > 20) {
        gameState.events.pop();
      }

      saveGame();
      renderEvents();
    }

    // NEW: Render events to feed
    function renderEvents() {
      eventsList.innerHTML = '';

      gameState.events.forEach((event) => {
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${event.type}`;

        const now = new Date();
        const time = new Date(event.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        eventItem.innerHTML = `
            <div class="event-icon">
                <i class="fas fa-${event.type === 'success' ? 'check' : event.type === 'warning' ? 'exclamation' : event.type === 'danger' ? 'times' : 'info'}"></i>
            </div>
            <div class="event-content">${event.content}</div>
            <div class="event-time">${time}</div>
        `;

        eventsList.appendChild(eventItem);
      });
    }

    // NEW: Animate coin
    function animateCoin(startElement) {
      const coin = document.createElement('div');
      coin.innerHTML = '🪙';
      coin.style.position = 'fixed';
      coin.style.zIndex = '1000';
      coin.style.fontSize = '20px';

      // Get start position
      const startRect = startElement.getBoundingClientRect();
      const startX = startRect.left + startRect.width / 2;
      const startY = startRect.top + startRect.height / 2;

      // Get end position
      const walletRect = walletElement.getBoundingClientRect();
      const endX = walletRect.left + walletRect.width / 2;
      const endY = walletRect.top + walletRect.height / 2;

      // Calculate distance
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Set initial position
      coin.style.left = `${startX}px`;
      coin.style.top = `${startY}px`;
      coin.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(coin);

      // Set CSS variables for animation
      coin.style.setProperty('--tx', `${deltaX}px`);
      coin.style.setProperty('--ty', `${deltaY}px`);

      // Animate
      coin.style.animation = 'fly-coin 1s forwards';

      // Remove coin after animation
      setTimeout(() => {
        coin.remove();
      }, 1000);
    }

    // Setup event listeners
    function setupEventListeners() {
      // Кнопка "Начать прокачку" прокручивает к квестам
      startButton.addEventListener('click', function () {
        this.classList.add('active');
        setTimeout(() => {
          this.classList.remove('active');
          questsSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      });

      // Переключатель темы
      themeToggle.addEventListener('click', toggleTheme);

      // Добавляем обработчики событий для кнопок квестов
      document.addEventListener('click', function (e) {
        if (
          e.target &&
          e.target.classList.contains('quest-btn') &&
          !e.target.classList.contains('completed')
        ) {
          const button = e.target;
          const questIndex = parseInt(button.dataset.index);
          showQuestConfirmation(questIndex);
        }
      });

      // Кнопка замены квеста
      replaceQuestBtn.addEventListener('click', showReplaceConfirmModal);

      // NEW: Кнопка добавления своего квеста
      addCustomQuestBtn.addEventListener('click', showCustomQuestModal);

      // Кнопка подтверждения замены
      confirmReplaceBtn.addEventListener('click', activateReplaceMode);

      // Кнопка отмены замены
      cancelReplaceBtn.addEventListener('click', hideReplaceConfirmModal);

      // NEW: Кнопка сохранения пользовательского квеста
      saveCustomQuestBtn.addEventListener('click', saveCustomQuest);

      // NEW: Кнопка отмены создания пользовательского квеста
      cancelCustomQuestBtn.addEventListener('click', hideCustomQuestModal);

      // Кнопка выполнения еженедельного квеста
      weeklyQuestBtn.addEventListener('click', function () {
        if (!gameState.weeklyQuest.completed) {
          showWeeklyConfirmModal();
        }
      });

      // NEW: Кнопка подтверждения еженедельного квеста
      confirmWeeklyBtn.addEventListener('click', function () {
        hideWeeklyConfirmModal();
        completeWeeklyQuest();
      });

      // NEW: Кнопка отмены еженедельного квеста
      cancelWeeklyBtn.addEventListener('click', hideWeeklyConfirmModal);

      // Модальное окно статуса
      document
        .querySelectorAll('.modal-option[data-status]')
        .forEach((option) => {
          option.addEventListener('click', function () {
            gameState.status = this.dataset.status;
            statusIndicator.textContent = gameState.status;
            statusIndicator.style.display = 'inline-block';
            statusModal.style.display = 'none';
            saveGame();

            // Добавляем событие в ленту
            addEvent(`🏷️ Установлен статус: ${gameState.status}`, 'info');
            showNotification(
              '🏷️ Новый статус!',
              `Вы выбрали: ${gameState.status}`,
              'info',
            );
          });
        });

      // Модальное окно профессии
      document
        .getElementById('close-profession-modal')
        .addEventListener('click', function () {
          professionModal.style.display = 'none';
        });

      // Модальное окно наказания
      document
        .getElementById('close-punishment-modal')
        .addEventListener('click', function () {
          punishmentModal.style.display = 'none';
        });

      // Кнопки закрытия модальных окон
      document.querySelectorAll('.modal-close').forEach((button) => {
        button.addEventListener('click', function () {
          const modal = this.closest('.modal');
          modal.style.display = 'none';
        });
      });

      // Подтверждение выполнения квеста
      confirmQuestBtn.addEventListener('click', function () {
        const questIndex = gameState.currentQuestIndex;
        const questCard = document.querySelector(
          `.quest-card[data-index="${questIndex}"]`,
        );
        const button = questCard.querySelector('.quest-btn');
        const attribute = button.dataset.attribute;
        const points = parseInt(button.dataset.points);
        const coinReward = button.dataset.coin === 'true';

        // Закрываем модальное окно
        confirmQuestModal.style.display = 'none';

        // Помечаем как выполненный
        button.textContent = 'Выполнено!';
        button.classList.add('completed');

        // Добавляем очки и прокручиваем к атрибуту
        addPoints(attribute, points, questCard, questIndex, coinReward);
      });

      // Отмена выполнения квеста
      cancelQuestBtn.addEventListener('click', function () {
        confirmQuestModal.style.display = 'none';
      });

      // Показать описание характеристики при клике
      Object.keys(attributeCards).forEach((attr) => {
        attributeCards[attr].addEventListener('click', function () {
          showAttributeModal(attr);
        });
      });

      // Закрыть модальное окно характеристики
      document
        .getElementById('close-attribute-modal')
        .addEventListener('click', function () {
          attributeModal.style.display = 'none';
        });

      // NEW: Показать правила прокачки при клике
      achievementCards.rules.addEventListener('click', function () {
        showRulesModal();
      });

      // NEW: Закрыть модальное окно правил
      closeRulesBtn.addEventListener('click', function () {
        rulesModal.style.display = 'none';
      });

      // Показать информацию о достижении при клике
      achievementCards.status.addEventListener('click', function () {
        showAchievementInfo('status');
      });

      achievementCards.profession.addEventListener('click', function () {
        showAchievementInfo('profession');
      });

      achievementCards.master.addEventListener('click', function () {
        showAchievementInfo('master');
      });

      // Закрыть модальное окно достижения
      document
        .getElementById('close-achievement-modal')
        .addEventListener('click', function () {
          achievementModal.style.display = 'none';
        });

      // Кнопки магазина
      document.querySelectorAll('.shop-btn').forEach((button) => {
        button.addEventListener('click', function (e) {
          e.stopPropagation();
          const shopItem = this.closest('.shop-item');
          const type = shopItem.dataset.type;
          showShopItemModal(type);
        });
      });

      // Подтверждение покупки в магазине
      confirmBuyBtn.addEventListener('click', function () {
        const type = shopItemPrice.dataset.type;
        buyShopItem(type);
      });

      // Отмена покупки в магазине
      cancelBuyBtn.addEventListener('click', function () {
        shopItemModal.style.display = 'none';
      });

      // Клик по кошельку - переход в магазин
      walletElement.addEventListener('click', function () {
        document
          .getElementById('shop-section')
          .scrollIntoView({ behavior: 'smooth' });
      });

      // Клик по уровню или прогресс бару - показать информацию
      levelContainer.addEventListener('click', showLevelInfo);
      levelProgressContainer.addEventListener('click', showLevelInfo);

      // Закрыть модальное окно уровня
      document
        .getElementById('close-level-modal')
        .addEventListener('click', function () {
          levelInfoModal.style.display = 'none';
        });

      // Клик по сундуку для просмотра информации
      document.querySelectorAll('.shop-item').forEach((item) => {
        item.addEventListener('click', function (e) {
          // Если клик не по кнопке - открываем информацию
          if (!e.target.classList.contains('shop-btn')) {
            const type = this.dataset.type;
            showShopItemModal(type);

            // Анимация открытия сундука
            const chest = this.querySelector('.chest-icon i');
            if (chest) {
              chest.classList.add('chest-opening');
              setTimeout(() => {
                chest.classList.remove('chest-opening');
              }, 500);
            }
          }
        });
      });

      // Закрываем модальные окна при клике снаружи
      window.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
          e.target.style.display = 'none';
        }
      });
    }

    // Timer for quest reset
    function startTimers() {
      // Daily timer
      const dailyTimer = setInterval(() => {
        const now = Date.now();
        const timeLeft = gameState.questResetTime - now;

        if (timeLeft < 0) {
          checkMandatoryQuest();
          resetQuests();
          setQuestResetTime();
          generateDailyQuests();
          completedAll.style.display = 'none';
        }

        const seconds = Math.floor(timeLeft / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }, 1000);

      // Weekly timer
      const weeklyTimer = setInterval(() => {
        const now = Date.now();
        const timeLeft = gameState.weeklyResetTime - now;

        if (timeLeft < 0) {
          showWeeklyReport();
          resetWeeklyQuest();
          setWeeklyResetTime();
        }

        const seconds = Math.floor(timeLeft / 1000);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        weeklyTimerElement.textContent = `${days}д ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }, 1000);
    }

    // Reset quests
    function resetQuests() {
      gameState.dailyQuests = [];
      gameState.replaceCount = gameState.maxReplaceCount;
      gameState.mandatoryQuestIndex = -1;
      generateDailyQuests();
      saveGame();

      // Добавляем событие в ленту
      addEvent('🔄 Обновлены ежедневные квесты', 'info');
      showNotification(
        '🔄 Обновление!',
        'Появились новые ежедневные квесты',
        'info',
      );
    }

    // Экспортируем функции в window для использования в других модулях
    window.showNotification = showNotification;
    window.addEvent = addEvent;
    window.updateStats = updateStats;
    window.generateDailyQuests = generateDailyQuests;
    window.updateCoinsDisplay = updateCoinsDisplay;

    // Initialize the game when page loads
    window.addEventListener('DOMContentLoaded', initGame);

    // Обработчики для авторизации
    document.addEventListener('DOMContentLoaded', function () {
      console.log('🔧 Инициализация обработчиков авторизации...');
      console.log('authManager:', window.authManager);
      console.log('api:', window.api);
      console.log('showNotification:', typeof window.showNotification);

      // Проверяем, что все модули загружены
      if (!window.authManager) {
        console.error(
          '❌ authManager не загружен! Повторная попытка через 100ms...',
        );
        setTimeout(() => {
          if (!window.authManager) {
            console.error('❌ authManager все еще не загружен!');
          } else {
            console.log('✅ authManager загружен');
            initAuthHandlers();
          }
        }, 100);
        return;
      }

      if (!window.api) {
        console.error('❌ api не загружен!');
        return;
      }

      initAuthHandlers();
    });

    function initAuthHandlers() {
      // Переключение вкладок
      document.querySelectorAll('.form-tab').forEach((tab) => {
        tab.addEventListener('click', function () {
          const tabName = this.dataset.tab;

          // Обновляем активные вкладки
          document
            .querySelectorAll('.form-tab')
            .forEach((t) => t.classList.remove('active'));
          this.classList.add('active');

          document.querySelectorAll('.tab-content').forEach((content) => {
            content.classList.remove('active');
          });

          document.getElementById(`${tabName}-tab`).classList.add('active');
        });
      });

      // Вход
      const loginBtn = document.getElementById('login-submit-btn');
      if (!loginBtn) {
        console.error('❌ Кнопка login-submit-btn не найдена!');
        return;
      }

      loginBtn.addEventListener('click', async function () {
        console.log('🔐 Нажата кнопка входа');
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        console.log('📧 Email:', email ? 'введен' : 'не введен');
        console.log('🔑 Password:', password ? 'введен' : 'не введен');

        if (!email || !password) {
          console.warn('⚠️ Не все поля заполнены');
          if (window.showNotification) {
            window.showNotification(
              '❌ Ошибка',
              'Заполните все поля',
              'danger',
            );
          }
          return;
        }

        if (!window.authManager) {
          console.error('❌ authManager не найден!');
          if (window.showNotification) {
            window.showNotification(
              '❌ Ошибка',
              'Система авторизации не загружена',
              'danger',
            );
          }
          return;
        }

        console.log('🔄 Выполняю вход...');
        const result = await window.authManager.login(email, password);
        console.log('📥 Результат входа:', result);

        if (!result.success) {
          if (window.showNotification) {
            window.showNotification(
              '❌ Ошибка входа',
              result.error || 'Неверные данные',
              'danger',
            );
          }
        }
      });

      // Регистрация
      const registerBtn = document.getElementById('register-submit-btn');
      if (!registerBtn) {
        console.error('❌ Кнопка register-submit-btn не найдена!');
        return;
      }

      registerBtn.addEventListener('click', async function () {
        console.log('📝 Нажата кнопка регистрации');
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById(
          'register-confirm-password',
        ).value;

        if (!username || !email || !password || !confirmPassword) {
          console.warn('⚠️ Не все поля заполнены');
          if (window.showNotification) {
            window.showNotification(
              '❌ Ошибка',
              'Заполните все поля',
              'danger',
            );
          }
          return;
        }

        if (!window.authManager) {
          console.error('❌ authManager не найден!');
          if (window.showNotification) {
            window.showNotification(
              '❌ Ошибка',
              'Система авторизации не загружена',
              'danger',
            );
          }
          return;
        }

        console.log('🔄 Выполняю регистрацию...');
        const result = await window.authManager.register(
          username,
          email,
          password,
          confirmPassword,
        );
        console.log('📥 Результат регистрации:', result);

        if (!result.success) {
          if (window.showNotification) {
            window.showNotification(
              '❌ Ошибка регистрации',
              result.error,
              'danger',
            );
          }
        }
      });

      // Выход
      document
        .getElementById('logout-btn')
        .addEventListener('click', function () {
          if (window.authManager) {
            window.authManager.logout();
          }
        });

      // Enter для форм
      document.querySelectorAll('.login-input').forEach((input) => {
        input.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') {
            const activeTab = document.querySelector('.form-tab.active');
            if (activeTab.dataset.tab === 'login') {
              document.getElementById('login-submit-btn').click();
            } else {
              document.getElementById('register-submit-btn').click();
            }
          }
        });
      });
    }
    console.error(
      '❌ authManager не загружен! Повторная попытка через 100ms...',
    );
    setTimeout(() => {
      if (!window.authManager) {
        console.error('❌ authManager все еще не загружен!');
      } else {
        console.log('✅ authManager загружен');
        initAuthHandlers();
      }
    }, 100);
    return;
  }
  
  if (!window.api) {
    console.error('❌ api не загружен!');
    return;
  }
  
  initAuthHandlers();
});

function initAuthHandlers() {

  // Переключение вкладок
  document.querySelectorAll('.form-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;

      // Обновляем активные вкладки
      document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });

      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });

  // Вход
  const loginBtn = document.getElementById('login-submit-btn');
  if (!loginBtn) {
    console.error('❌ Кнопка login-submit-btn не найдена!');
    return;
  }

  loginBtn.addEventListener('click', async function() {
    console.log('🔐 Нажата кнопка входа');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log('📧 Email:', email ? 'введен' : 'не введен');
    console.log('🔑 Password:', password ? 'введен' : 'не введен');

    if (!email || !password) {
      console.warn('⚠️ Не все поля заполнены');
      if (window.showNotification) {
        window.showNotification('❌ Ошибка', 'Заполните все поля', 'danger');
      }
      return;
    }

    if (!window.authManager) {
      console.error('❌ authManager не найден!');
      if (window.showNotification) {
        window.showNotification('❌ Ошибка', 'Система авторизации не загружена', 'danger');
      }
      return;
    }

    console.log('🔄 Выполняю вход...');
    const result = await window.authManager.login(email, password);
    console.log('📥 Результат входа:', result);

    if (!result.success) {
      if (window.showNotification) {
        window.showNotification('❌ Ошибка входа', result.error || 'Неверные данные', 'danger');
      }
    }
  });

  // Регистрация
  const registerBtn = document.getElementById('register-submit-btn');
  if (!registerBtn) {
    console.error('❌ Кнопка register-submit-btn не найдена!');
    return;
  }

  registerBtn.addEventListener('click', async function() {
    console.log('📝 Нажата кнопка регистрации');
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!username || !email || !password || !confirmPassword) {
      console.warn('⚠️ Не все поля заполнены');
      if (window.showNotification) {
        window.showNotification('❌ Ошибка', 'Заполните все поля', 'danger');
      }
      return;
    }

    if (!window.authManager) {
      console.error('❌ authManager не найден!');
      if (window.showNotification) {
        window.showNotification('❌ Ошибка', 'Система авторизации не загружена', 'danger');
      }
      return;
    }

    console.log('🔄 Выполняю регистрацию...');
    const result = await window.authManager.register(username, email, password, confirmPassword);
    console.log('📥 Результат регистрации:', result);

    if (!result.success) {
      if (window.showNotification) {
        window.showNotification('❌ Ошибка регистрации', result.error, 'danger');
      }
    }
  });

  // Выход
  document.getElementById('logout-btn').addEventListener('click', function() {
    if (window.authManager) {
      window.authManager.logout();
    }
  });

  // Enter для форм
  document.querySelectorAll('.login-input').forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const activeTab = document.querySelector('.form-tab.active');
        if (activeTab.dataset.tab === 'login') {
          document.getElementById('login-submit-btn').click();
        } else {
          document.getElementById('register-submit-btn').click();
        }
      }
    });
  });
}