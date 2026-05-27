const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sit-scholarship-secret';
const DB_FILE = path.join(__dirname, 'data.json');

const defaultDb = {
  users: [],
  scholarships: [],
  applications: []
};

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, originalHash] = stored.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
}

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function signJWT(payload) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${body}.${sig}`;
}
function verifyJWT(token) {
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (expected !== s) return null;
  const payload = JSON.parse(Buffer.from(p, 'base64').toString('utf8'));
  if (payload.exp < Date.now()) return null;
  return payload;
}

function id() { return crypto.randomUUID(); }

function validateRequired(data, fields) {
  const missing = fields.filter(f => !data[f]);
  return missing.length ? `Missing: ${missing.join(', ')}` : null;
}

function auth(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  return token ? verifyJWT(token) : null;
}

function serveStatic(req, res) {
  let filePath = req.url === '/' ? '/public/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  if (!filePath.startsWith(path.join(__dirname, 'public'))) return false;
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
  res.end(fs.readFileSync(filePath));
  return true;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });
  if (req.url.startsWith('/public') || req.url === '/' ) {
    if (serveStatic(req, res)) return;
  }

  const db = loadDb();

  if (req.url === '/api/auth/register' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const e = validateRequired(body, ['name', 'email', 'password']);
      if (e) return json(res, 400, { error: e });
      if (body.password.length < 8) return json(res, 400, { error: 'Password min 8 chars' });
      if (db.users.find(u => u.email === body.email)) return json(res, 409, { error: 'Email exists' });
      const user = { id: id(), name: body.name, email: body.email, passwordHash: hashPassword(body.password), role: body.role === 'admin' ? 'admin' : 'user' };
      db.users.push(user); saveDb(db);
      return json(res, 201, { id: user.id, email: user.email, role: user.role });
    } catch (err) { return json(res, 400, { error: err.message }); }
  }

  if (req.url === '/api/auth/login' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const user = db.users.find(u => u.email === body.email);
      if (!user || !verifyPassword(body.password || '', user.passwordHash)) return json(res, 401, { error: 'Invalid credentials' });
      const token = signJWT({ sub: user.id, role: user.role, name: user.name, exp: Date.now() + 24 * 60 * 60 * 1000 });
      return json(res, 200, { token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) { return json(res, 400, { error: err.message }); }
  }

  if (req.url === '/api/users' && req.method === 'GET') {
    const p = auth(req); if (!p || p.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    return json(res, 200, db.users.map(({passwordHash, ...u}) => u));
  }

  if (req.url.startsWith('/api/users/') && req.method === 'PUT') {
    const p = auth(req); if (!p || p.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const userId = req.url.split('/').pop();
    const user = db.users.find(u => u.id === userId); if (!user) return json(res, 404, { error: 'Not found' });
    const body = await parseBody(req);
    if (body.role && ['admin', 'user'].includes(body.role)) user.role = body.role;
    if (body.name) user.name = body.name;
    saveDb(db); return json(res, 200, { message: 'Updated', user: { id: user.id, name: user.name, role: user.role }});
  }

  if (req.url === '/api/scholarships' && req.method === 'GET') return json(res, 200, db.scholarships);
  if (req.url === '/api/scholarships' && req.method === 'POST') {
    const p = auth(req); if (!p || p.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const body = await parseBody(req); const e = validateRequired(body, ['title', 'amount', 'description']); if (e) return json(res, 400, { error: e });
    const item = { id: id(), ...body, createdAt: new Date().toISOString() }; db.scholarships.push(item); saveDb(db); return json(res, 201, item);
  }
  if (req.url.startsWith('/api/scholarships/') && req.method === 'PUT') {
    const p = auth(req); if (!p || p.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const sid = req.url.split('/').pop(); const s = db.scholarships.find(x => x.id === sid); if (!s) return json(res, 404, { error: 'Not found' });
    const body = await parseBody(req); Object.assign(s, body); saveDb(db); return json(res, 200, s);
  }
  if (req.url.startsWith('/api/scholarships/') && req.method === 'DELETE') {
    const p = auth(req); if (!p || p.role !== 'admin') return json(res, 403, { error: 'Admin only' });
    const sid = req.url.split('/').pop(); db.scholarships = db.scholarships.filter(x => x.id !== sid); saveDb(db); return json(res, 200, { message: 'Deleted' });
  }

  if (req.url === '/api/applications' && req.method === 'GET') {
    const p = auth(req); if (!p) return json(res, 401, { error: 'Unauthorized' });
    return json(res, 200, p.role === 'admin' ? db.applications : db.applications.filter(a => a.userId === p.sub));
  }
  if (req.url === '/api/applications' && req.method === 'POST') {
    const p = auth(req); if (!p) return json(res, 401, { error: 'Unauthorized' });
    const body = await parseBody(req); const e = validateRequired(body, ['scholarshipId', 'gpa', 'statement']); if (e) return json(res, 400, { error: e });
    if (Number(body.gpa) < 0 || Number(body.gpa) > 4) return json(res, 400, { error: 'GPA must be 0-4' });
    const app = { id: id(), userId: p.sub, status: 'pending', ...body }; db.applications.push(app); saveDb(db); return json(res, 201, app);
  }

  if (req.url === '/api/external/exchange-rates' && req.method === 'GET') {
    const rates = { THB: 1, USD: 0.027, EUR: 0.025 };
    return json(res, 200, { fetchedAt: new Date().toISOString(), rates });
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`SIT Scholarship server running at http://localhost:${PORT}`));
