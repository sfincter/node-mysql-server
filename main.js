const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Для парсинга JSON в теле запроса

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

// Регистрация пользователя
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Заполните все поля!' });
    }

    // Хешируем пароль перед сохранением в БД
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            console.error('Ошибка при добавлении пользователя:', err);
            return res.status(500).json({ success: false, message: 'Ошибка регистрации.' });
        }
        res.json({ success: true });
    });
});

// Авторизация пользователя
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Заполните все поля!' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Ошибка при авторизации:', err);
            return res.status(500).json({ success: false, message: 'Ошибка авторизации.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: 'Пользователь не найден.' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Неверный пароль.' });
        }

        // Генерация JWT-токена
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ success: true, token });
    });
});

// Middleware для проверки токена
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.redirect('/register');  // Если нет токена, перенаправляем на страницу регистрации
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Недействительный токен.' });
        }
        req.user = decoded;
        next();
    });
}

// Главная страница (проверка авторизации)
app.get('/', verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Страница регистрации
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});