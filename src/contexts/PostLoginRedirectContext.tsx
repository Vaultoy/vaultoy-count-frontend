import { usePersistentState } from "@/utils/usePersistantState";
import React, { createContext, type ReactNode } from "react";

interface PostLoginRedirectInfos {
  uri: string;
  type: "JOIN_INVITATION" | "OTHER";
}

interface PostLoginRedirectContextType {
  postLoginRedirectInfos: PostLoginRedirectInfos | undefined;
  setPostLoginRedirectInfos: React.Dispatch<
    React.SetStateAction<PostLoginRedirectInfos | undefined>
  >;
  postLoginRedirectInfosRetrievedFromLocalDB: boolean;
}

export const PostLoginRedirectContext =
  createContext<PostLoginRedirectContextType>({
    postLoginRedirectInfos: undefined,
    setPostLoginRedirectInfos: () => {},
    postLoginRedirectInfosRetrievedFromLocalDB: false,
  });

export const PostLoginRedirectContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [
    postLoginRedirectInfos,
    setPostLoginRedirectInfos,
    postLoginRedirectInfosRetrievedFromLocalDB,
  ] = usePersistentState<PostLoginRedirectInfos | undefined>(
    "post-login-redirect-infos"
  );

  return (
    <PostLoginRedirectContext.Provider
      value={{
        postLoginRedirectInfos,
        setPostLoginRedirectInfos,
        postLoginRedirectInfosRetrievedFromLocalDB,
      }}
    >
      {children}
    </PostLoginRedirectContext.Provider>
  );
};
