// Функция для регистрации пользователя
async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !password) {
        showError('Заполните все поля!');
        return;
    }

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
        showError('');
        alert('Регистрация успешна! Теперь можете войти.');
    } else {
        showError(data.message || 'Ошибка регистрации.');
    }
}

// Функция для авторизации пользователя
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showError('Заполните все поля!');
        return;
    }

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (data.success) {
        showError('');
        localStorage.setItem('token', data.token); // Сохраняем токен в localStorage
        showWelcomeMessage();
    } else {
        showError(data.message || 'Ошибка авторизации.');
    }
}

// Функция для показа сообщения об ошибке
function showError(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = message;
}

// Функция для отображения приветственного сообщения
function showWelcomeMessage() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('welcomeMessage').style.display = 'block';
}

// Функция для выхода
function logout() {
    localStorage.removeItem('token');
    document.getElementById('welcomeMessage').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'block';
}
