import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import RegisterPage from "../auth/register/register-page";
import LoginPage from "../auth/login/login-page";
import NewStoryPage from "../pages/new/new-page";
import DetailPage from "../pages/detail/detail-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import NotFoundPage from "../pages/not-found/not-found-page";

import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";

const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/about": () => checkAuthenticatedRoute(new AboutPage()),
  "/new": () => checkAuthenticatedRoute(new NewStoryPage()),
  "/detail/:id": () => checkAuthenticatedRoute(new DetailPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
  // Route fallback (jika tidak cocok)
  "*": () => new NotFoundPage(),
};

export default routes;
