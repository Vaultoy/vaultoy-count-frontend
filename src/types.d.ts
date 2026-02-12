import { GroupMember } from "./api/group";

export type Encrypted<
  T,
  isEncrypted extends boolean = true,
> = isEncrypted extends true
  ? string // Base64 encoded encrypted data
  : T;

export interface RepaymentsToMake {
  toUserId: number;
  amount: number;
}

export interface MemberComputed extends GroupMember {
  balance: number;
  repaymentsToMake: RepaymentsToMake[];
}
