import { useInternetIdentity } from "./useInternetIdentity";

/**
 * Convenience wrapper around useInternetIdentity that exposes
 * a simplified auth surface for the app.
 */
export function useAuthState() {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const authLoading = isInitializing;

  return { isAuthenticated, authLoading, loginStatus };
}

export function useAuthActions() {
  const { login, clear } = useInternetIdentity();
  return { login, logout: clear };
}
