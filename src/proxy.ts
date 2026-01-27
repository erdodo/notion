export const config = {
  matcher: [
    String.raw`/((?!_next|api/auth|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)`,
  ],
};
export { middleware as proxy } from '@/lib/auth';
