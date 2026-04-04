import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { JWT } from "google-auth-library";

const ADMIN_API_BASE_URL = "https://analyticsadmin.googleapis.com/v1beta";

interface Ga4EnvConfig {
  propertyId: string;
  serviceAccountEmail: string;
  privateKey: string;
  cloudProjectId: string;
}

let dataClient: BetaAnalyticsDataClient | null = null;
let adminJwt: JWT | null = null;

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getGa4EnvConfig(): Ga4EnvConfig {
  return {
    propertyId: readRequiredEnv("GA4_PROPERTY_ID").replace(/^"|"$/g, ""),
    serviceAccountEmail: readRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL").replace(/^"|"$/g, ""),
    privateKey: readRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY")
      .replace(/^"|"$/g, "")
      .replace(/\\n/g, "\n"),
    cloudProjectId: readRequiredEnv("GOOGLE_CLOUD_PROJECT_ID").replace(/^"|"$/g, ""),
  };
}

export function getGa4DataClient() {
  if (dataClient) {
    return dataClient;
  }

  const config = getGa4EnvConfig();
  dataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: config.serviceAccountEmail,
      private_key: config.privateKey,
    },
    projectId: config.cloudProjectId,
  });

  return dataClient;
}

function getAdminJwtClient() {
  if (adminJwt) {
    return adminJwt;
  }

  const config = getGa4EnvConfig();
  adminJwt = new JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ["https://www.googleapis.com/auth/analytics.edit"],
    subject: undefined,
  });

  return adminJwt;
}

export async function getAdminAccessToken() {
  const jwt = getAdminJwtClient();
  const credentials = await jwt.authorize();
  const token = credentials.access_token;
  if (!token) {
    throw new Error("Unable to obtain Google Admin API access token.");
  }
  return token;
}

export function getPropertyResourceName() {
  const { propertyId } = getGa4EnvConfig();
  return `properties/${propertyId}`;
}

export async function runHealthReport() {
  const client = getGa4DataClient();
  const property = getPropertyResourceName();
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    metrics: [{ name: "activeUsers" }],
    limit: 1,
  });

  return response;
}

export async function runRealtimeReport() {
  const client = getGa4DataClient();
  const property = getPropertyResourceName();
  const [response] = await client.runRealtimeReport({
    property,
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: 20,
  });

  return response;
}

export async function listEventsLast30Days() {
  const client = getGa4DataClient();
  const property = getPropertyResourceName();
  const [response] = await client.runReport({
    property,
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    limit: 100,
  });

  return response;
}

async function adminFetch(path: string, init: RequestInit = {}) {
  const token = await getAdminAccessToken();
  const response = await fetch(`${ADMIN_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GA4 Admin API error (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listConversionEvents() {
  const property = getPropertyResourceName();
  const data = await adminFetch(`/${property}/conversionEvents`);
  return (data as { conversionEvents?: Array<{ eventName?: string; createTime?: string; deletable?: boolean }> })
    .conversionEvents ?? [];
}

export async function setKeyEvent(eventName: string, enabled: boolean) {
  const property = getPropertyResourceName();
  const normalizedEvent = eventName.trim();
  if (!normalizedEvent) {
    throw new Error("eventName is required.");
  }

  if (enabled) {
    return adminFetch(`/${property}/conversionEvents`, {
      method: "POST",
      body: JSON.stringify({ eventName: normalizedEvent }),
    });
  }

  const encoded = encodeURIComponent(normalizedEvent);
  return adminFetch(`/${property}/conversionEvents/${encoded}`, {
    method: "DELETE",
  });
}
