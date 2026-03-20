export type Encrypted<
  T,
  isEncrypted extends boolean = true,
> = isEncrypted extends true
  ? string // Base64 encoded encrypted data
  : T;

export type Result<Ok, Err> = (Ok & { isOk: true }) | (Err & { isOk: false });

export type EmptyObject = Record<string, never>;
