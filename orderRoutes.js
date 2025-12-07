import {
  getAllOrders,
  getOrder,
  getOrdersByOwner,
  createOrder,
  updateOrderStatus,
  menuItems,
  setCart,
} from './data.js';

function sanitizeOrderItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return null;
  }

  const sanitized = [];

  for (const raw of rawItems) {
    const id = raw.menuItemId;
    const qty = Number(raw.quantity);

    if (!id || !menuItems[id]) {
      return null;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      return null;
    }

    sanitized.push({ menuItemId: id, quantity: qty });
  }

  return sanitized;
}

function computeTotalPrice(items) {
  let total = 0;
  for (const item of items) {
    const menuItem = menuItems[item.menuItemId];
    total += menuItem.price * item.quantity;
  }
  return Number(total.toFixed(2));
}

export function registerOrderRoutes(app, { requireAuth, requireAdmin }) {
  app.get('/api/orders', requireAuth, (req, res) => {
    const myOrders = getOrdersByOwner(req.user.username);
    res.json({ orders: myOrders });
  });

  app.get('/api/orders/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const order = getOrder(id);

    if (!order || order.owner !== req.user.username) {
      res.status(404).json({ error: 'order-not-found' });
      return;
    }

    res.json({ order });
  });

  app.post('/api/orders', requireAuth, (req, res) => {
    const { items: rawItems } = req.body || {};
    const items = sanitizeOrderItems(rawItems);

    if (!items) {
      res.status(400).json({ error: 'invalid-order-items' });
      return;
    }

    const totalPrice = computeTotalPrice(items);

    const order = createOrder({
      owner: req.user.username,
      items,
      totalPrice,
    });

    setCart(req.user.username, []);

    res.status(201).json({ order });
  });

  app.patch('/api/orders/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};
    const order = getOrder(id);

    if (!order || order.owner !== req.user.username) {
      res.status(404).json({ error: 'order-not-found' });
      return;
    }

    if (status !== 'canceled') {
      res.status(400).json({ error: 'invalid-status-for-user' });
      return;
    }

    if (order.status !== 'pending') {
      res.status(400).json({ error: 'cannot-cancel' });
      return;
    }

    const updated = updateOrderStatus(id, 'canceled');
    res.json({ order: updated });
  });

  app.get('/api/admin/orders', requireAdmin, (req, res) => {
    const all = getAllOrders();
    res.json({ orders: all });
  });

  app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowedStatus = ['pending', 'preparing', 'ready', 'completed', 'canceled'];
    if (!allowedStatus.includes(status)) {
      res.status(400).json({ error: 'invalid-status' });
      return;
    }

    const order = getOrder(id);
    if (!order) {
      res.status(404).json({ error: 'order-not-found' });
      return;
    }

    const updated = updateOrderStatus(id, status);
    res.json({ order: updated });
  });
}