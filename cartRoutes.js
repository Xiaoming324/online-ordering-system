import { menuItems, getCart, setCart } from './data.js';

function sanitizeCartItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return null;
  }

  if (rawItems.length === 0) {
    return [];
  }

  const sanitized = [];

  for (const raw of rawItems) {
    const id = raw.menuItemId;
    const qty = Number(raw.quantity);

    const menuItem = id && menuItems[id];

    if (!menuItem) {
      return null;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      return null;
    }

    sanitized.push({
      menuItemId: id,
      quantity: qty,
      name: menuItem.name,
      price: menuItem.price,
    });
  }

  return sanitized;
}

export function registerCartRoutes(app, { requireAuth }) {
  app.get('/api/cart', requireAuth, (req, res) => {
    const username = req.user.username;
    const current = getCart(username).filter((item) => menuItems[item.menuItemId]);
    res.json({ items: current });
  });

  app.put('/api/cart', requireAuth, (req, res) => {
    const { items: rawItems } = req.body || {};
    const items = sanitizeCartItems(rawItems);

    if (items === null) {
      res.status(400).json({ error: 'invalid-cart-items' });
      return;
    }

    const username = req.user.username;
    setCart(username, items);
    res.json({ items });
  });
}