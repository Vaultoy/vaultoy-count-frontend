export type Encrypted<
  T,
  isEncrypted extends boolean = true,
> = isEncrypted extends true
  ? string // Base64 encoded encrypted data
  : T;
