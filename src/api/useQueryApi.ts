import {
  useQuery,
  useQueryClient,
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
  body: TBody | null;
} & UseQueryResult<ApiResponse<TBody> | null, TError>;

export const useQueryApi = <
  TBody,
  TError = DefaultError,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryOptions: UseQueryOptions<
    ApiResponse<TBody> | null,
    TError,
    ApiResponse<TBody> | null,
    TQueryKey
  >,
): UseQueryApiResult<TBody | undefined, TError> => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

    // Session expired.
    // !isFetching is required in the following scenario:
    // 1. User makes a request with an expired session -> server responds with 401
    // 2. User tries to log in
    // 3. After log in, the user is instantly logged out again because the previous 401 response
    //   is still in memory by tanstack query
    if (queryResult.data?.status === 401 && !queryResult.isFetching) {
      toaster.create({
        title: "You are not logged in or your session expired",
        description: "Please log in or sign up.",
        type: "warning",
      });

      queryClient.invalidateQueries();
      setUser(undefined);
      navigate("/login");

      // Other non-success status codes
    } else if (
      queryResult.data?.status &&
      queryResult.data.status >= 400 &&
      !queryResult.isFetching
    ) {
      toaster.create(unknownErrorToastWithStatus(queryResult.data.status));
    }
  }, [
    queryResult.data,
    queryResult.error,
    queryResult.isError,
    queryOptions.queryKey,
    queryResult.isFetching,
    queryClient,
    setUser,
    navigate,
  ]);

  return {
    ...queryResult,
    body: queryResult.data?.bodyJson,
  };
};
