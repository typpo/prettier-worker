const prettier = require('prettier/standalone');
const parsers = [
  require('prettier/parser-babel'),
  // Adding more parsers exceeds the 1MB Cloudflare Worker limit.
  //require('prettier/parser-espree'),
  //require('prettier/parser-flow'),
  //require('prettier/parser-glimmer'),
  //require('prettier/parser-graphql'),
  //require('prettier/parser-html'),
  //require('prettier/parser-meriyah'),
  //require('prettier/parser-postcss'),
  //require('prettier/parser-typescript'),
  //require('prettier/parser-yaml'),
];

const DEFAULT_PARSER = 'babel';

const ALLOWED_OPTIONS = new Set([
  'arrowParens',
  'bracketSameLine',
  'bracketSpacing',
  'embeddedLanguageFormatting',
  'endOfLine',
  'htmlWhitespaceSensitivity',
  'insertPragma',
  'jsxSingleQuote',
  'printWidth',
  'proseWrap',
  'rangeEnd',
  'rangeStart',
  'requirePragma',
  'semi',
  'singleQuote',
  'tabWidth',
  'trailingComma',
  'useTabs',
  'vueIndentScriptAndStyle',
]);

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

function jsonResponse(obj, statusCode = 200) {
  return new Response(JSON.stringify(obj), {
    status: statusCode,
    headers: { 'content-type': 'application/json' },
  });
}

function fail(msg, statusCode = 400) {
  return jsonResponse({ error: msg }, statusCode);
}

async function handleRequest(request) {
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return fail('You must set Content-Type to application/json');
    }
    const payload = await request.json();

    if (!payload.code) {
      return fail('You must provide a `code` property in your payload');
    }

    const options = {
      parser: DEFAULT_PARSER,
      plugins: parsers,
    };
    if (payload.options) {
      if (payload.options.parser && payload.options.parser !== DEFAULT_PARSER) {
        return fail('Only the babel parser is supported at this time');
      }

      const keys = Object.keys(payload.options);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!ALLOWED_OPTIONS.has(key)) {
          return fail(
            `Invalid option ${key}. Option must be one of: {${Array.from(
              ALLOWED_OPTIONS,
            ).join(', ')}}`,
          );
        }
        const val = payload.options[key];
        if (val !== Object(val)) {
          return fail(`Option ${key} must be a primitive`);
        }
        options[key] = val;
      }
    }

    try {
      const result = prettier.format(payload.code.toString(), options);
      return jsonResponse({ code: result });
    } catch (err) {
      console.error(err);
      return jsonResponse({ error: err.message }, 500);
    }
  }

  return jsonResponse({ alive: true });
}
