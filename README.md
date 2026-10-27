# Broken Project — Giorno 9: Fastify & Microservizi

## Bug 1 — 🔴 Plugin Fastify non encapsulato
**Sintomi**: una decorazione in un plugin sovrascrive lo stato globale.

## Bug 2 — 🟡 Hook onRequest che non fa return/reply
**Sintomi**: la richiesta prosegue anche se l'autenticazione fallisce.

## Bug 3 — 🟢 Chiamata inter-service senza timeout
**Sintomi**: se il servizio esterno è lento, la richiesta resta bloccata indefinitamente.

## Feature opzionale
Porta l'endpoint GET /api/accounts da Express a Fastify con schema JSON validation.
