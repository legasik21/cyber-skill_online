#!/usr/bin/env bash
# End-to-end smoke test for the self-hosted chat stack.
#
# Prereqs: the app running at $BASE (default http://localhost:3001) against the
# cyberskill-db Postgres, and ADMIN_EMAIL / ADMIN_PASSWORD / CRON_SECRET exported
# (e.g. `set -a; . ./.env; set +a`). Exits non-zero if any check fails.
set -uo pipefail

BASE="${BASE:-http://localhost:3001}"
DB_EXEC=(docker exec cyberskill-db psql -U "${POSTGRES_USER:-cyberskill}" -d "${POSTGRES_DB:-cyberskill}" -tAc)
JAR="$(mktemp)"; SSE="$(mktemp)"; SSE2="$(mktemp)"
PASS=0; FAIL=0
ok(){ echo "  PASS  $1"; PASS=$((PASS+1)); }
bad(){ echo "  FAIL  $1"; FAIL=$((FAIL+1)); }
await_sse(){ for _ in $(seq 1 25); do grep -q connected "$1" 2>/dev/null && return 0; sleep 0.2; done; }

echo "== 1. visitor obtains visitor_id cookie (middleware) =="
VID=$(curl -s -i "$BASE/" | tr -d '\r' | sed -nE 's/^[Ss]et-[Cc]ookie: visitor_id=([^;]+).*/\1/p' | head -1)
[ -n "$VID" ] && ok "visitor_id=$VID" || bad "no visitor_id cookie"

echo "== 2. create conversation =="
CID=$(curl -s -b "visitor_id=$VID" -X POST "$BASE/api/chat/conversation" -H 'content-type: application/json' -d '{}' \
  | sed -nE 's/.*"conversation_id":"([^"]+)".*/\1/p')
[ -n "$CID" ] && ok "conversation_id=$CID" || bad "no conversation_id"

echo "== 3. visitor sends a message (persists in Postgres) =="
S=$(curl -s -b "visitor_id=$VID" -X POST "$BASE/api/chat/send" -H 'content-type: application/json' \
  -d "{\"conversation_id\":\"$CID\",\"body\":\"hello from smoke test\"}")
echo "$S" | grep -q '"success":true' && ok "send ok" || bad "send failed: $S"
N=$("${DB_EXEC[@]}" "SELECT count(*) FROM messages WHERE conversation_id='$CID'")
[ "$N" = "1" ] && ok "message row in Postgres" || bad "expected 1 message, got $N"

echo "== 4. admin logs in via NextAuth credentials =="
CSRF=$(curl -s -c "$JAR" "$BASE/api/auth/csrf" | sed -nE 's/.*"csrfToken":"([^"]+)".*/\1/p')
[ -n "$CSRF" ] && ok "csrf token acquired" || bad "no csrf token"
curl -s -c "$JAR" -b "$JAR" -X POST "$BASE/api/auth/callback/credentials" \
  -H 'content-type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "email=${ADMIN_EMAIL}" \
  --data-urlencode "password=${ADMIN_PASSWORD}" --data-urlencode "callbackUrl=$BASE/admin/chat" -o /dev/null
SESS=$(curl -s -b "$JAR" "$BASE/api/auth/session")
echo "$SESS" | grep -q "${ADMIN_EMAIL}" && ok "admin session established" || bad "no admin session: $SESS"

echo "== 5. admin lists conversations (sees ours) =="
C=$(curl -s -b "$JAR" "$BASE/api/admin/chat/conversations")
echo "$C" | grep -q "$CID" && ok "conversation visible to admin" || bad "not listed: $C"

echo "== 6. visitor SSE open -> admin replies + closes -> visitor receives both in realtime =="
( curl -sN --max-time 8 -b "visitor_id=$VID" "$BASE/api/chat/stream?conversation_id=$CID" > "$SSE" ) & SSE_PID=$!
await_sse "$SSE"
A=$(curl -s -b "$JAR" -X POST "$BASE/api/admin/chat/send" -H 'content-type: application/json' \
  -d "{\"conversation_id\":\"$CID\",\"body\":\"admin reply via SSE\"}")
echo "$A" | grep -q '"success":true' && ok "admin reply sent" || bad "admin reply failed: $A"
CL=$(curl -s -b "$JAR" -X POST "$BASE/api/admin/chat/close" -H 'content-type: application/json' -d "{\"conversation_id\":\"$CID\"}")
echo "$CL" | grep -q '"success":true' && ok "admin closed conversation" || bad "close failed: $CL"
wait "$SSE_PID" 2>/dev/null
grep -q 'event: message' "$SSE" && ok "visitor received 'message' over SSE" || bad "no SSE 'message' event"
grep -q 'event: conversation_closed' "$SSE" && ok "visitor received 'conversation_closed' over SSE" || bad "no SSE close event"

echo "== 7. manager_typing event delivers over SSE =="
( curl -sN --max-time 5 -b "visitor_id=$VID" "$BASE/api/chat/stream?conversation_id=$CID" > "$SSE2" ) & TP=$!
await_sse "$SSE2"
"${DB_EXEC[@]}" "SELECT pg_notify('chat_events', json_build_object('conversationId','$CID','type','manager_typing','isTyping',true)::text)" >/dev/null
wait "$TP" 2>/dev/null
grep -q 'event: manager_typing' "$SSE2" && ok "manager_typing delivered over SSE" || bad "no manager_typing event"

echo "== 8. DB status closed =="
ST=$("${DB_EXEC[@]}" "SELECT status FROM conversations WHERE id='$CID'")
[ "$ST" = "closed" ] && ok "conversation status=closed" || bad "status=$ST"

echo "== 9. cron cleanup endpoint (auth enforced) =="
CR=$(curl -s -H "Authorization: Bearer ${CRON_SECRET}" "$BASE/api/cron/cleanup")
echo "$CR" | grep -q '"success":true' && ok "cron cleanup ok: $CR" || bad "cron failed: $CR"
U=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/cron/cleanup")
[ "$U" = "401" ] && ok "cron rejects missing secret (401)" || bad "cron auth not enforced ($U)"

echo; echo "==== RESULT: $PASS passed, $FAIL failed ===="
rm -f "$JAR" "$SSE" "$SSE2"
[ "$FAIL" -eq 0 ]
