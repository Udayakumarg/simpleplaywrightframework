/**
 * Looks up a provider class from the registry by name.
 * Throws a clear error if the provider is not registered.
 *
 * Used by both initAuthSession (UI) and initApiAuthSession (API).
 */
export function resolveProvider<T>(
  providerName:     string,
  providerRegistry: Record<string, new (creds: { username: string; password: string }) => T>
): new (creds: { username: string; password: string }) => T {
  const ProviderClass = providerRegistry[providerName];
  if (!ProviderClass) {
    throw new Error(
      `[Framework] Unknown auth provider: "${providerName}"\n` +
      `  Registered providers: ${Object.keys(providerRegistry).join(", ")}`
    );
  }
  return ProviderClass;
}
