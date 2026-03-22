import { useQueryClient } from "@tanstack/react-query";
import { fetchJsonApi, type ApiResponse } from "./fetch";
import { toaster } from "@/components/ui/toast-store";
import { UserContext } from "@/contexts/UserContext";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { useMutationApiWithoutLogout } from "./useMutationApi";

type LoginSignupBody =
  | ({
      isLogin: true;
    } & {
      username: string;
      email: null;
      authenticationToken: string;
      userEncryptionKey: null;
    })
  | ({
      isLogin: false;
    } & {
      username: string;
      email: string;
      authenticationToken: string;
      userEncryptionKey: string;
    });

export interface LoginSignupResponse {
  userId: number;
  email: string;
  userEncryptionKey: string;
}

export const postSignupLoginMutation = async ({
  isLogin,
  username,
  email,
  authenticationToken,
  userEncryptionKey,
}: LoginSignupBody): Promise<ApiResponse<LoginSignupResponse>> => {
  if (isLogin) {
    return fetchJsonApi("POST", "/v1/login", {
      username,
      authenticationToken,
    });
  } else {
    return fetchJsonApi("POST", "/v1/signup", {
      username,
      email,
      authenticationToken,
      userEncryptionKey,
    });
  }
};

const postLogoutMutation = async (): Promise<ApiResponse<object>> => {
  return fetchJsonApi("POST", "/v1/logout");
};

export const useLogoutMutation = ({
  showSuccessToast,
  navigateToAfterLogout,
}: {
  showSuccessToast: boolean;
  navigateToAfterLogout: "/login" | "/";
}) => {
  const queryClient = useQueryClient();
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  return useMutationApiWithoutLogout({
    mutationFn: postLogoutMutation,
    onSuccess: async () => {
      if (showSuccessToast) {
        toaster.create({
          title: "Logged out successfully",
          type: "success",
        });
      }

      // Invalidate all queries and clear data
      await navigate(navigateToAfterLogout);
      setUser(undefined);
      // Both are required to prevent 401/logout loops
      await queryClient.cancelQueries();
      queryClient.removeQueries();
    },
  });
};

export const postChangePasswordMutation = async (body: {
  username: string;
  oldAuthenticationToken: string;
  newAuthenticationToken: string;
  newUserEncryptionKey: string;
}) => {
  return fetchJsonApi("POST", "/v1/change-password", body);
};
