const orders = [];

const CATALOG = {
  'starter-kit': { id: 'starter-kit', name: 'SniffScape Starter Kit', price: 999 }
};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST /api/orders' });
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      var parsed = JSON.parse(body || '{}');
    } catch (e) {
      return res.status(400).json({ error: 'Invalid request body.' });
    }

    const { name, email, phone, address, items } = parsed;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }
    if (!address || !String(address).trim()) {
      return res.status(400).json({ error: 'Delivery address is required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Add items before checkout.' });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = CATALOG[item.id];
      if (!product) {
        return res.status(400).json({ error: 'Unknown product in cart: ' + String(item.id) });
      }
      const qty = Math.max(1, parseInt(item.qty) || 1);
      orderItems.push({ id: product.id, name: product.name, price: product.price, qty });
      total += product.price * qty;
    }

    const orderId = 'SNIF-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();

    const order = {
      id: orderId,
      customer: {
        name: String(name).trim(),
        email: String(email).trim(),
        phone: String(phone).trim(),
        address: String(address).trim()
      },
      items: orderItems,
      total: total,
      currency: 'INR',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    orders.push(order);

    return res.status(201).json({ orderId, total, currency: 'INR', status: 'confirmed' });
  });
};
