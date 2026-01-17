import { auth } from "@/lib/auth"

export default auth((req) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/sign-in") || 
                     req.nextUrl.pathname.startsWith("/sign-up")
  const isDocumentsPage = req.nextUrl.pathname.startsWith("/documents")

  if (isDocumentsPage && !isAuth) {
    return Response.redirect(new URL("/sign-in", req.nextUrl))
  }

  if (isAuthPage && isAuth) {
    return Response.redirect(new URL("/documents", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"]
}
