import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/analysis/:path*', '/portfolio/:path*', '/properties/:path*', '/reports/:path*', '/settings/:path*', '/users/:path*', '/security/:path*']
};
