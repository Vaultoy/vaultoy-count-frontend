import { usePersistentState } from "@/utils/usePersistantState";
import { type ReactNode } from "react";
import {
  PostLoginRedirectContext,
  type PostLoginRedirectInfos,
} from "./PostLoginRedirectContext";

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
    "post-login-redirect-infos",
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
