const express = require('express');
const cors = require('cors');
const app = express();

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PRICE_ID = process.env.STRIPE_PRICE_ID;

let stripe;
try { stripe = require('stripe')(STRIPE_SECRET); } catch(e) {}

app.use(cors({ origin: '*', methods: ['GET','POST'], allowedHeaders: ['Content-Type','stripe-signature'] }));
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/', (req, res) => res.send('Foreman Brain server is running'));

// ─── STEP 1: Generate estimate without prices ───
app.post('/estimate', async (req, res) => {
  try {
    const { system, messages, model, max_tokens } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 4000,
        system: system,
        messages: messages
      })
    });

    const data = await response.json();
    const textBlocks = (data.content || []).filter(b => b.type === 'text');
    const finalText = textBlocks.map(b => b.text || '').join('');
    console.log('Estimate response length:', finalText.length);
    res.json({ ...data, content: [{ type: 'text', text: finalText }] });

  } catch (err) {
    console.error('Estimate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── STEP 2: Price lookup for individual items ───
app.post('/price-lookup', async (req, res) => {
  try {
    const { items } = req.body;

    // Search for prices one batch at a time
    const batchSize = 5;
    const allPrices = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const pricePrompt = `Search for current 2026 prices for these electrical items at Home Depot, Lowe's, and Platt Electric. After searching, output ONLY a JSON array with no other text:\n\n${batch.map((item, j) => `${j+1}. ${item}`).join('\n')}\n\nJSON format:\n[{"item":"name","homedepot_unit":0,"homedepot_available":false,"lowes_unit":0,"lowes_available":false,"platt_unit":0,"platt_available":false}]\n\nONLY output the JSON array after searching.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 15 }],
          messages: [{ role: 'user', content: pricePrompt }]
        })
      });

      const data = await response.json();
      const textBlocks = (data.content || []).filter(b => b.type === 'text');
      const text = textBlocks.map(b => b.text || '').join('');
      console.log(`Batch ${i/batchSize + 1} response:`, text.substring(0, 200));

      try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const match = cleaned.match(/\[[\s\S]*\]/);
        if (match) {
          const batchPrices = JSON.parse(match[0]);
          allPrices.push(...batchPrices);
        }
      } catch(e) {
        console.error('Batch parse error:', e.message);
        // Add empty prices for this batch so items still show
        batch.forEach(item => allPrices.push({
          item, homedepot_unit: 0, homedepot_available: false,
          lowes_unit: 0, lowes_available: false,
          platt_unit: 0, platt_available: false
        }));
      }
    }

    console.log('Total prices found:', allPrices.length);
    res.json({ prices: allPrices });

  } catch (err) {
    console.error('Price lookup error:', err.message);
    res.json({ prices: [] });
  }
});

// ─── STRIPE CHECKOUT ───
app.get('/checkout', async (req, res) => {
  try {
    const { email, uid } = req.query;
    if (!email || !uid) return res.status(400).send('Missing email or uid');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: 'https://jflow111.github.io/Foreman-Brain/app.html',
      cancel_url: 'https://jflow111.github.io/Foreman-Brain/auth.html',
      metadata: { supabase_uid: uid }
    });
    res.redirect(303, session.url);
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).send('Checkout failed: ' + err.message);
  }
});

// ─── STRIPE WEBHOOK ───
app.post('/webhook', async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send('Webhook error');
  }

  const supabaseHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY
  };

  async function updateSubscription(uid, customerId, subscriptionId, status) {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`, {
      method: 'PATCH',
      headers: supabaseHeaders,
      body: JSON.stringify({ stripe_customer_id: customerId, stripe_subscription_id: subscriptionId, subscription_status: status })
    });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await updateSubscription(session.metadata.supabase_uid, session.customer, session.subscription, 'active');
    }
    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.paused') {
      const sub = event.data.object;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?stripe_customer_id=eq.${sub.customer}`, { headers: supabaseHeaders });
      const users = await r.json();
      if (users && users.length > 0) await updateSubscription(users[0].id, sub.customer, sub.id, 'inactive');
    }
    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const status = sub.status === 'active' ? 'active' : 'inactive';
      const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?stripe_customer_id=eq.${sub.customer}`, { headers: supabaseHeaders });
      const users = await r.json();
      if (users && users.length > 0) await updateSubscription(users[0].id, sub.customer, sub.id, status);
    }
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?stripe_customer_id=eq.${invoice.customer}`, { headers: supabaseHeaders });
      const users = await r.json();
      if (users && users.length > 0) await updateSubscription(users[0].id, invoice.customer, null, 'inactive');
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
  }
  res.json({ received: true });
});

app.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscription_id } = req.body;
    await stripe.subscriptions.cancel(subscription_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 8080, () => console.log('Foreman Brain server running on port', process.env.PORT || 8080));
