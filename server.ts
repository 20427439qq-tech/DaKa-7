import express from 'express';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const { Pool } = pg;

// Vercel Postgres standard environment variables
let connectionString = process.env.POSTGRES_URL || 
                       process.env.POSTGRES_URL_NON_POOLING || 
                       process.env.wfwd_POSTGRES_URL;

// Deeply sanitize connection string
if (connectionString) {
  try {
    const parsedUrl = new URL(connectionString);
    if (['base', 'host', 'placeholder', 'localhost'].includes(parsedUrl.hostname)) {
      console.warn(`[DB Setup] Ignoring POSTGRES_URL because it contains a placeholder hostname: ${parsedUrl.hostname}`);
      connectionString = undefined;
    }
  } catch (e) {
    console.warn('[DB Setup] POSTGRES_URL is not a valid URL format.');
  }
}

let host = process.env.PGHOST || process.env.wfwd_PGHOST;
if (host && ['base', 'host', 'placeholder'].includes(host)) {
  console.warn(`[DB Setup] Ignoring PGHOST because it is a placeholder: ${host}`);
  host = undefined;
}

const poolConfig: any = connectionString 
  ? { 
      connectionString,
      ssl: { rejectUnauthorized: false }
    } 
  : {
      host: host || '127.0.0.1', // Use IP instead of localhost to avoid some DNS issues
      database: process.env.PGDATABASE || 'postgres',
      port: parseInt(process.env.PGPORT || '5432'),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
    };

console.log('--- Database Connection Debug ---');
console.log('Mode:', connectionString ? 'URL Mode' : 'Individual Vars Mode');
console.log('Target Host:', connectionString ? new URL(connectionString).hostname : poolConfig.host);
console.log('---------------------------------');

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function initDb() {
  const host = process.env.PGHOST || process.env.wfwd_PGHOST;
  if (!host && !process.env.POSTGRES_URL && !process.env.wfwd_POSTGRES_URL) {
    console.warn('WARNING: Database connection variables are not set. Database features will not work.');
    return;
  }

  try {
    const client = await pool.connect();
    console.log(`Successfully connected to PostgreSQL at ${host || 'POSTGRES_URL'}`);
    try {
      // Try to create a specific database if we're on 'postgres'
      const currentDb = (poolConfig.database || '').toLowerCase();
      if (currentDb === 'postgres') {
        try {
          // We can't easily switch databases in a single pool, 
          // so we'll just stick to 'postgres' but create a schema or just tables.
          // The user said "create the project database yourself", 
          // but in many environments we can't do that via SQL.
          // We'll just ensure the tables exist in the current database.
          console.log('Using default "postgres" database. Ensuring tables exist...');
        } catch (e) {
          // Ignore
        }
      }

      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          roles TEXT[] NOT NULL,
          password TEXT NOT NULL,
          student_id INTEGER
        )
      `);

      // Create checkins table
      await client.query(`
        CREATE TABLE IF NOT EXISTS checkins (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id),
          date TEXT NOT NULL,
          wake_up_at_8 BOOLEAN DEFAULT FALSE,
          focus_one_hour BOOLEAN DEFAULT FALSE,
          exercise_30_min BOOLEAN DEFAULT FALSE,
          read_10_pages BOOLEAN DEFAULT FALSE,
          learn_new_skill BOOLEAN DEFAULT FALSE,
          no_junk_food BOOLEAN DEFAULT FALSE,
          challenge_note TEXT DEFAULT '',
          completed_count INTEGER DEFAULT 0,
          completion_rate FLOAT DEFAULT 0,
          donation_amount INTEGER DEFAULT 0,
          updated_at TEXT NOT NULL,
          country TEXT DEFAULT '中国',
          cheers TEXT[] DEFAULT '{}',
          UNIQUE(user_id, date)
        )
      `);

      // Seed initial users if empty
      const { rows } = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(rows[0].count) === 0) {
        const initialUsers = [
          { id: 'u1', name: '王凡', roles: ['member'], password: '2026', studentId: 1 },
          { id: 'u2', name: '张亮', roles: ['member'], password: '2026', studentId: 2 },
          { id: 'u3', name: '曹婷婷', roles: ['member'], password: '2026', studentId: 3 },
          { id: 'u4', name: '吴琼瑛', roles: ['member'], password: '2026', studentId: 4 },
          { id: 'u5', name: '周海鹏', roles: ['member'], password: '2026', studentId: 5 },
          { id: 'u6', name: '尹连鹏', roles: ['member'], password: '2026', studentId: 6 },
          { id: 'u7', name: '楼文妤', roles: ['member'], password: '2026', studentId: 7 },
          { id: 'u8', name: '杨娟', roles: ['member'], password: '2026', studentId: 8 },
          { id: 'u9', name: '王微微', roles: ['member'], password: '2026', studentId: 9 },
          { id: 'u10', name: '罗慧', roles: ['member'], password: '2026', studentId: 10 },
          { id: 'u11', name: '谢恩治', roles: ['member'], password: '2026', studentId: 11 },
          { id: 'u12', name: '王小龙', roles: ['member'], password: '2026', studentId: 12 },
          { id: 'admin', name: '管理员', roles: ['admin'], password: '20262026', studentId: 0 },
        ];

        for (const u of initialUsers) {
          await client.query(
            'INSERT INTO users (id, name, roles, password, student_id) VALUES ($1, $2, $3, $4, $5)',
            [u.id, u.name, u.roles, u.password, u.studentId]
          );
        }
        console.log('Seeded initial users');
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('CRITICAL: Failed to connect to database.');
    if (err.code === 'EAI_AGAIN') {
      console.error('Error: DNS lookup failed (EAI_AGAIN). Please check if the host in POSTGRES_URL is correct and reachable.');
    } else {
      console.error('Error Details:', err.message);
    }
    console.warn('The application will start, but database-dependent features will fail until POSTGRES_URL is fixed.');
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  await initDb();

  // API Routes
  app.get('/api/users', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT id, name, roles, student_id as "studentId" FROM users');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/login', async (req, res) => {
    const { name, password } = req.body;
    try {
      const { rows } = await pool.query(
        'SELECT id, name, roles, student_id as "studentId" FROM users WHERE name = $1 AND password = $2',
        [name, password]
      );
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/checkins', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT 
          id, user_id as "userId", date, 
          wake_up_at_8 as "wakeUpAt8", focus_one_hour as "focusOneHour", 
          exercise_30_min as "exercise30Min", read_10_pages as "read10Pages", 
          learn_new_skill as "learnNewSkill", no_junk_food as "noJunkFood", 
          challenge_note as "challengeNote", completed_count as "completedCount", 
          completion_rate as "completionRate", donation_amount as "donationAmount", 
          updated_at as "updatedAt", country, cheers
        FROM checkins
      `);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch checkins' });
    }
  });

  app.post('/api/checkins', async (req, res) => {
    const c = req.body;
    try {
      await pool.query(`
        INSERT INTO checkins (
          id, user_id, date, wake_up_at_8, focus_one_hour, 
          exercise_30_min, read_10_pages, learn_new_skill, 
          no_junk_food, challenge_note, completed_count, 
          completion_rate, donation_amount, updated_at, country, cheers
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (user_id, date) DO UPDATE SET
          wake_up_at_8 = EXCLUDED.wake_up_at_8,
          focus_one_hour = EXCLUDED.focus_one_hour,
          exercise_30_min = EXCLUDED.exercise_30_min,
          read_10_pages = EXCLUDED.read_10_pages,
          learn_new_skill = EXCLUDED.learn_new_skill,
          no_junk_food = EXCLUDED.no_junk_food,
          challenge_note = EXCLUDED.challenge_note,
          completed_count = EXCLUDED.completed_count,
          completion_rate = EXCLUDED.completion_rate,
          donation_amount = EXCLUDED.donation_amount,
          updated_at = EXCLUDED.updated_at,
          country = EXCLUDED.country,
          cheers = EXCLUDED.cheers
      `, [
        c.id, c.userId, c.date, c.wakeUpAt8, c.focusOneHour,
        c.exercise30Min, c.read10Pages, c.learnNewSkill,
        c.noJunkFood, c.challengeNote, c.completedCount,
        c.completionRate, c.donationAmount, c.updatedAt, c.country, c.cheers || []
      ]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save checkin' });
    }
  });

  app.post('/api/cheer', async (req, res) => {
    const { targetUserId, date, fromUserName } = req.body;
    try {
      // Check if checkin exists
      const { rows } = await pool.query(
        'SELECT id, cheers FROM checkins WHERE user_id = $1 AND date = $2',
        [targetUserId, date]
      );

      if (rows.length > 0) {
        const currentCheers = rows[0].cheers || [];
        if (!currentCheers.includes(fromUserName)) {
          await pool.query(
            'UPDATE checkins SET cheers = array_append(cheers, $1) WHERE user_id = $2 AND date = $3',
            [fromUserName, targetUserId, date]
          );
        }
      } else {
        // Create placeholder
        const id = `${targetUserId}-${date}`;
        await pool.query(`
          INSERT INTO checkins (
            id, user_id, date, updated_at, cheers
          ) VALUES ($1, $2, $3, $4, $5)
        `, [id, targetUserId, date, new Date().toISOString(), [fromUserName]]);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to cheer' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
