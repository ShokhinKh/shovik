const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- РЕГИСТРАЦИЯ И ВХОД ---

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, middleName, phone, email, password } = req.body;
    
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email или телефоном уже существует' });
    }

    const newUser = await prisma.user.create({
      data: { firstName, lastName, middleName, phone, email, password, role: 'USER' }
    });

    res.status(201).json({ message: 'Успешная регистрация', user: newUser });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { phone: login }],
        password: password
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    res.json({ message: 'Успешный вход', user });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// --- СТАТЬИ ---

app.get('/api/articles/latest', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' }
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось загрузить статьи' });
  }
});

app.get('/api/articles/category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const articles = await prisma.article.findMany({
      where: { category: categoryName },
      orderBy: { createdAt: 'desc' }
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось загрузить статьи данной категории' });
  }
});

app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id: Number(id) }
    });

    if (!article) return res.status(404).json({ error: 'Статья не найдена' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при получении статьи' });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const { title, category, authorName, excerpt, coverUrl, authorAvatar, content } = req.body;

    const newArticle = await prisma.article.create({
      data: {
        title,
        category,
        authorName,
        excerpt,
        coverUrl,
        authorAvatar,
        contentJson: JSON.stringify(content || [])
      }
    });

    res.status(201).json(newArticle);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось создать статью' });
  }
});

// --- АДМИНКА И ОТЗЫВЫ ---

app.post('/api/admin/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    const admin = await prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { phone: login }],
        password: password,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Неверные данные или нет прав администратора' });
    }

    res.json({ token: 'fake-admin-jwt-token' });
  } catch (error) {
    console.error('Ошибка сервера при авторизации админа:', error);
    res.status(500).json({ error: 'Ошибка сервера при авторизации' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const reviews = await prisma.review.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось загрузить отзывы' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { userId, rating, text } = req.body;
    const newReview = await prisma.review.create({
      data: {
        userId: Number(userId),
        rating: Number(rating),
        text
      }
    });
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: 'Не удалось сохранить отзыв' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});