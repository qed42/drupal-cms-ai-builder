import { createHmac, randomUUID } from "node:crypto";

/**
 * Creates an HS256-signed JWT for auto-login to a Drupal site.
 */
export function createAutoLoginToken(payload: {
  email: string;
  name: string;
  domain: string;
}): string {
  const secret = process.env.JWT_SHARED_SECRET;
  if (!secret) {
    throw new Error("JWT_SHARED_SECRET environment variable is not set");
  }

  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);

  const claims = {
    sub: payload.email,
    name: payload.name,
    site: payload.domain,
    iat: now,
    exp: now + 60, // 60-second TTL
    jti: randomUUID(),
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(claims));
  const signature = base64UrlEncode(
    createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest()
  );

  return `${headerB64}.${payloadB64}.${signature}`;
}

function base64UrlEncode(data: string | Buffer): string {
  const b64 = Buffer.isBuffer(data)
    ? data.toString("base64")
    : Buffer.from(data).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
