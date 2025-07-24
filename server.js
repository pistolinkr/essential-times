const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Simple user authentication (no Firebase Auth)
const users = [
  {
    id: 'reporter',
    email: 'reporter@esil.com',
    password: 'abcd1234',
    role: 'reporter',
    name: '기자'
  },
  {
    id: 'admin',
    email: 'admin@esil.com', 
    password: 'abcd1234',
    role: 'admin',
    name: '관리자'
  }
];

// Simple in-memory storage
let articles = [];
let categories = [
  { id: 'home', name: '홈', slug: 'home', display_order: 0 },
  { id: 'politics', name: '정치', slug: 'politics', display_order: 1 },
  { id: 'economy', name: '경제', slug: 'economy', display_order: 2 },
  { id: 'society', name: '사회', slug: 'society', display_order: 3 },
  { id: 'technology', name: '기술', slug: 'technology', display_order: 4 },
  { id: 'entertainment', name: '연예', slug: 'entertainment', display_order: 5 },
  { id: 'sports', name: '스포츠', slug: 'sports', display_order: 6 }
];

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
app.use(express.static(path.join(__dirname, 'client/build')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

console.log('✅ Categories initialized:', categories.length);

// File upload configuration
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Simple login without Firebase Auth
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user in simple users array
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET_KEY || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Register new user
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password,
      role: role || 'user'
    };

    // Add to users array
    users.push(newUser);

    console.log('✅ New user registered:', newUser.email);

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get all categories (public)
app.get('/api/categories', async (req, res) => {
  try {
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get articles by category (public)
app.get('/api/categories/:slug/articles', async (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    // Get category first
    const category = categories.find(c => c.slug === slug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get articles for this category (filter from memory)
    const categoryArticles = articles.filter(article => 
      article.category_id === category.id && article.status === 'published'
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = categoryArticles.slice(startIndex, endIndex);

    res.json({
      articles: paginatedArticles,
      total: categoryArticles.length,
      page,
      limit,
      totalPages: Math.ceil(categoryArticles.length / limit)
    });
  } catch (error) {
    console.error('Error fetching category articles:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all articles (public)
app.get('/api/articles', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const publishedArticles = articles.filter(article => article.status === 'published');
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = publishedArticles.slice(startIndex, endIndex);

    res.json({
      articles: paginatedArticles,
      pagination: {
        current: page,
        total: Math.ceil(publishedArticles.length / limit),
        hasNext: page * limit < publishedArticles.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single article (public)
app.get('/api/articles/:id', (req, res) => {
  const { id } = req.params;

  try {
    const article = articles.find(a => a.id === id && a.status === 'published');
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Get author name
    const author = users.find(u => u.id === article.author_id);
    const articleWithAuthor = {
      ...article,
      author_name: author ? author.name : 'Unknown'
    };

    res.json(articleWithAuthor);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create article (protected - reporter/admin only)
app.post('/api/articles', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category_id, summary } = req.body;
    
    if (!title || !content || !category_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newArticle = {
      id: uuidv4(),
      title,
      content,
      summary: summary || '',
      category_id,
      author_id: req.user.id,
      status: 'published',
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    articles.push(newArticle);

    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update article (protected - author or admin only)
app.put('/api/articles/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category_id, summary, status } = req.body;

    const articleIndex = articles.findIndex(a => a.id === id);
    
    if (articleIndex === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = articles[articleIndex];

    // Check permissions
    if (req.user.role !== 'admin' && article.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Update article
    articles[articleIndex] = {
      ...article,
      title: title || article.title,
      content: content || article.content,
      summary: summary || article.summary,
      category_id: category_id || article.category_id,
      status: status || article.status,
      image_url: req.file ? `/uploads/${req.file.filename}` : article.image_url,
      updated_at: new Date().toISOString()
    };

    res.json(articles[articleIndex]);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete article (protected - author or admin only)
app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const articleIndex = articles.findIndex(a => a.id === id);
    
    if (articleIndex === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = articles[articleIndex];

    // Check permissions
    if (req.user.role !== 'admin' && article.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Remove article
    articles.splice(articleIndex, 1);

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's articles (protected)
app.get('/api/user/articles', authenticateToken, async (req, res) => {
  try {
    let userArticles;
    
    if (req.user.role === 'admin') {
      // Admin can see all articles
      userArticles = articles;
    } else {
      // Reporter can only see their own articles
      userArticles = articles.filter(article => article.author_id === req.user.id);
    }

    res.json(userArticles);
  } catch (error) {
    console.error('Error fetching user articles:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my articles (protected) - for compatibility
app.get('/api/my-articles', authenticateToken, async (req, res) => {
  try {
    const userArticles = articles.filter(article => article.author_id === req.user.id);
    res.json(userArticles);
  } catch (error) {
    console.error('Error fetching my articles:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all articles for admin (protected, admin only)
app.get('/api/admin/articles', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const adminArticles = articles.map(article => {
      const author = users.find(u => u.id === article.author_id);
      const category = categories.find(c => c.id === article.category_id);
      
      return {
        ...article,
        author_name: author ? author.name : 'Unknown',
        category_name: category ? category.name : 'Unknown'
      };
    });

    res.json(adminArticles);
  } catch (error) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 