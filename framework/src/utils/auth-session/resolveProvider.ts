import { Creds } from "../../types/auth";

export function resolveProvider<T>(
  providerName:     string,
  providerRegistry: Record<string, new (creds: Creds) => T>
): new (creds: Creds) => T {
  const ProviderClass = providerRegistry[providerName];
  if (!ProviderClass) {
    throw new Error(
      `Unknown auth provider: "${providerName}". Registered: ${Object.keys(providerRegistry).join(", ") || "(none)"}`
    );
  }
  return ProviderClass;
}
