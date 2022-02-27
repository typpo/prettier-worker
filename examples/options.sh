#!/bin/bash -e

curl -X POST -H 'content-type: application/json' http://localhost:8787 -d '{
  "options": {
    "singleQuote": true,
    "semi": true,
    "trailingComma": "all"
  },
  "code": "function foo() { return {\"chart\":{\"type\":\"bar\",\"data\":{\"labels\":[\"Hello\",\"World\"],\"datasets\":[{\"label\":\"Foo\",\"data\":[1,2]}]}},\"templateOverrides\":{\"title\":null,\"labels\":null,\"data1\":null,\"data2\":null,\"data3\":null,\"data4\":null,\"data5\":null,\"data6\":null,\"data7\":null,\"data8\":null,\"data9\":null,\"data10\":null}}}"
}'
