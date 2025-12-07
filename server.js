import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { registerAuthRoutes, requireAuth, requireAdmin } from './auth.js';
import { registerMenuRoutes } from './menuRoutes.js';
import { registerOrderRoutes } from './orderRoutes.js';
import { registerCartRoutes } from './cartRoutes.js';

const app = express();

app.use(cookieParser());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

registerAuthRoutes(app);
registerMenuRoutes(app, { requireAuth, requireAdmin });
registerCartRoutes(app, { requireAuth });
registerOrderRoutes(app, { requireAuth, requireAdmin });

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});