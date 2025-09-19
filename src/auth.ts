import { NextRequest, NextResponse } from "next/server";
import { cookies as headerCookies } from "next/headers";
import jwt from "jsonwebtoken";
import { config } from "./config";

type JwtPayload = {
  pid: number;
  email: string;
  iat?: number;
  exp?: number;
};

export type PatientSession = {
  user: {
    patientId: number;
    email: string;
  };
};

const SESSION_COOKIE = "patient_session";
const SEVEN_DAY_SECONDS = 7 * 60 * 60 * 24;

function getSecret(): string {
  const secret = config.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET");
  }
  return secret;
}

export function signSession(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, getSecret(), {
    algorithm: "HS256",
    expiresIn: SEVEN_DAY_SECONDS,
  });
}

export function verifySession(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export function createSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SEVEN_DAY_SECONDS,
    },
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}

// Server/route-handler safe: set cookie on a NextResponse and return it
export function createSessionResponse(
  res: NextResponse,
  pid: number,
  email: string
) {
  const token = signSession({ pid, email });
  const cookie = createSessionCookie(token);
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

export function destroySessionResponse(res: NextResponse) {
  const cookie = clearSessionCookie();
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}

// RSC/Route usage: get session from next/headers cookies API
export async function getSession(): Promise<PatientSession | null> {
  // Support both sync and async cookies() return types across Next versions
  const store: any = await (headerCookies() as any);
  const token: string | undefined =
    typeof store?.get === "function"
      ? store.get(SESSION_COOKIE)?.value
      : undefined;
  if (!token) return null;
  const payload = verifySession(token);
  if (!payload) return null;
  return {
    user: {
      patientId: payload.pid,
      email: payload.email,
    },
  };
}

// Middleware wrapper: augments request with req.auth parsed from cookie
// Usage: export default auth((req) => { ... })
export function auth<T extends (req: any) => any>(handler: T) {
  return async function wrapped(req: NextRequest) {
    let session: PatientSession | null = null;
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (token) {
      const payload = verifySession(token);
      if (payload) {
        session = {
          user: {
            patientId: payload.pid,
            email: payload.email,
          },
        };
      }
    }
    const augmentedReq = Object.assign(req, { auth: session });
    return handler(augmentedReq);
  };
}
