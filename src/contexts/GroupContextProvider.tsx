import { useState, type ReactNode } from "react";
import {
  GroupContext,
  type GroupMembersComputedIndex,
  type GroupExtendedComputed,
} from "./GroupContext";

export const GroupContextProvider = ({ children }: { children: ReactNode }) => {
  const [group, setGroup] = useState<GroupExtendedComputed | undefined>(
    undefined,
  );

  const [groupMembersIndex, setGroupMembersIndex] = useState<
    GroupMembersComputedIndex | undefined
  >(undefined);

  const [isError, setIsError] = useState(false);

  return (
    <GroupContext.Provider
      value={{
        group,
        setGroup,
        groupMembersIndex,
        setGroupMembersIndex,
        isError,
        setIsError,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
