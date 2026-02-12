import { usePersistentState } from "@/utils/usePersistantState";
import { type ReactNode } from "react";
import { UserContext, type User } from "./UserContext";

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser, userDataRetrievedFromLocalDB] = usePersistentState<
    User | undefined
  >("vaultoy-count-user");

  return (
    <UserContext.Provider
      value={{ user, setUser, userDataRetrievedFromLocalDB }}
    >
      {children}
    </UserContext.Provider>
  );
};
