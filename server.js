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

    const livePricingSystem = system + `

LIVE PRICING INSTRUCTIONS — THREE STORES:
You have access to a web search tool. For EVERY item in the materialTakeoff array, search for the current retail price at Home Depot, Lowe's, and Platt Electric.

SEARCH STRATEGY — be very specific:
- For wire/cable: include gauge, type, and length. Example: "Romex 12/2 NM-B wire 250ft Home Depot price 2026"
- For breakers: include brand, amp rating, type. Example: "Square D 20 amp single pole breaker Home Depot price 2026"
- For boxes/devices: include exact type and size. Example: "1-gang PVC electrical box Home Depot price 2026"
- For conduit/fittings: include material and size. Example: "1/2 inch EMT conduit 10ft Home Depot price 2026"
- Always add "price 2026" to get current pricing
- Search site-specific when possible: add "site:homedepot.com" or "site:lowes.com" to the query
- For Platt: search "platt electric [item name] price" — they specialize in electrical so most items will be found
- Look for the UNIT price not bulk/case price unless qty is high
- If you find a price range, use the middle value
- If a search returns accessories or wrong items, try a more specific search before marking as unavailable

ACCURACY RULES:
- Only use prices from homedepot.com, lowes.com, or platt.com — not Amazon, eBay, or other sites
- If the price seems too low (under $1 for wire) or too high (over $500 for a standard breaker), search again
- Round prices to nearest cent
- If you genuinely cannot find a price after 2 searches, set available=false

The materialTakeoff JSON structure MUST include all three store prices for every item:
{
  "item": "item name",
  "qty": "1",
  "unitCost": 0,
  "totalCost": 0,
  "homedepot_unit": 0,
  "homedepot_total": 0,
  "homedepot_available": true,
  "lowes_unit": 0,
  "lowes_total": 0,
  "lowes_available": true,
  "platt_unit": 0,
  "platt_total": 0,
  "platt_available": true
}

- Set unitCost and totalCost to the LOWEST price found across all three stores
- Calculate homedepot_total = qty x homedepot_unit, etc.
- Recalculate rawMaterialCost, markedUpMaterialCost, and totalEstimate after pricing
- Search EVERY item. Do not skip any.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 12000,
        system: livePricingSystem,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 60
          }
        ],
        messages: messages
      })
    });

    const data = await response.json();
    const textBlocks = (data.content || []).filter(b => b.type === 'text');
    const finalText = textBlocks.map(b => b.text || '').join('');

    res.json({
      ...data,
      content: [{ type: 'text', text: finalText }]
    });

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
