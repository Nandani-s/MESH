# MESH Frontend

## Production deployment

Deploy `BACKEND` as a separate Vercel project with its project root set to
`BACKEND`. Configure the backend's environment variables in Vercel, including
`MONGO_URI`, `JWT_SECRET_KEY`, and `CORS_ORIGIN`. Set `CORS_ORIGIN` to the exact
frontend origin.

The frontend's `vercel.json` proxies `/api` to the backend, and the production
API client uses that same-origin path so auth cookies work across browsers.
Update the rewrite destination if the backend's public URL changes. Keep
`VITE_API_URL` unset in the frontend's Production environment; it is only used
for local development.

The backend uses secure auth cookies in production.

## Local development

Set `VITE_API_URL=http://localhost:5001/api` in the frontend `.env` file and run
the frontend and backend in separate terminals.
