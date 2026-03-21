const express = require('express');
const cors = require('cors');
const app = express();

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PRICE_ID = process.env.STRIPE_PRICE_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyB7xvp5BhwUlWPCUn9lrrM_GnGwRDgJrvI';
const GOOGLE_CX = process.env.GOOGLE_CX || '96d6882a0f8c3463e';

let stripe;
try { stripe = require('stripe')(STRIPE_SECRET); } catch(e) {}

app.use(cors({ origin: '*', methods: ['GET','POST'], allowedHeaders: ['Content-Type','stripe-signature'] }));
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/', (req, res) => res.send('Foreman Brain server is running'));

// ─── GOOGLE SHOPPING PRICE SEARCH ───
async function searchGooglePrice(itemName, store) {
  try {
    const query = encodeURIComponent(`${itemName} ${store} price`);
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${query}&num=3`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error(`Google API error for ${itemName}:`, data.error.message);
      return { price: 0, found: false };
    }

    if (!data.items || data.items.length === 0) {
      return { price: 0, found: false };
    }

    // Try to find price in search results
    for (const item of data.items) {
      // Check pagemap for structured price data
      if (item.pagemap) {
        // Check offer data
        const offers = item.pagemap.offer || item.pagemap.aggregateoffer || [];
        for (const offer of offers) {
          const price = parseFloat(offer.price || offer.lowprice || offer.highprice);
          if (price && price > 0 && price < 10000) {
            console.log(`Found price for ${itemName} at ${store}: ${price}`);
            return { price, found: true };
          }
        }

        // Check product data
        const products = item.pagemap.product || [];
        for (const product of products) {
          const price = parseFloat(product.price);
          if (price && price > 0 && price < 10000) {
            console.log(`Found product price for ${itemName} at ${store}: ${price}`);
            return { price, found: true };
          }
        }
      }

      // Try to extract price from snippet text
      const snippet = (item.snippet || '') + (item.title || '');
      const priceMatches = snippet.match(/\$\s*(\d+(?:\.\d{2})?)/g);
      if (priceMatches && priceMatches.length > 0) {
        const price = parseFloat(priceMatches[0].replace('$', '').trim());
        if (price && price > 0.50 && price < 10000) {
          console.log(`Found snippet price for ${itemName} at ${store}: ${price}`);
          return { price, found: true };
        }
      }
    }

    return { price: 0, found: false };
  } catch(e) {
    console.error(`Search error for ${itemName} at ${store}:`, e.message);
    return { price: 0, found: false };
  }
}

// ─── JOB HISTORY SYNC ───
async function getUserFromToken(token) {
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${token}` }
    });
    const data = await r.json();
    return data && data.id ? data : null;
  } catch(e) { return null; }
}

app.get('/jobs', async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=job_history`, {
      headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` }
    });
    const data = await r.json();
    res.json({ jobs: (data[0] && data[0].job_history) || [] });
  } catch(e) {
    res.json({ jobs: [] });
  }
});

app.post('/jobs', async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { jobs } = req.body;
  if (!Array.isArray(jobs)) return res.status(400).json({ error: 'jobs must be an array' });
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ job_history: jobs })
    });
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

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
    console.log('HTTP status:', response.status);
    console.log('API error:', JSON.stringify(data.error));
    console.log('Stop reason:', data.stop_reason);
    console.log('Content count:', data.content ? data.content.length : 0);
    console.log('Content types:', data.content ? data.content.map(b=>b.type).join(',') : 'none');
    console.log('Usage:', JSON.stringify(data.usage));
    const finalText = (data.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('');
    console.log('Estimate length:', finalText.length);
    console.log('First 100 chars:', finalText.substring(0, 100));
    res.json({ ...data, content: [{ type: 'text', text: finalText }] });
  } catch (err) {
    console.error('Estimate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── PRICE LOOKUP VIA GOOGLE CUSTOM SEARCH ───
app.post('/price-lookup', async (req, res) => {
  try {
    const { items } = req.body;

    // Load price list
    const fs = require('fs');
    let priceList = {};
    try {
      const priceData = JSON.parse(fs.readFileSync('./prices.json', 'utf8'));
      priceList = priceData.prices || {};
      console.log('Price list loaded:', Object.keys(priceList).length, 'items, updated:', priceData.updated);
    } catch(e) {
      console.error('Price list load error:', e.message);
    }

    const prices = items.map(function(item) {
      // Try to match item to price list
      const itemLower = item.toLowerCase();
      let matchedPrice = 0;
      let matchedKey = null;

      // Extract numbers from item name for exact matching
      const itemNumbers = itemLower.match(/\d+\.?\d*/g) || [];

      let bestScore = 0;
      for (const [key, price] of Object.entries(priceList)) {
        const keyLower = key.toLowerCase();
        const keyNumbers = keyLower.match(/\d+\.?\d*/g) || [];

        // Check number match first - numbers must match exactly
        let numberMatch = true;
        if (keyNumbers.length > 0) {
          numberMatch = keyNumbers.every(n => itemNumbers.includes(n));
        }
        if (!numberMatch) continue;

        // Count word matches
        const keyWords = keyLower.split(' ').filter(w => w.length > 2 && !/^\d+$/.test(w));
        const matchCount = keyWords.filter(w => itemLower.includes(w)).length;
        const score = matchCount / keyWords.length;

        if (matchCount >= 1 && score > bestScore) {
          bestScore = score;
          matchedPrice = price;
          matchedKey = key;
        }
      }

      if (matchedKey) {
        console.log(`Matched "${item}" to "${matchedKey}": ${matchedPrice}`);
      } else {
        console.log(`No match for "${item}" - using AI estimate`);
      }

      return {
        item,
        market_unit: matchedPrice,
        market_available: matchedPrice > 0,
        matched_key: matchedKey
      };
    });

    res.json({ prices, updated: 'March 2026' });

  } catch (err) {
    console.error('Price lookup error:', err.message);
    res.json({ prices: [] });
  }
});

// ─── PHOTO ANALYSIS ───
app.post('/analyze-photo', async (req, res) => {
  try {
    const { image, mediaType, mode, items } = req.body;

    let prompt;
    if (mode === 'catalog') {
      prompt = `You are reading a vendor price catalog page for electrical supplies. Extract every item and price you can see in this image.

Return ONLY a JSON array with no other text:
[{"item":"exact item name as shown","unit_price":0.00,"unit":"each/ft/box/etc"}]

Items I am looking to match (match as many as you can):
${(items||[]).map((item,i) => `${i+1}. ${item}`).join('\n')}

Return ONLY the JSON array.`;
    } else {
      prompt = `You are a master electrician reviewing a job site photo. Analyze this image and provide a brief technical assessment relevant to electrical estimating. Note: panel brand and condition, existing wiring type, service size if visible, potential code issues, access difficulty, and anything that would affect the estimate. Keep response under 100 words. Be specific and technical.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('');
    console.log('Photo analysis mode:', mode, '| Length:', text.length);

    if (mode === 'catalog') {
      let catalogPrices = [];
      try {
        const cleaned = text.replace(/```json|```/g, '').trim();
        const match = cleaned.match(/\[[\s\S]*\]/);
        if (match) catalogPrices = JSON.parse(match[0]);
      } catch(e) {
        console.error('Catalog parse error:', e.message);
      }
      res.json({ catalogPrices });
    } else {
      res.json({ analysis: text });
    }

  } catch (err) {
    console.error('Photo analysis error:', err.message);
    res.json({ analysis: 'Could not analyze photo.', catalogPrices: [] });
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
