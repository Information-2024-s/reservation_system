"use server";

import { HTTPException } from "hono/http-exception";
import { auth } from "@/auth";
import { Context, Next } from "hono";

const API_KEY = process.env.API_KEY!;

/**
 * NextAuthセッション認証関数
 */
export async function authenticateWithNextAuth(c: Context): Promise<boolean> {
  try {
    const session = await auth();
    return session !== null;
  } catch (error) {
    console.error("NextAuth authentication error:", error);
    return false;
  }
}

/**
 * APIキー認証関数
 */
export async function authenticateWithApiKey(c: Context): Promise<boolean> {
  const apiKey = c.req.header("X-API-KEY");
  return apiKey === API_KEY;
}

/**
 * 複合認証ミドルウェア（APIキーまたはNextAuthセッション）
 * 両方のうちどちらかが有効であれば認証成功とする
 */
export async function authenticateCombined(c: Context, next: Next) {
  const isApiKeyValid = await authenticateWithApiKey(c);
  const isNextAuthValid = await authenticateWithNextAuth(c);

  if (isApiKeyValid || isNextAuthValid) {
    await next();
  } else {
    throw new HTTPException(403, {
      message: "Forbidden: API Key or NextAuth session required",
    });
  }
}

/**
 * APIキー認証のみのミドルウェア
 */
export async function authenticateApiKeyOnly(c: Context, next: Next) {
  if (await authenticateWithApiKey(c)) {
    await next();
  } else {
    throw new HTTPException(403, { message: "Forbidden: API Key required" });
  }
}

/**
 * NextAuth認証のみのミドルウェア
 */
export async function authenticateNextAuthOnly(c: Context, next: Next) {
  if (await authenticateWithNextAuth(c)) {
    await next();
  } else {
    throw new HTTPException(403, {
      message: "Forbidden: NextAuth session required",
    });
  }
}

/**
 * 認証不要のミドルウェア
 */
export async function noAuthentication(c: Context, next: Next) {
  await next();
}

/**
 * 現在認証されているユーザーIDを取得
 * APIキー認証の場合はnull、NextAuth認証の場合はユーザーIDを返す
 */
export async function getCurrentUserId(c: Context): Promise<string | null> {
  try {
    // APIキー認証の場合
    console.log("Checking API key authentication...");
    if (await authenticateWithApiKey(c)) {
      return null;
    }

    // NextAuth認証の場合
    const session = await auth();
    console.log("Current session:", session);
    return session?.user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}
