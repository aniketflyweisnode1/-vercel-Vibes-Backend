# -vercel-Vibes-Backend

## Escrow API Integration

The backend now exposes a thin proxy around the Escrow.com REST API to keep credentials on the server and encapsulate logging/error handling.

### Environment variables

Add the following variables to your environment (e.g. `.env` file) before calling any Escrow endpoints:

- `ESCROW_API_EMAIL` – Escrow account email (basic auth username)
- `ESCROW_API_KEY` – API key or password (basic auth password)
- `ESCROW_API_BASE_URL` *(optional)* – Defaults to the sandbox `https://api.escrow-sandbox.com/2017-09-01`
- `ESCROW_API_TIMEOUT` *(optional)* – Request timeout in milliseconds, defaults to 10000

### Routes

All routes are mounted under `/api/integrations/escrow` and require the existing `auth` middleware. Provide the payload expected by Escrow.com – any additional `asCustomer` field will automatically be promoted to the `As-Customer` header.

- `POST /customers` – create a customer at Escrow
- `PATCH /customers/:customerId` – update a customer
- `GET /customers/me` – fetch the authenticated Escrow profile
- `POST /transactions` – create a transaction
- `GET /transactions` – list transactions (supports Escrow query params)
- `GET /transactions/:transactionId` – fetch transaction details
- `PATCH /transactions/:transactionId` – perform transaction actions (agree, ship, etc.)
Refer to the [Escrow API documentation](https://www.escrow.com/api/docs/basics) for payload specifics.
