import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;

  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/auth/error"];
  const isPublicPath = publicPaths.some((pp) => path.startsWith(pp));

  // API paths that need special handling
  const apiPaths = ["/api/"];
  const isApiPath = apiPaths.some((ap) => path.startsWith(ap));

  // Check if the user is authenticated
  const token = await getToken({ req: request, secret });
  const isAuthenticated = !!token;

  // If the path requires authentication and the user isn't authenticated, redirect to login
  if (!isPublicPath && !isApiPath && !isAuthenticated) {
    // Save the original URL the user was trying to access
    const callbackUrl = encodeURIComponent(request.nextUrl.href);

    // Redirect to the login page with a callback URL
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Skip public files and API routes without authentication requirement
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
