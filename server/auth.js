const crypto = require('crypto');

// Consistent server secret for HMAC signing so restarts do not invalidate valid sessions
const JWT_SECRET = process.env.SESSION_SECRET || 'noname_laundry_bangkok_secure_secret_key_2026';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days session duration

function hashPassword(password, salt = null) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return { hash, salt: generatedSalt };
}

function verifyPassword(password, hash, salt) {
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
}

function createSession(user) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role || 'admin',
    expiresAt
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  const token = `${data}.${signature}`;
  return { token, expiresAt };
}

function getSession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

function deleteSession(token) {
  // Stateless token; client drops the token on logout
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const session = getSession(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }

  req.adminUser = session;
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSession,
  getSession,
  deleteSession,
  requireAdminAuth
};
