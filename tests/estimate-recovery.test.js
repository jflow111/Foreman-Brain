const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function fixture(reply, env = {}) {
  const routes = {};
  let request;
  const app = { use() {}, get() {}, post(route, handler) { routes[route] = handler; }, listen() {} };
  const express = Object.assign(() => app, { raw() {}, json() {} });
  const context = {
    require(name) {
      if (name === 'express') return express;
      if (name === 'cors') return () => {};
      if (name === 'stripe') return () => ({});
      throw new Error('Unexpected dependency: ' + name);
    },
    process: { env }, console: { log() {}, error() {} },
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.anthropic.com/v1/messages');
      request = JSON.parse(options.body);
      return { ok: reply.status >= 200 && reply.status < 300, status: reply.status, json: async () => reply.body };
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8'), context);
  return {
    async call(route, body = {}) {
      const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
      await routes[route]({ body }, res);
      return { code: res.code, body: res.body, request };
    }
  };
}

test('estimate and photo requests use the server model, including old cached clients', async () => {
  const f = fixture({ status: 200, body: { content: [{ type: 'text', text: '{"laborHours":3}' }], stop_reason: 'end_turn' } });
  const result = await f.call('/estimate', { model: 'claude-sonnet-4-20250514', messages: [] });
  assert.equal(result.code, 200);
  assert.equal(result.request.model, 'claude-sonnet-4-6');
  assert.equal(result.body.content[0].text, '{"laborHours":3}');
  const photo = await f.call('/analyze-photo', { image: 'test' });
  assert.equal(photo.request.model, 'claude-sonnet-4-6');
});

test('server model can be configured without editing the frontend', async () => {
  const result = await fixture({ status: 200, body: { content: [{ type: 'text', text: '{}' }] } }, { ANTHROPIC_MODEL: 'configured-model' }).call('/estimate');
  assert.equal(result.request.model, 'configured-model');
});

test('provider model error returns failure instead of an empty successful estimate', async () => {
  for (const route of ['/estimate', '/analyze-photo']) {
    const result = await fixture({ status: 404, body: { error: { type: 'not_found_error', message: 'model not found' } } }).call(route);
    assert.equal(result.code, 502);
    assert.match(result.body.error.message, /model is unavailable/);
    assert.equal(result.body.content, undefined);
  }
});

test('rate limits, empty responses and truncation are actionable failures', async () => {
  const cases = [
    [{ status: 429, body: { error: { message: 'rate limit' } } }, 429, /busy/],
    [{ status: 200, body: { content: [] } }, 502, /no estimate/],
    [{ status: 200, body: { content: [{ type: 'text', text: '{' }], stop_reason: 'max_tokens' } }, 502, /incomplete/]
  ];
  for (const [reply, code, message] of cases) {
    const result = await fixture(reply).call('/estimate');
    assert.equal(result.code, code);
    assert.match(result.body.error.message, message);
  }
});

test('all three frontend estimate paths surface upstream errors before parsing', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../app.html'), 'utf8');
  const blocks = [...source.matchAll(/var data = await response.json\(\);([\s\S]*?)var raw =/g)];
  assert.equal(blocks.length, 3);
  for (const block of blocks) {
    const check = new Function('response', 'data', block[1]);
    assert.throws(() => check({ ok: false }, { error: { message: 'AI is unavailable' } }), /AI is unavailable/);
    assert.throws(() => check({ ok: true }, { error: { message: 'Legacy backend failure' } }), /Legacy backend failure/);
    assert.doesNotThrow(() => check({ ok: true }, { content: [] }));
  }
});
