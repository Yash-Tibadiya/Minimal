import { auth } from "@/auth";
import {
  apiAuthPrefix,
  AppRoutes,
  authRoutes,
  loginRoutes,
  publicRoutes,
} from "./routes-config";

export default auth(
  (req: {
    nextUrl: { pathname: any };
    auth: any;
    url: string | URL | undefined;
  }): any => {
    const pathname = req.nextUrl.pathname;
    const session = req.auth;
    const isLoggedIn = !!req.auth;

    const user: any = session?.user;

    const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(pathname);
    const isloginRoutes = loginRoutes.includes(pathname);

    // const isPublicApi = publicApis.includes(pathname);

    const isAuthRoute = authRoutes.includes(pathname);

    if (isApiAuthRoute) {
      return null;
    }

    if (isAuthRoute) {
      return null;
    }

    if (isloginRoutes && isLoggedIn) {
      return Response.redirect(new URL(AppRoutes.home, req.url));
    }

    if (!isLoggedIn && !isPublicRoute) {
      const urlToRedirect = new URL(AppRoutes.login, req.url);
      return Response.redirect(urlToRedirect);
    }

    return null;
  }
);

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
