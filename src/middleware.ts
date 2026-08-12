import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth session on every request and protects
// authenticated routes (dashboard, generate, brand, settings).
// Also sets the first-touch hero attribution cookie on the marketing homepage
// (Brand Maturity Prompt 3).
export async function middleware(request: NextRequest) {
  // Marketing homepage: set the first-touch cookie and skip auth work entirely.
  if (request.nextUrl.pathname === "/") {
    const homeResponse = NextResponse.next({ request });
    if (!request.cookies.get("bg_hero")) {
      const cookieOptions = {
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: "/",
        sameSite: "lax" as const,
        httpOnly: true,
      };
      // Always "wildcard-v1" for now; the 50/50 coin flip arrives in Prompt 8.
      homeResponse.cookies.set("bg_hero", "wildcard-v1", cookieOptions);
      homeResponse.cookies.set("bg_landed_at", String(Date.now()), cookieOptions);
    }
    return homeResponse;
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          // Write refreshed tokens into the request so downstream handlers
          // see the updated session, then mirror them onto the response so
          // the browser receives the new cookies.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options ?? {})
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  const protectedPaths = ["/dashboard", "/generate", "/brand", "/settings"];
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !data.user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/generate/:path*", "/brand/:path*", "/settings/:path*"],
};
