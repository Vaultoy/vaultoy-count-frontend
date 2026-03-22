import {
  useQuery,
  type DefaultError,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiResponse } from "./fetch";
import { useEffect, useMemo } from "react";
import { toaster } from "@/components/ui/toast-store";
import { useLogoutMutation } from "./auth";
import type { QueryErrorResponse } from "./errors";

export type UseQueryApiResult<TBody, TError> = {
  body: TBody | null;
  queryError: QueryErrorResponse | null;
} & UseQueryResult<ApiResponse<TBody> | null, TError>;

export const JSON_PARSE_ERROR = "JSON_PARSE_ERROR";
export const NETWORK_ERROR = "NETWORK_ERROR";
export const UNKNOWN_QUERY_ERROR = "UNKNOWN_QUERY_ERROR";

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
  const logoutMutation = useLogoutMutation({
    showSuccessToast: false,
    navigateToAfterLogout: "/login",
  });

  const queryResult = useQuery(queryOptions);

  const serverErrorCode =
    queryResult.data?.bodyJson &&
    typeof queryResult.data.bodyJson === "object" &&
    "error" in queryResult.data.bodyJson
      ? queryResult.data.bodyJson.error
      : null;

  // Session expired
  useEffect(() => {
    if (serverErrorCode === "NOT_AUTHENTICATED" && !queryResult.isFetching) {
      toaster.create({
        title: "You are not logged in or your session expired",
        description: "Please log in or sign up.",
        type: "warning",
      });

      logoutMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverErrorCode]);

  return useMemo(() => {
    // Adding additional error codes
    const errorMessage =
      typeof queryResult.error === "object" &&
      queryResult.error !== null &&
      "message" in queryResult.error &&
      typeof queryResult.error.message === "string"
        ? queryResult.error.message
        : undefined;

    if (errorMessage?.includes("JSON.parse")) {
      console.error("Failed to parse JSON response:", queryResult.error);
      return {
        ...queryResult,
        body: null,
        queryError: { error: "JSON_PARSE_ERROR" },
      };
    } else if (
      errorMessage?.includes("NetworkError when attempting to fetch resource")
    ) {
      console.error(
        "Network error occurred while fetching data:",
        queryResult.error,
      );
      return {
        ...queryResult,
        body: null,
        queryError: { error: "NETWORK_ERROR" },
      };
    } else if (queryResult.isError) {
      console.error(
        "An error occurred while fetching data:",
        queryResult.error,
      );
      return {
        ...queryResult,
        body: null,
        queryError: { error: "UNKNOWN_QUERY_ERROR" },
      };
    }

    // Check for server errors in the response body
    if (
      queryResult.data?.bodyJson &&
      typeof queryResult.data.bodyJson === "object" &&
      "error" in queryResult.data.bodyJson
    ) {
      console.error(
        "The server returned an error response:",
        queryResult.data.bodyJson,
      );
      return {
        ...queryResult,
        body: null,
        queryError: queryResult.data.bodyJson,
      };
    }

    return {
      ...queryResult,
      body: queryResult.data?.bodyJson as TBody,
      queryError: null,
    };
  }, [queryResult]);
};
