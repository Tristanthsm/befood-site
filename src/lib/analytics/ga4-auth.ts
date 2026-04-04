import { NextRequest } from "next/server";

export function isAuthorizedGa4AdminRequest(request: NextRequest) {
  const expectedToken = process.env.GA4_API_ADMIN_TOKEN?.trim();
  if (!expectedToken) {
    return false;
  }

  const provided = request.headers.get("x-ga4-admin-token")?.trim();
  return Boolean(provided) && provided === expectedToken;
}
