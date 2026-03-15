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

// ─── AI ESTIMATE WITH LIVE THREE-STORE PRICING ───
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
    console.log('Status:', response.status);
    console.log('Error:', JSON.stringify(data.error));
    console.log('Content count:', data.content ? data.content.length : 0);
    console.log('Content types:', data.content ? data.content.map(b => b.type).join(',') : 'none');

    const textBlocks = (data.content || []).filter(b => b.type === 'text');
    const finalText = textBlocks.map(b => b.text || '').join('');
    console.log('Response length:', finalText.length);
    console.log('First 200 chars:', finalText.substring(0, 200));

    res.json({ ...data, content: [{ type: 'text', text: finalText }] });

  } catch (err) {
    console.error('Estimate error:', err.message);
    res.status(500).json({ error: err.message });
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
    console.error('Webhook signature error:', err.message);
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
      console.log('Activated subscription for:', session.metadata.supabase_uid);
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

// ─── CANCEL SUBSCRIPTION ───
app.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscription_id } = req.body;
    await stripe.subscriptions.cancel(subscription_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Foreman Brain server running'));
