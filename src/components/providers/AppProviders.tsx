"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import type { Liff } from "@line/liff";

import { GlobalContext } from "@/contexts/GlobalContexts";

type ReadyPromise = {
	ready?: Promise<void>;
};

type AppProvidersProps = {
	children: React.ReactNode;
	enableLiff?: boolean;
};

function LiffProvider({ children, enableLiff }: AppProvidersProps) {
	const [liffObject, setLiffObject] = useState<Liff | null>(null);
	const [liffError, setLiffError] = useState<string | null>(null);
	const hasTriedSignInRef = useRef(false);
	const { update } = useSession();

	const handleLogout = useCallback(async () => {
		await signOut({ redirect: false });

		if (liffObject?.isLoggedIn()) {
			liffObject.logout();
		}

		if (typeof window !== "undefined") {
			window.location.reload();
		}
	}, [liffObject]);

	useEffect(() => {
		if (!enableLiff) {
			setLiffObject(null);
			setLiffError(null);
			return;
		}

		let isCancelled = false;

		const init = async () => {
			const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

			if (!liffId) {
				console.error("NEXT_PUBLIC_LIFF_ID is not defined.");
				setLiffError("LIFF IDが設定されていません。管理者に連絡してください。");
				return;
			}

			try {
				const { default: liff } = await import("@line/liff");

				await liff.init({
					liffId,
					withLoginOnExternalBrowser: true,
				});

				const readyPromise = (liff as ReadyPromise).ready;
				if (readyPromise && typeof readyPromise.then === "function") {
					await readyPromise;
				}

				if (isCancelled) return;

				setLiffObject(liff);
				setLiffError(null);

				if (liff.isLoggedIn() && !hasTriedSignInRef.current) {
					const accessToken = liff.getAccessToken();

					if (accessToken) {
						hasTriedSignInRef.current = true;
						const result = await signIn("line-liff", {
							accessToken,
							redirect: false,
						});

						if (result?.error) {
							console.error("NextAuth sign-in failed:", result.error);
						} else if (result?.ok) {
							// セッションを更新してUIに反映
							await update();
						}
					}
				}
			} catch (error) {
				if (isCancelled) return;
				console.error("LIFF init failed:", error);
				setLiffError(error instanceof Error ? error.message : String(error));
			}
		};

		init();

		return () => {
			isCancelled = true;
		};
	}, [enableLiff, update]);

	return (
		<GlobalContext.Provider
			value={{
				liff: liffObject,
				liffError,
				handleLogout,
			}}
		>
			{children}
		</GlobalContext.Provider>
	);
}

export function AppProviders({ children, enableLiff = false }: AppProvidersProps) {
	return (
		<SessionProvider>
			<LiffProvider enableLiff={enableLiff}>
				{children}
			</LiffProvider>
		</SessionProvider>
	);
}
