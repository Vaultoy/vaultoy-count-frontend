import { usePersistentState } from "@/utils/usePersistantState";
import React, { createContext, type ReactNode } from "react";

interface User {
  id: number;
  username: string;
  encryptionKey: CryptoKey;
}

interface UserContextType {
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  userDataRetrievedFromLocalDB: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: undefined,
  setUser: () => {},
  userDataRetrievedFromLocalDB: false,
});

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser, userDataRetrievedFromLocalDB] = usePersistentState<
    User | undefined
  >("secure-count-user");

  return (
    <UserContext.Provider
      value={{ user, setUser, userDataRetrievedFromLocalDB }}
    >
      {children}
    </UserContext.Provider>
  );
};
