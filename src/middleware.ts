import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/bookkeeping/:path*",
    "/bookkeeping",
    "/clients/:path*",
    "/clients",
    "/messages/:path*",
    "/messages",
    "/payments/:path*",
    "/payments",
    "/products/:path*",
    "/products",
    "/sales/:path*",
    "/sales",
    "/store-admin/:path*",
    "/store-admin",
  ],
};
