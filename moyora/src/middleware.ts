import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized({ req, token }) {
            // Define protected paths
            const protectedPaths = [
                "/dashboard",
                "/collab",
                "/club",
                "/projects",
                "/events"
            ];

            const path = req.nextUrl.pathname;

            // Check if the current path starts with any of the protected paths
            const isProtected = protectedPaths.some(protectedPath =>
                path.startsWith(protectedPath)
            );

            // If it's a protected path, require a token (user logged in)
            if (isProtected) {
                return !!token;
            }

            // Allow access to other pages
            return true;
        },
    },
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/collab/:path*",
        "/club/:path*",
        "/projects/:path*",
        "/events/:path*"
    ],
};
