const express = require('express');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

mysql://root:LuqNCXZMEiHtvCZQWvjXMjJXkMndbCGH@interchange.proxy.rlwy.net:44057/railway



// Подключение к MySQL
let db = mysql.createConnection({
    host: 'interchange.proxy.rlwy.net',
    user: 'root',
    password: 'LuqNCXZMEiHtvCZQWvjXMjJXkMndbCGH',
    database: 'railway'
});

db.connect(err => {
    if (err) {
        console.error('Ошибка подключения к MySQL:', err);
        return;
    }
    console.log('Подключено к MySQL');
});

// Раздача статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Поддержка Railway
module.exports = app;