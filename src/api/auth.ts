import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "./fetch";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import { toaster } from "@/components/ui/toast-store";
import { UserContext } from "@/contexts/UserContext";
import { useContext } from "react";
import { useNavigate } from "react-router";
import { checkValidationError } from "@/utils/checkValidationError";

type LoginSignupBody =
  | ({
      isLogin: true;
    } & {
      username: string;
      authenticationToken: string;
      userEncryptionKey: null;
    })
  | ({
      isLogin: false;
    } & {
      username: string;
      authenticationToken: string;
      userEncryptionKey: string;
    });

export interface LoginSignupResponse {
  userId: number;
  userEncryptionKey: string;
}

export const postSignupLoginMutation = async ({
  isLogin,
  username,
  authenticationToken,
  userEncryptionKey,
}: LoginSignupBody) => {
  if (isLogin) {
    return fetchApi("POST", "/v1/login", {
      username,
      authenticationToken,
    });
  } else {
    return fetchApi("POST", "/v1/signup", {
      username,
      authenticationToken,
      userEncryptionKey,
    });
  }
};

const postLogoutMutation = async () => {
  return fetchApi("POST", "/v1/logout");
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

  return useMutation({
    mutationFn: postLogoutMutation,
    onSuccess: async (data) => {
      if (await checkValidationError(data)) {
        return;
      }

      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));
        return;
      }

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
    onError: (error) => {
      console.error("Logout failed:", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });
};

export const postChangePasswordMutation = async (body: {
  username: string;
  oldAuthenticationToken: string;
  newAuthenticationToken: string;
  newUserEncryptionKey: string;
}) => {
  return fetchApi("POST", "/v1/change-password", body);
};
