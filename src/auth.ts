import NextAuth from "next-auth"
import LINE from "next-auth/providers/line"
import Credentials from "next-auth/providers/credentials";
 

async function verifyLineToken(accessToken: string) {
  try {
    // IDトークンをLINEのAPIに投げて検証
    const response = await fetch("https://api.line.me/v2/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to verify LINE ID token:", await response.text());
      return null;
    }

    const profile = await response.json();
    // プロフィール情報（sub, name, picture, emailなど）を返す
    return profile;
  } catch (error) {
    console.error("Error verifying LINE token:", error);
    return null;
  }
}




export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    LINE,
    Credentials({
      // プロバイダーを識別するためのID
      id: "line-liff",
      // ログインフォームは使用しないので authorize 関数のみを実装
      async authorize(credentials) {
        // credentialsオブジェクトからアクセストークンを取得
        const accessToken = credentials?.accessToken;
      
        if (typeof accessToken !== "string") {
          throw new Error("Access token not provided or is invalid.");
        }

        // LINEのトークンを検証し、プロフィール情報を取得
        const profile = await verifyLineToken(accessToken);
        console.log("Verified LINE profile:", profile);
        if (profile) {
          // 認証成功。NextAuthに返すユーザーオブジェクト
          return {
            id: profile.userId, // LINEのユーザーID
            name: profile.name,
          };
        }

        // 認証失敗
        return null;
      },
    }),
  ],
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
})

