const LOCAL_BACKEND_URL = "http://localhost:5001";
const LOCAL_FRONTEND_URL = "http://localhost:5173";

const normalizeOrigin = (value) => {
  if (!value) return undefined;

  const url = new URL(
    value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`
  );
  return url.origin;
};

const isLocalOrigin = (value) => {
  if (!value) return true;
  const hostname = new URL(value).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
};

export const getPublicUrls = () => {
  if (process.env.NODE_ENV !== "production") {
    return {
      backendUrl: normalizeOrigin(process.env.BACKEND_URL) || LOCAL_BACKEND_URL,
      frontendUrl: normalizeOrigin(process.env.FRONTEND_URL) || LOCAL_FRONTEND_URL,
    };
  }

  const configuredBackendUrl = normalizeOrigin(process.env.BACKEND_URL);
  const vercelBackendUrl = normalizeOrigin(
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  );
  const configuredFrontendUrl = normalizeOrigin(process.env.FRONTEND_URL);
  const corsFrontendUrl = normalizeOrigin(process.env.CORS_ORIGIN);

  return {
    backendUrl: !isLocalOrigin(configuredBackendUrl)
      ? configuredBackendUrl
      : vercelBackendUrl || "https://mesh-3md7.vercel.app",
    frontendUrl: !isLocalOrigin(configuredFrontendUrl)
      ? configuredFrontendUrl
      : corsFrontendUrl || "https://mesh-gamma-blond.vercel.app",
  };
};
