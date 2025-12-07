import {
  users,
  createUser,
  createSession,
  getSession,
  removeSession,
  getUser,
} from './data.js';

function normalizeUsername(rawUsername) {
  if (typeof rawUsername !== 'string') {
    return '';
  }
  return rawUsername.trim();
}

function isValidUsername(username) {
  if (!username) {
    return false;
  }
  if (username.length < 2 || username.length > 20) {
    return false;
  }
  return /^[a-zA-Z0-9_]+$/.test(username);
}

function validateUsernameForAuth(rawUsername) {
  const username = normalizeUsername(rawUsername);

  if (!isValidUsername(username)) {
    return { ok: false, error: 'invalid-username' };
  }

  if (username === 'dog') {
    return { ok: false, error: 'forbidden-username' };
  }

  return { ok: true, username };
}

export function requireAuth(req, res, next) {
  const sid = req.cookies.sid;
  if (!sid) {
    res.status(401).json({ error: 'auth-missing' });
    return;
  }

  const session = getSession(sid);
  if (!session) {
    res.status(401).json({ error: 'auth-missing' });
    return;
  }

  const user = getUser(session.username);
  if (!user) {
    res.status(401).json({ error: 'auth-missing' });
    return;
  }

  if (user.username === 'dog') {
    res.status(403).json({ error: 'auth-forbidden' });
    return;
  }

  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      res.status(403).json({ error: 'not-admin' });
      return;
    }
    next();
  });
}

export function registerAuthRoutes(app) {
  app.get('/api/session', (req, res) => {
    const sid = req.cookies.sid;
    if (!sid) {
      res.json({ loggedIn: false });
      return;
    }

    const session = getSession(sid);
    if (!session) {
      res.json({ loggedIn: false });
      return;
    }

    const user = getUser(session.username);
    if (!user || user.username === 'dog') {
      res.json({ loggedIn: false });
      return;
    }

    res.json({
      loggedIn: true,
      username: user.username,
      role: user.role,
    });
  });

  app.post('/api/users', (req, res) => {
    const { username: rawUsername } = req.body || {};
    const result = validateUsernameForAuth(rawUsername);

    if (!result.ok && result.error === 'invalid-username') {
      res.status(400).json({ error: 'invalid-username' });
      return;
    }
    if (!result.ok && result.error === 'forbidden-username') {
      res.status(403).json({ error: 'forbidden-username' });
      return;
    }

    const username = result.username;

    if (users[username]) {
      res.status(409).json({ error: 'user-exists' });
      return;
    }

    const role = username === 'admin' ? 'admin' : 'user';
    const user = createUser(username, role);

    res.status(201).json({
      username: user.username,
      role: user.role,
    });
  });

  app.post('/api/sessions', (req, res) => {
    const { username: rawUsername } = req.body || {};
    const result = validateUsernameForAuth(rawUsername);

    if (!result.ok && result.error === 'invalid-username') {
      res.status(400).json({ error: 'invalid-username' });
      return;
    }
    if (!result.ok && result.error === 'forbidden-username') {
      res.status(403).json({ error: 'auth-forbidden' });
      return;
    }

    const username = result.username;
    const user = users[username];

    if (!user) {
      res.status(401).json({ error: 'user-not-found' });
      return;
    }

    const sid = createSession(username);
    res.cookie('sid', sid, {
      httpOnly: true,
      sameSite: 'lax',
    });

    res.json({
      username: user.username,
      role: user.role,
    });
  });

  app.delete('/api/sessions', (req, res) => {
    const sid = req.cookies.sid;
    if (sid) {
      removeSession(sid);
      res.clearCookie('sid');
    }
    res.json({ loggedOut: true });
  });
}