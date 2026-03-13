export type Encrypted<
  T,
  isEncrypted extends boolean = true,
> = isEncrypted extends true
  ? string // Base64 encoded encrypted data
  : T;

export type Result<T> = T & {
  isOk: boolean;
};

export type EmptyObject = Record<string, never>;
