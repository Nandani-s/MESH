# MESH Frontend

## Production deployment

Deploy `BACKEND` as a separate Vercel project with its project root set to
`BACKEND`. Configure the backend's environment variables in Vercel, including
`MONGO_URI`, `JWT_SECRET_KEY`, and `CORS_ORIGIN`. Set `CORS_ORIGIN` to the exact
frontend origin, for example `https://mesh-3md7.vercel.app`.

Set the frontend's Production `VITE_API_URL` to the backend's public origin (or
its `/api` URL), then redeploy the frontend. The frontend client adds `/api`
when it is not already present. Do not point this variable at the frontend URL.

The backend uses secure cross-site auth cookies in production. Browsers must
allow cookies between the separate frontend and backend domains.

## Local development

Set `VITE_API_URL=http://localhost:5001/api` in the frontend `.env` file and run
the frontend and backend in separate terminals.
