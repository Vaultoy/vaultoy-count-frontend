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

export const postSignupLoginMutation = async ({
  username,
  hashedPassword,
  isLogin,
}: {
  username: string;
  hashedPassword: string;
  isLogin: boolean;
}) => {
  if (isLogin) {
    return fetchApi("POST", "/v1/login", {
      username,
      password: hashedPassword,
    });
  } else {
    return fetchApi("POST", "/v1/signup", {
      username,
      password: hashedPassword,
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
      console.error("Login failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });
};
