import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const OLD_MGMT = ["/bookkeeping", "/clients", "/messages", "/payments", "/products", "/sales", "/store-admin"];

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    if (OLD_MGMT.some((p) => path === p || path.startsWith(p + "/"))) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
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
