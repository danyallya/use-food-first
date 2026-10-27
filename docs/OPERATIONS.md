# Operations

App: localhost:3107; PostgreSQL: localhost:5547; health: /api/health.

- Start: docker compose up --build
- Logs: docker compose logs -f app db
- Stop and keep data: docker compose down
- Reset local development data only: docker compose down -v

Never remove a production volume as a reset. Set a strong .env password and rehearse backup/restore before deployment.
