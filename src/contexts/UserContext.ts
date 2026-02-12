import React, { createContext } from "react";

export interface User {
  id: number;
  username: string;
  encryptionKey: CryptoKey;
}

export interface UserContextType {
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  userDataRetrievedFromLocalDB: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: undefined,
  setUser: () => {},
  userDataRetrievedFromLocalDB: false,
});
