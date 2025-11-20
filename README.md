# -vercel-Vibes-Backend

## MetaMask (Infura) Integration

The backend now exposes a thin proxy around the MetaMask/Infura endpoints so credentials stay server-side and responses are normalized for the app.

### Environment variables

Add the following variables to your environment (e.g. `.env` file) before calling any MetaMask endpoints:

- `INFURA_PROJECT_ID` – Infura project ID (required)
- `INFURA_PROJECT_SECRET` – Infura project secret (required for authenticated requests)
- `INFURA_NETWORK` *(optional)* – Defaults to `mainnet`
- `INFURA_API_BASE_URL` *(optional)* – Override the default `https://<network>.infura.io/v3`
- `METAMASK_API_TIMEOUT` *(optional)* – Request timeout in milliseconds, defaults to 30000

### Routes

All routes are mounted under `/api/integrations/metamask` and require the existing `auth` middleware. Provide the payload expected by your Infura project – any `asCustomer` field in the payload/query is promoted to the `As-Customer` header automatically.

- `POST /customers` – create a customer through MetaMask/Infura
- `PATCH /customers/:customerId` – update a customer
- `GET /customers/me` – fetch the authenticated profile
- `POST /transactions` – create a transaction
- `GET /transactions` – list transactions (Infura query params supported)
- `GET /transactions/:transactionId` – fetch transaction details
- `PATCH /transactions/:transactionId` – update/advance a transaction

Refer to the [Infura documentation](https://www.infura.io/docs) for payload specifics per network.
