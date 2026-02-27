// `parallelism` doesn't impact security as much, just client derivation time.
// `iterations` increases derivation time linearly and security
// `memorySize` increases memory usage and security
//
// see:
// - https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-argon2-04#section-4
// - https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
// - https://bitwarden.com/help/kdf-algorithms/#argon2id
export const argon2idParams = {
  parallelism: 1, // Hash WASM doesn't support multi-threading, so this would be inefficient
  iterations: 5,
  memorySize: 64 * 1024, // KB
};

export const VAULTOY_DERIVATION_SALT = "vaultoy_8QQWm8MZPgVa3WaLv6XS2k";
export const HKDF_INFO_PASSWORD_KEY = "vaultoy_password_key";
export const HKDF_INFO_AUTHENTICATION_TOKEN = "vaultoy_authentication_token";
