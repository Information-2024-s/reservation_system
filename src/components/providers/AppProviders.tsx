'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { SessionProvider, signIn, signOut } from 'next-auth/react';
import type { Liff } from '@line/liff';

import { GlobalContext } from '@/contexts/GlobalContexts';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const hasTriedSignInRef = useRef(false);

  const handleLogout = useCallback(async () => {
    if (!liffObject) return;

    await signOut({ redirect: false });

    if (liffObject.isLoggedIn()) {
      liffObject.logout();
    }

    window.location.reload();
  }, [liffObject]);

  useEffect(() => {
    let isCancelled = false;

    const initLiff = async () => {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

      if (!liffId) {
        console.error('NEXT_PUBLIC_LIFF_ID is not defined.');
        setLiffError('LIFF IDが設定されていません。管理者に連絡してください。');
        return;
      }

      try {
        const liffModule = await import('@line/liff');
        const liff = liffModule.default;

        console.log('LIFF init start');
        await liff.init({
          liffId,
          withLoginOnExternalBrowser: true,
        });

        const readyPromise = (liff as unknown as { ready?: Promise<void> }).ready;
        if (readyPromise && typeof readyPromise.then === 'function') {
          await readyPromise;
        }

        if (isCancelled) return;

        setLiffObject(liff);
        setLiffError(null);

        if (liff.isLoggedIn() && !hasTriedSignInRef.current) {
          const accessToken = liff.getAccessToken();
          if (accessToken) {
            hasTriedSignInRef.current = true;
            const result = await signIn('line-liff', {
              accessToken,
              redirect: false,
            });

            if (result?.error) {
              console.error('NextAuth sign-in failed:', result.error);
            }
          }
        }
      } catch (error) {
        if (isCancelled) return;
        console.error('LIFF init failed:', error);
        setLiffError(error instanceof Error ? error.message : String(error));
      }
    };

    initLiff();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <SessionProvider>
      <GlobalContext.Provider
        value={{
          liff: liffObject,
          liffError,
          handleLogout,
        }}
      >
        {children}
      </GlobalContext.Provider>
    </SessionProvider>
  );
}
