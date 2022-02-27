#!/bin/bash -e

curl -X POST -H 'content-type: application/json' http://localhost:8787 -d '{
  "code": "This isnt javascript!"
}'
