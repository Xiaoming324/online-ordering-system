import crypto from 'crypto';

export const sessions = Object.create(null);
export const users = Object.create(null);
export const menuItems = Object.create(null);
export const orders = Object.create(null);
export const carts = Object.create(null);

let nextMenuId = 1;
let nextOrderId = 1;

users.admin = {
  username: 'admin',
  role: 'admin',
};

export function createUser(username, role = 'user') {
  if (users[username]) {
    return users[username];
  }
  const user = { username, role };
  users[username] = user;
  return user;
}

export function getUser(username) {
  return users[username] || null;
}

export function createSession(username) {
  const sid = crypto.randomUUID();
  sessions[sid] = { username };
  return sid;
}

export function getSession(sid) {
  return sessions[sid] || null;
}

export function removeSession(sid) {
  delete sessions[sid];
}

export function createMenuItem({ name, price, description, category, imageUrl }) {
  const id = String(nextMenuId++);
  const item = {
    id,
    name,
    price,
    description,
    category,
    imageUrl,
  };
  menuItems[id] = item;
  return item;
}

export function updateMenuItem(id, updates) {
  const item = menuItems[id];
  if (!item) {
    return null;
  }

  const { name, price, description, category, imageUrl } = updates;

  if (typeof name === 'string') {
    item.name = name;
  }
  if (typeof price === 'number') {
    item.price = price;
  }
  if (typeof description === 'string') {
    item.description = description;
  }
  if (typeof category === 'string') {
    item.category = category;
  }
  if (typeof imageUrl === 'string') {
    item.imageUrl = imageUrl;
  }

  return item;
}

export function deleteMenuItem(id) {
  if (!menuItems[id]) {
    return false;
  }
  delete menuItems[id];
  return true;
}

export function getAllMenuItems() {
  return Object.values(menuItems);
}

export function createOrder({ owner, items, totalPrice }) {
  const id = String(nextOrderId++);
  const order = {
    id,
    owner,
    items,
    totalPrice,
    status: 'pending',
    createdAt: Date.now(),
  };
  orders[id] = order;
  return order;
}

export function getOrder(id) {
  return orders[id] || null;
}

export function getOrdersByOwner(username) {
  return Object.values(orders).filter((order) => order.owner === username);
}

export function getAllOrders() {
  return Object.values(orders);
}

export function updateOrderStatus(id, status) {
  const order = orders[id];
  if (!order) {
    return null;
  }
  order.status = status;
  return order;
}

export function getCart(username) {
  return carts[username] || [];
}

export function setCart(username, items) {
  if (!Array.isArray(items) || items.length === 0) {
    delete carts[username];
    return;
  }
  carts[username] = items;
}

createMenuItem({
  name: 'Kung Pao Chicken',
  price: 14.5,
  description: 'Stir-fried diced chicken with peanuts in a mildly spicy sauce.',
  category: 'main',
  imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1013&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});

createMenuItem({
  name: 'Shredded Pork in Garlic Sauce',
  price: 13.5,
  description: 'Classic sweet and sour garlicky pork, mildly spicy.',
  category: 'main',
  imageUrl: 'https://images.unsplash.com/photo-1658713064117-51f51ecfaf69?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});

createMenuItem({
  name: 'Beef Fried Rice',
  price: 12.0,
  description: 'Egg fried rice with sliced beef and mixed vegetables.',
  category: 'main',
  imageUrl: 'https://images.unsplash.com/photo-1723691802798-fa6efc67b2c9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});

createMenuItem({
  name: 'House Stir-Fried Noodles',
  price: 11.5,
  description: 'Wok-fried noodles with mixed vegetables and sliced meat.',
  category: 'main',
  imageUrl: 'https://images.unsplash.com/photo-1592778024292-d6782d22add7?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});

createMenuItem({
  name: 'Spring Rolls',
  price: 6.0,
  description: 'Crispy fried spring rolls stuffed with vegetables.',
  category: 'side',
  imageUrl: 'https://images.unsplash.com/photo-1695712641569-05eee7b37b6d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});

createMenuItem({
  name: 'Hot and Sour Soup',
  price: 5.0,
  description: 'Classic hot and sour soup, great as a starter.',
  category: 'side',
  imageUrl: 'https://images.unsplash.com/photo-1616501268826-ee9731c915d4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});

createMenuItem({
  name: 'Coke',
  price: 3.0,
  description: 'Chilled carbonated soft drink.',
  category: 'drink',
  imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});

createMenuItem({
  name: 'Iced Lemon Tea',
  price: 3.5,
  description: 'House-made iced lemon tea, lightly sweetened.',
  category: 'drink',
  imageUrl: 'https://images.unsplash.com/photo-1599390719613-912787a6e65a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});

createMenuItem({
  name: 'Mango Pudding',
  price: 6.5,
  description: 'Creamy mango-flavored pudding dessert.',
  category: 'dessert',
  imageUrl: 'https://images.unsplash.com/photo-1561316960-518ca5a32e3a?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});

createMenuItem({
  name: 'Coconut Sago Dessert',
  price: 6.5,
  description: 'Coconut milk dessert with sago pearls and fruit.',
  category: 'dessert',
  imageUrl: 'https://images.unsplash.com/photo-1722982971717-9c8e050facb4?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
});