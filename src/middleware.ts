import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // /staff配下のパスにBasic認証を適用
  if (request.nextUrl.pathname.startsWith("/staff")) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Staff Area"',
        },
      });
    }

    // Basic認証の検証
    const auth = authHeader.split(" ")[1];
    const [user, password] = Buffer.from(auth, "base64").toString().split(":");

    // 環境変数から認証情報を取得
    const validUser = process.env.STAFF_USERNAME || "staff";
    const validPassword = process.env.STAFF_PASSWORD || "staff123";

    if (user !== validUser || password !== validPassword) {
      return new NextResponse("Invalid credentials", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Staff Area"',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
