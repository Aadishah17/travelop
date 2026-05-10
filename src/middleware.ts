import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token }) => Boolean(token),
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trips",
    "/trips/new/:path*",
    "/itinerary/:path*",
    "/budget/:path*",
    "/activities/:path*",
    "/packing/:path*",
    "/notes/:path*",
    "/shared/:path*",
    "/settings/:path*"
  ]
};
