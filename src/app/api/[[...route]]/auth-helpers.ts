import { HTTPException } from 'hono/http-exception';
import { auth } from '@/auth';

const API_KEY = process.env.API_KEY!;

/**
 * NextAuthセッション認証関数
 */
export async function authenticateWithNextAuth(c: any): Promise<boolean> {
  try {
    const session = await auth();
    return session !== null;
  } catch (error) {
    console.error('NextAuth authentication error:', error);
    return false;
  }
}

/**
 * APIキー認証関数
 */
export function authenticateWithApiKey(c: any): boolean {
  const apiKey = c.req.header('X-API-KEY');
  return apiKey === API_KEY;
}

/**
 * 複合認証ミドルウェア（APIキーまたはNextAuthセッション）
 * 両方のうちどちらかが有効であれば認証成功とする
 */
export async function authenticateCombined(c: any, next: any) {
  const isApiKeyValid = authenticateWithApiKey(c);
  const isNextAuthValid = await authenticateWithNextAuth(c);
  
  if (isApiKeyValid || isNextAuthValid) {
    await next();
  } else {
    throw new HTTPException(403, { message: 'Forbidden: API Key or NextAuth session required' });
  }
}

/**
 * APIキー認証のみのミドルウェア
 */
export async function authenticateApiKeyOnly(c: any, next: any) {
  if (authenticateWithApiKey(c)) {
    await next();
  } else {
    throw new HTTPException(403, { message: 'Forbidden: API Key required' });
  }
}

/**
 * NextAuth認証のみのミドルウェア
 */
export async function authenticateNextAuthOnly(c: any, next: any) {
  if (await authenticateWithNextAuth(c)) {
    await next();
  } else {
    throw new HTTPException(403, { message: 'Forbidden: NextAuth session required' });
  }
}

/**
 * 認証不要のミドルウェア
 */
export async function noAuthentication(c: any, next: any) {
  await next();
}

/**
 * 現在認証されているユーザーIDを取得
 * APIキー認証の場合はnull、NextAuth認証の場合はユーザーIDを返す
 */
export async function getCurrentUserId(c: any): Promise<string | null> {
  try {
    // APIキー認証の場合
    if (authenticateWithApiKey(c)) {
      return null;
    }
    
    // NextAuth認証の場合
    const session = await auth();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}