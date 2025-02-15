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

    // Логируем полученное имя
    console.log('Получено имя:', name);

    // Проверяем, что имя не пустое
    if (!name) {
        console.error('Имя не передано');
        return res.status(400).json({ success: false, error: 'Имя не передано' });
    }

    const query = 'INSERT INTO records (name) VALUES (?)';

    db.query(query, [name], (err, result) => {
        if (err) {
            console.error('Ошибка при добавлении записи:', err); // Логируем ошибку
            return res.status(500).json({ success: false, error: err.message });
        }
        console.log('Запись успешно добавлена, ID:', result.insertId);
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


// Маршрут для удаления записи
app.delete('/deleteRecord/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM records WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Ошибка при удалении записи:', err);
            return res.status(500).json({ success: false, error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Запись не найдена' });
        }

        console.log('Запись удалена, ID:', id);
        res.json({ success: true });
    });
});


// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Поддержка Railway
module.exports = app;