## prettier-worker

Prettier, hosted as a Cloudflare Worker.

# Usage

Send a POST request to https://prettier.ty.workers.dev.  The POST request be `application/json` encoded and the payload must look like this:

```js
{
  "code": "<...your javascript code...>",
  "prettierOptions: {
    // Optional prettier API params
  }
}
```

The `prettierOptions` property is optional and will accept any API override parameter documented [here](https://prettier.io/docs/en/options.html).

The response will look like this:

```json
{
  "code": "<...your formatted javascript code...>"
}
```

If an error was thrown, the response will have a non-200 HTTP status code and probably look like this:

```json
{
  "error": "<...description of error...>"
}
```

# Examples

Here's an example JSON payload that specifies some options:

```json
{
  "code": "foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());",
  "prettierOptions": {
    "singleQuote": true,
    "semi": true,
    "trailingComma": "all"
  }
}
```

You can test things on your command line as well (see `examples/` directory):

```sh
curl -X POST -H 'content-type: application/json' http://localhost:8787 -d '{
  "code": "foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());"
}'
```

# Supported parsers

Only the `babel` parser is supported by default due to Cloudflare limitations on bundle size.
