import React, { createContext } from "react";

export interface PostLoginRedirectInfos {
  uri: string;
  type: "JOIN_INVITATION" | "OTHER";
}

export interface PostLoginRedirectContextType {
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
