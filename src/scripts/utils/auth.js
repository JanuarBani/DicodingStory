import { getActiveRoute } from "../routes/url-parser";
import { ACCESS_TOKEN_KEY } from "../config";

// Import halaman yang dibutuhkan untuk redirect
import HomePage from "../pages/home/home-page";
import LoginPage from "../auth/login/login-page";

export function isLoggedIn() {
  return !!getAccessToken();
}

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken === null || accessToken === undefined) {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error("getAccessToken: error:", error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("putAccessToken: error:", error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error("removeAccessToken: error:", error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ["/login", "/register"];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = isLoggedIn();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    alert("Anda sudah login, tidak bisa mengakses halaman ini.");
    
    // Navigasi ulang, dan biarkan renderPage() yang rerender
    location.hash = "/";
    
    // Jangan render langsung
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = isLoggedIn();

  if (!isLogin) {
    location.hash = "/login";
    return new LoginPage();
  }

  return page;
}

export function getLogout() {
  removeAccessToken();
}
