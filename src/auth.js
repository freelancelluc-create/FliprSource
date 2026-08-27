/**
 * Cliente de autenticación y sincronización de datos (frontend).
 * Guarda el token y el usuario en localStorage y llama a las serverless functions.
 */

const TOKEN_KEY = "flipr_token";
const USER_KEY = "flipr_user";

export function getStoredToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
}
export function setStoredToken(t) {
  try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch (e) {}
}
export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch (e) { return null; }
}
export function setStoredUser(u) {
  try { if (u) localStorage.setItem(USER_KEY, JSON.stringify(u)); else localStorage.removeItem(USER_KEY); } catch (e) {}
}

async function api(path, { method = "GET", body } = {}) {
  // Tiempo límite para que ningún botón se quede colgado para siempre
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const headers = { "Content-Type": "application/json" };
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const resp = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await resp.json().catch(() => null);
    return { ok: resp.ok, status: resp.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: e && e.name === "AbortError" ? "timeout" : "network" } };
  } finally {
    clearTimeout(timeout);
  }
}

export async function register(name, email, password) {
  const r = await api("/api/auth/register", { method: "POST", body: { name, email, password } });
  if (r.ok && r.data && r.data.token) {
    setStoredToken(r.data.token);
    setStoredUser(r.data.user);
  }
  return r;
}

export async function login(email, password) {
  const r = await api("/api/auth/login", { method: "POST", body: { email, password } });
  if (r.ok && r.data && r.data.token) {
    setStoredToken(r.data.token);
    setStoredUser(r.data.user);
  }
  return r;
}

export async function logout() {
  try { await api("/api/auth/logout", { method: "POST" }); } catch (e) {}
  setStoredToken("");
  setStoredUser(null);
}

/** Devuelve el usuario actual (o null) si hay una sesión válida. */
export async function fetchMe() {
  const r = await api("/api/auth/me");
  const user = r.ok && r.data && r.data.user ? r.data.user : null;
  setStoredUser(user);
  return user;
}

export async function saveUserData(history, favorites, credits) {
  return api("/api/user/save", { method: "POST", body: { history, favorites, credits } });
}

export async function loadUserData() {
  const r = await api("/api/user/load");
  return r.ok && r.data ? r.data : null;
}
