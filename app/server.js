const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_CONFIG = {
  host: process.env.DB_HOST || 'mysql-service',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME || 'studentdb',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
};

let pool;

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const studentsRegisteredTotal = new client.Counter({
  name: 'students_registered_total',
  help: 'Total number of students registered',
  registers: [register],
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
  });
  next();
});

async function initDatabase() {
  pool = mysql.createPool(DB_CONFIG);

  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        department VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized: students table ready');
  } finally {
    connection.release();
  }
}

async function waitForDatabase(maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await initDatabase();
      return;
    } catch (err) {
      console.log(`Waiting for MySQL (attempt ${attempt}/${maxAttempts}): ${err.message}`);
      if (attempt === maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      pool = undefined;
    }
  }
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/students', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, department, created_at FROM students ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/students', async (req, res) => {
  const { name, email, department } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ error: 'name, email, and department are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO students (name, email, department) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), department.trim()]
    );
    studentsRegisteredTotal.inc();
    res.status(201).json({
      message: 'Student registered successfully',
      student: { id: result.insertId, name, email, department },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function startServer() {
  await waitForDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
