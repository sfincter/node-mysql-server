const express = require('express');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

// Подключение к MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
app.use(express.json()); // Для парсинга JSON в теле запроса

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Маршрут для добавления записи
app.post('/addRecord', (req, res) => {
    const { name } = req.body;
    const query = 'INSERT INTO records (name) VALUES (?)';
    db.query(query, [name], (err, result) => {
        if (err) {
            console.error('Ошибка добавления записи:', err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

// Маршрут для получения списка записей
app.get('/getRecords', (req, res) => {
    const query = 'SELECT * FROM records';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Ошибка получения записей:', err);
            return res.status(500).json({ success: false });
        }
        res.json({ records: results });
    });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Поддержка Railway
module.exports = app;