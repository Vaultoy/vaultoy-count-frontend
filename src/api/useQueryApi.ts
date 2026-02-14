import {
  useQuery,
  type DefaultError,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiResponse } from "./fetch";
import { useContext, useEffect } from "react";
import { UserContext } from "@/contexts/UserContext";
import { useNavigate } from "react-router";
import { toaster } from "@/components/ui/toast-store";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";

export type UseQueryApiResult<TBody, TError> = {
  body: TBody | undefined;
} & UseQueryResult<ApiResponse<TBody> | undefined, TError>;

export const useQueryApi = <
  TBody,
  TError = DefaultError,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryOptions: UseQueryOptions<
    ApiResponse<TBody> | undefined,
    TError,
    ApiResponse<TBody> | undefined,
    TQueryKey
  >,
): UseQueryApiResult<TBody, TError> => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const queryResult = useQuery(queryOptions);

  useEffect(() => {
    const errorMessage =
      typeof queryResult.error === "object" &&
      queryResult.error !== null &&
      "message" in queryResult.error
        ? queryResult.error.message
        : undefined;

    // JSON parsing error
    if (
      typeof errorMessage === "string" &&
      errorMessage.includes("JSON.parse")
    ) {
      console.error("Failed to parse JSON response:", queryResult.error);
      toaster.create({
        title: "An error occurred",
        description:
          "Failed to parse server response. Try to refresh your page or try again later.",
        type: "error",
      });
    } else if (queryResult.isError) {
      console.error(
        "An error occurred while fetching data:",
        queryResult.error,
      );
      toaster.create(UNKNOWN_ERROR_TOAST);
    }

    // Session expired
    if (queryResult.data?.status === 401) {
      toaster.create({
        title: "You are not logged in or your session expired",
        description: "Please log in or sign up.",
        type: "warning",
      });
      setUser(undefined);
      navigate("/login");
      // Other non-success status codes
    } else if (queryResult.data?.status && queryResult.data.status >= 400) {
      toaster.create(unknownErrorToastWithStatus(queryResult.data.status));
    }
  }, [
    queryResult.data,
    setUser,
    navigate,
    queryResult.error,
    queryResult.isError,
  ]);

  return {
    ...queryResult,
    body: queryResult.data?.bodyJson,
  };
};
