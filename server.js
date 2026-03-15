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

// ─── DIRECT STORE PRICE LOOKUP ───
async function searchHomeDepot(query) {
  try {
    const url = `https://www.homedepot.com/federation-gateway/graphql?opname=searchModel`;
    const payload = {
      operationName: 'searchModel',
      variables: {
        skipInstallServices: true,
        skipSubscribeAndSave: true,
        channel: 'DESKTOP',
        additionalSearchParams: { deliveryZip: '90001' },
        keyword: query,
        navParam: '',
        storefilter: 'ALL',
        orderBy: { field: 'TOP_SELLERS', order: 'ASC' },
        startIndex: 0,
        pageSize: 1
      },
      query: `query searchModel($keyword: String, $pageSize: Int, $startIndex: Int) {
        searchModel(keyword: $keyword, pageSize: $pageSize, startIndex: $startIndex) {
          products { itemId pricing { value } description }
        }
      }`
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'x-experience-name': 'general-merchandise'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    const products = data?.data?.searchModel?.products;
    if (products && products.length > 0 && products[0].pricing?.value) {
      return { price: products[0].pricing.value, found: true };
    }
    return { price: 0, found: false };
  } catch(e) {
    console.error('HD search error:', e.message);
    return { price: 0, found: false };
  }
}

async function searchLowes(query) {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://www.lowes.com/pd/search?searchTerm=${encoded}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const text = await response.text();
    // Parse price from response
    const priceMatch = text.match(/"sellingPrice[^"]*":\s*([0-9.]+)/);
    if (priceMatch) {
      return { price: parseFloat(priceMatch[1]), found: true };
    }
    return { price: 0, found: false };
  } catch(e) {
    console.error('Lowes search error:', e.message);
    return { price: 0, found: false };
  }
}

async function searchPlatt(query) {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://www.platt.com/platt-electric-search.aspx?query=${encoded}&format=json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    if (data && data.products && data.products.length > 0) {
      const price = data.products[0].price || data.products[0].listPrice;
      if (price) return { price: parseFloat(price), found: true };
    }
    return { price: 0, found: false };
  } catch(e) {
    console.error('Platt search error:', e.message);
    return { price: 0, found: false };
  }
}

// ─── AI ESTIMATE ───
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
    const finalText = (data.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('');
    console.log('Estimate length:', finalText.length);
    res.json({ ...data, content: [{ type: 'text', text: finalText }] });
  } catch (err) {
    console.error('Estimate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DIRECT PRICE LOOKUP ───
app.post('/price-lookup', async (req, res) => {
  try {
    const { items } = req.body;
    console.log('Looking up prices for', items.length, 'items');

    const prices = await Promise.all(items.map(async (item) => {
      // Clean up item name for better search results
      const searchQuery = item
        .replace(/\d+\/\d+/g, match => match) // keep wire gauges like 12/2
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 80); // limit query length

      const [hd, lw, pl] = await Promise.all([
        searchHomeDepot(searchQuery),
        searchLowes(searchQuery),
        searchPlatt(searchQuery)
      ]);

      console.log(`${item.substring(0,30)}: HD=${hd.price} LW=${lw.price} PL=${pl.price}`);

      return {
        item,
        homedepot_unit: hd.price,
        homedepot_available: hd.found,
        lowes_unit: lw.price,
        lowes_available: lw.found,
        platt_unit: pl.price,
        platt_available: pl.found
      };
    }));

    console.log('Price lookup complete:', prices.length, 'items');
    res.json({ prices });

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
      method: 'PATCH', headers: supabaseHeaders,
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
