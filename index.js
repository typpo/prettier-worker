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

const { handleOptions } = require('./cors');

const DEFAULT_PARSER = 'babel';

const ALLOWED_PAYLOAD_KEYS = new Set(['code', 'prettierOptions']);

const PRETTIER_OPTIONS = new Set([
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
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });
}

function fail(message, statusCode = 400) {
  return jsonResponse({ error: message }, statusCode);
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  } else if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return fail('You must set Content-Type to application/json');
    }

    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      return fail(err.message);
    }

    const payloadKeys = Object.keys(payload);
    for (let i = 0; i < payloadKeys.length; i++) {
      const payloadKey = payloadKeys[i];
      if (!ALLOWED_PAYLOAD_KEYS.has(payloadKey)) {
        return fail(`Unknown top-level key: ${payloadKey}`);
      }
    }

    if (!payload.code) {
      return fail('You must provide a `code` property in your payload');
    }

    const options = {
      parser: DEFAULT_PARSER,
      plugins: parsers,
    };
    if (payload.prettierOptions) {
      if (
        payload.prettierOptions.parser &&
        payload.prettierOptions.parser !== DEFAULT_PARSER
      ) {
        return fail('Only the babel parser is supported at this time');
      }

      const prettierKeys = Object.keys(payload.prettierOptions);
      for (let i = 0; i < prettierKeys.length; i++) {
        const key = prettierKeys[i];
        if (!PRETTIER_OPTIONS.has(key)) {
          return fail(
            `Invalid option ${key}. Option must be one of: {${Array.from(
              PRETTIER_OPTIONS,
            ).join(', ')}}`,
          );
        }
        const val = payload.prettierOptions[key];
        const optionType = typeof val;
        if (!['number', 'boolean', 'string'].includes(optionType)) {
          return fail(`Option ${key} must be a number, boolean, or string`);
        }
        options[key] = val;
      }
    }

    try {
      const result = prettier.format(payload.code.toString(), options);
      return jsonResponse({ code: result });
    } catch (err) {
      console.error(err);
      return jsonResponse({ error: err.message }, 400);
    }
  }

  return jsonResponse({ alive: true });
}
