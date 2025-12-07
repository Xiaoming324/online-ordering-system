import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  menuItems,
} from './data.js';

const ALLOWED_CATEGORIES = ['main', 'side', 'drink', 'dessert'];

function sanitizeString(value, maxLength = 200) {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.slice(0, maxLength);
}

function sanitizePrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  return Number(num.toFixed(2));
}

function sanitizeCategory(value) {
  const cat = sanitizeString(value, 50);
  if (!ALLOWED_CATEGORIES.includes(cat)) {
    return null;
  }
  return cat;
}

export function registerMenuRoutes(app, { requireAuth, requireAdmin }) {
  app.get('/api/menu-items', (req, res) => {
    const items = getAllMenuItems();
    res.json({ items });
  });

  app.post('/api/menu-items', requireAdmin, (req, res) => {
    const { name, price, description, category, imageUrl } = req.body || {};

    const cleanName = sanitizeString(name, 100);
    const cleanDesc = sanitizeString(description, 300);
    const cleanPrice = sanitizePrice(price);
    const cleanCategory = sanitizeCategory(category);
    const cleanImageUrl = sanitizeString(imageUrl, 300);

    if (!cleanName || !cleanDesc || !cleanPrice || !cleanCategory) {
      res.status(400).json({ error: 'invalid-menu-item' });
      return;
    }

    const item = createMenuItem({
      name: cleanName,
      price: cleanPrice,
      description: cleanDesc,
      category: cleanCategory,
      imageUrl: cleanImageUrl,
    });

    res.status(201).json({ item });
  });

  app.patch('/api/menu-items/:id', requireAdmin, (req, res) => {
    const { id } = req.params;

    if (!menuItems[id]) {
      res.status(404).json({ error: 'menu-item-not-found' });
      return;
    }

    const { name, price, description, category, imageUrl } = req.body || {};
    const updates = {};

    if (typeof name === 'string') {
      const cleanName = sanitizeString(name, 100);
      if (!cleanName) {
        res.status(400).json({ error: 'invalid-name' });
        return;
      }
      updates.name = cleanName;
    }

    if (price !== undefined) {
      const cleanPrice = sanitizePrice(price);
      if (!cleanPrice) {
        res.status(400).json({ error: 'invalid-price' });
        return;
      }
      updates.price = cleanPrice;
    }

    if (typeof description === 'string') {
      updates.description = sanitizeString(description, 300);
    }

    if (typeof category === 'string') {
      const cleanCategory = sanitizeCategory(category);
      if (!cleanCategory) {
        res.status(400).json({ error: 'invalid-category' });
        return;
      }
      updates.category = cleanCategory;
    }

    if (typeof imageUrl === 'string') {
      updates.imageUrl = sanitizeString(imageUrl, 300);
    }

    const updated = updateMenuItem(id, updates);
    res.json({ item: updated });
  });

  app.delete('/api/menu-items/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const ok = deleteMenuItem(id);
    if (!ok) {
      res.status(404).json({ error: 'menu-item-not-found' });
      return;
    }
    res.json({ deleted: true });
  });
}