const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  gameState: {
    level: { type: Number, default: 1 },
    attributes: {
      strength: { type: Number, default: 1 },
      agility: { type: Number, default: 1 },
      perception: { type: Number, default: 1 },
      stamina: { type: Number, default: 1 },
      intelligence: { type: Number, default: 1 },
    },
    coins: { type: Number, default: 0 },
    dailyQuests: { type: Array, default: [] },
    weeklyQuest: { type: Object, default: null },
    status: { type: String, default: null },
    profession: { type: String, default: null },
    replaceCount: { type: Number, default: 3 },
    maxAttributeValue: { type: Number, default: 500 },
    disciplineLevel: { type: Number, default: 0 },
    consecutiveDays: { type: Number, default: 0 },
    chestsBought: { type: Array, default: [] },
    customQuests: { type: Array, default: [] },
    theme: { type: String, default: 'dark' },
    lastPlayed: { type: Date, default: Date.now },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Хеширование пароля перед сохранением
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для проверки пароля
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Обновление updatedAt при сохранении
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
