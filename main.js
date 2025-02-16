const express = require('express');
const mysql = require('mysql2/promise'); // Используем promise-версию MySQL
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MySQL
let db;
(async () => {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('Подключено к MySQL');
    } catch (err) {
        console.error('Ошибка подключения к MySQL:', err);
        process.exit(1); // Остановить сервер при неудачном подключении
    }
})();

// Регистрация пользователя
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Заполните все поля!' });
        }

        // Проверяем, существует ли пользователь
        const [existingUsers] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Такой пользователь уже существует!' });
        }

        // Хешируем пароль перед сохранением в БД
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.json({ success: true, message: 'Пользователь зарегистрирован!' });
    } catch (err) {
        console.error('Ошибка при регистрации:', err);
        res.status(500).json({ success: false, message: 'Ошибка регистрации.' });
    }
});

// Авторизация пользователя
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Заполните все поля!' });
        }

        // Проверяем, есть ли пользователь в базе
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Пользователь не найден.' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Неверный пароль.' });
        }

        // Генерация JWT-токена
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ success: true, token });
    } catch (err) {
        console.error('Ошибка при авторизации:', err);
        res.status(500).json({ success: false, message: 'Ошибка авторизации.' });
    }
});

// Главная страница (по умолчанию login.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Страница пользователя (dashboard)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
