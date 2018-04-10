#!/bin/bash

TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpbkFzIjp0cnVlLCJhY3R1YWxVc2VyIjoxODU3MSwidHdvRmFjdG9yUmVxdWlyZWQiOnRydWUsImlkIjoyMzQ3NywidXNlcm5hbWUiOiJrYWlfb2JlcmxhZW5kZXIiLCJlbWFpbCI6ImthaS5vYmVybGFlbmRlckBtb3Rlc3F1ZS5jb20iLCJjcmVhdGVkX2F0IjoiMjAxNy0wOS0wMVQxMToyMjo0NS4xMjNaIiwiZmlyc3RfbmFtZSI6IkthaSIsImxhc3RfbmFtZSI6Ik9iZXJsw6RuZGVyIiwiY29tcGFueSI6Ik1vdGVzcXVlIEluYy4iLCJhY2NvdW50X3R5cGUiOiJwcm9mZXNzaW9uYWwiLCJqd3Rfc2VjcmV0IjoiT05FRFE1STRBSEQ1TUVMWlNIUE9XTzZYR0w1VVBQQVgiLCJzb2NpYWxfc2VydmljZV9hY2NvdW50IjpbXSwiaGFzX2Rpc2FibGVkX25ld3NsZXR0ZXIiOmZhbHNlLCJoYXNQYXNzd29yZFNldCI6dHJ1ZSwibmVlZHNQYXNzd29yZFJlc2V0IjpmYWxzZSwicHVibGljX2tleSI6ZmFsc2UsImZlYXR1cmVzIjpbXSwiaW50ZXJjb21Vc2VyTmFtZSI6ImthaV9vYmVybGFlbmRlciIsImludGVyY29tVXNlckhhc2giOiJjMWY4ZWU3NWFmYmM3Njg0MjI3YjY3NTZkNzE3ZTc2NzlkYmUwM2QzOGMzZTgzNjYxMWQ3NGNiYWM4NDBmYjJjIiwicGVybWlzc2lvbnMiOltdLCJhdXRoVGltZSI6MTUwNDg4OTczMTI1NSwiaWF0IjoxNTA0ODg5NzMxLCJleHAiOjE1MDQ4ODk3NjF9.Z5BoMREzjzP373a8fBe5XB0xmThLb9GN8Jbqr0veGLc"

resin devices \
    | awk '{print $1}' \
    | grep -v 'ID' \
    | xargs -I{} curl -s 'https://api.resin.io/v2/device({})?$expand=user' -H "authorization: Bearer $TOKEN" --compressed \
    | jq '.d[0] | "\(.id) \(.application.__id) \(.user[0].username)"'