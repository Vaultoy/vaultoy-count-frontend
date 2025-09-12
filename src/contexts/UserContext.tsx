import { usePersistentState } from "@/utils/usePersistantState";
import React, { createContext, type ReactNode } from "react";

interface User {
  id: number;
  username: string;
  encryptionKey: CryptoKey;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = usePersistentState<User | null>(
    null,
    "secure-count-user"
  );

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
