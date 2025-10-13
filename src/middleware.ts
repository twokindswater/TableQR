export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/stores/:path*",
    "/store/:path*",
  ],
}

