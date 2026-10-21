# Hostinger deployment

The storefront is TanStack Start/Nitro SSR. The API is a separate Express/MySQL app. Deploy both as Node.js Web Apps, not Advanced > GIT publishing into public_html.

## Storefront app

- Repository: webakoofgit-png/LGS-Cosmetic, branch main
- Root: ./
- Framework: Nitro
- Node: 22.x
- Build: npm run build
- Output: .output
- Entry (relative to output): server/index.mjs
- Build environment: DEPLOY_TARGET=hostinger
- Build environment: VITE_API_URL=https://YOUR-BACKEND-HOST (no trailing slash)
- Runtime: NODE_ENV=production

DEPLOY_TARGET explicitly selects Nitro's Node server preset. Without it, the existing Lovable/Cloudflare build remains available. Do not use the Cloudflare worker output as a Node server.

Hostinger builds send browser requests to same-origin /api and /uploads paths. Nitro forwards those paths to the fixed VITE_API_URL backend configured at build time. This avoids cross-domain browser CORS and third-party session cookie restrictions. Keep VITE_API_URL set to the actual backend origin and rebuild after changing it. There is no API response caching; login cookies and admin authorization are forwarded by the proxy.

## API app

Create another Node.js Web App from the same repository. Use root backend, Node 22.x, Express (or Other), package manager npm and entry server.js. The API is plain JavaScript and has no compilation step; use the provider's no-build setting. If a build command is mandatory, use node --check server.js. Publish the backend root, not the frontend .output directory.

The backend has its own package-lock.json and is deliberately not an npm workspace. This keeps sequelize and all API dependencies inside backend/node_modules when Hostinger publishes only the selected root directory. Use npm ci in backend; root installation also installs the backend through its postinstall script for local development.

Set these backend-only environment variables through Hostinger:

```
NODE_ENV=production
DB_HOST=<Hostinger MySQL host reachable from the Node app>
DB_PORT=3306
DB_NAME=<database name>
DB_USER=<database user>
DB_PASSWORD=<database password>
JWT_SECRET=<unique random secret, at least 32 characters>
CUSTOMER_AUTH_SECRET=<different random secret, at least 32 characters>
FRONTEND_URL=https://YOUR-STOREFRONT-HOST
CUSTOMER_AUTH_URL=https://YOUR-BACKEND-HOST
RAZORPAY_ENABLED=false
RESEND_ENABLED=false
RESEND_DOMAIN_VERIFIED=false
```

Hostinger supplies the listening PORT; do not set localhost:5000 as the public API URL. After creating the API app, rebuild the storefront with its real HTTPS VITE_API_URL. Browser requests use the storefront proxy, including customer session requests. FRONTEND_URL on the backend must match the storefront origin for authentication origin checks. Before using live domains, verify login/session cookies, checkout and admin updates through the proxy.

Create the database first. Backend startup creates application and customer-auth tables. Import the existing local MySQL data securely if you want the existing products, categories and content; the Git repository does not contain the database. Do not run the development seed script blindly on production. Keep uploads on persistent storage or restore them after deployments; verify Hostinger upload persistence before taking customer orders.

Check API /api/health, then actual /api/products and database-dependent endpoints. On the storefront check products, images, customer sign-in, cart, checkout and admin order history. Configure SMTP/Resend and Razorpay separately using backend/COMMERCE-SETUP.md. Keep both disabled until configured.

Once temporary testing succeeds, connect the final storefront/API domains and update FRONTEND_URL, CUSTOMER_AUTH_URL and VITE_API_URL accordingly.
