const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
app.use(express.static(path.join(__dirname, 'client/build')));

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize default categories in Supabase
async function initializeCategories() {
  try {
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('*');

    if (!existingCategories || existingCategories.length === 0) {
      const defaultCategories = [
        { name: '홈', slug: 'home', display_order: 0 },
        { name: '정치', slug: 'politics', display_order: 1 },
        { name: '경제', slug: 'economy', display_order: 2 },
        { name: '사회', slug: 'society', display_order: 3 },
        { name: '기술', slug: 'technology', display_order: 4 },
        { name: '연예', slug: 'entertainment', display_order: 5 },
        { name: '스포츠', slug: 'sports', display_order: 6 }
      ];

      const { error } = await supabase
        .from('categories')
        .insert(defaultCategories);

      if (error) {
        console.error('Error inserting default categories:', error);
      } else {
        console.log('Default categories initialized');
      }
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
}

// Initialize categories on startup
initializeCategories();

// File upload configuration
const storage = multer.diskStorage({
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
  storage: storage,
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

// Routes

// Login with Supabase Auth
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: userProfile.id, 
        email: userProfile.email, 
        role: userProfile.role 
      },
      process.env.JWT_SECRET_KEY || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all categories (public)
app.get('/api/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get articles by category (public)
app.get('/api/categories/:slug/articles', (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all(
    `SELECT a.*, u.name as author_name, c.name as category_name 
     FROM articles a 
     JOIN users u ON a.author_id = u.id 
     JOIN categories c ON a.category_id = c.id 
     WHERE c.slug = ? AND a.status = 'published' 
     ORDER BY a.created_at DESC 
     LIMIT ? OFFSET ?`,
    [slug, limit, offset],
    (err, articles) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      db.get(
        `SELECT COUNT(*) as total 
         FROM articles a 
         JOIN categories c ON a.category_id = c.id 
         WHERE c.slug = ? AND a.status = 'published'`,
        [slug],
        (err, count) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            articles,
            pagination: {
              current: page,
              total: Math.ceil(count.total / limit),
              hasNext: page * limit < count.total,
              hasPrev: page > 1
            }
          });
        }
      );
    }
  );
});

// Get all articles (public)
app.get('/api/articles', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  db.all(
    `SELECT a.*, u.name as author_name, c.name as category_name 
     FROM articles a 
     JOIN users u ON a.author_id = u.id 
     LEFT JOIN categories c ON a.category_id = c.id 
     WHERE a.status = 'published' 
     ORDER BY a.created_at DESC 
     LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, articles) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      db.get('SELECT COUNT(*) as total FROM articles WHERE status = "published"', (err, count) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          articles,
          pagination: {
            current: page,
            total: Math.ceil(count.total / limit),
            hasNext: page * limit < count.total,
            hasPrev: page > 1
          }
        });
      });
    }
  );
});

// Get single article (public)
app.get('/api/articles/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT a.*, u.name as author_name 
     FROM articles a 
     JOIN users u ON a.author_id = u.id 
     WHERE a.id = ? AND a.status = 'published'`,
    [id],
    (err, article) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json(article);
    }
  );
});

// Create article (authenticated)
app.post('/api/articles', authenticateToken, upload.single('image'), (req, res) => {
  const { title, content, category_id } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  db.run(
    'INSERT INTO articles (title, content, author_id, author_name, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [title, content, req.user.id, req.user.name, category_id || null, imageUrl],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        content,
        author_id: req.user.id,
        author_name: req.user.name,
        category_id: category_id || null,
        image_url: imageUrl,
        status: 'published',
        created_at: new Date().toISOString()
      });
    }
  );
});

// Update article (author or admin only)
app.put('/api/articles/:id', authenticateToken, upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, content, category_id } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Check if user can edit this article
  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, article) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (req.user.role !== 'admin' && article.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this article' });
    }

    const updateFields = [];
    const updateValues = [];

    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }

    if (content) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }

    if (category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(category_id || null);
    }

    if (imageUrl) {
      updateFields.push('image_url = ?');
      updateValues.push(imageUrl);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    db.run(
      `UPDATE articles SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues,
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ message: 'Article updated successfully' });
      }
    );
  });
});

// Delete article (author or admin only)
app.delete('/api/articles/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, article) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (req.user.role !== 'admin' && article.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this article' });
    }

    db.run('DELETE FROM articles WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ message: 'Article deleted successfully' });
    });
  });
});

// Get user's articles (authenticated)
app.get('/api/my-articles', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, articles) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(articles);
    }
  );
});

// Get all articles for admin (authenticated, admin only)
app.get('/api/admin/articles', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all(
    `SELECT a.*, u.name as author_name, c.name as category_name 
     FROM articles a 
     JOIN users u ON a.author_id = u.id 
     LEFT JOIN categories c ON a.category_id = c.id 
     ORDER BY a.created_at DESC`,
    (err, articles) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(articles);
    }
  );
});

// Category management (admin only)
app.get('/api/admin/categories', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all(
    'SELECT * FROM categories ORDER BY display_order ASC',
    (err, categories) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(categories);
    }
  );
});

app.post('/api/admin/categories', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, slug, display_order } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug are required' });
  }

  db.run(
    'INSERT INTO categories (name, slug, display_order) VALUES (?, ?, ?)',
    [name, slug, display_order || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        slug,
        display_order: display_order || 0
      });
    }
  );
});

app.put('/api/admin/categories/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  const { name, slug, display_order } = req.body;

  db.run(
    'UPDATE categories SET name = ?, slug = ?, display_order = ? WHERE id = ?',
    [name, slug, display_order, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ message: 'Category updated successfully' });
    }
  );
});

app.delete('/api/admin/categories/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;

  db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ message: 'Category deleted successfully' });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 