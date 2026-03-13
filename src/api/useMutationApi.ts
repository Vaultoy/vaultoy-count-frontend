import { useMutation } from "@tanstack/react-query";
import type { ApiResponse } from "./fetch";
import type { ServerErrorResponse } from "./errors";
import { toaster } from "@/components/ui/toast-store";
import { UNKNOWN_ERROR_TOAST } from "@/components/toastMessages";

export interface UseMutationApiProps<TBody, TVariables> {
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TBody>>;
  successCode?: number;
  onSuccess?: (body: TBody) => void;
  onOtherError?: (serverError: ServerErrorResponse) => void;
}

/**
 * A custom hook that wraps useMutation from react-query to handle API mutations with standardized success and error handling.
 *
 *  successCode: The HTTP status code that indicates a successful response (default is 200).
 */
export const useMutationApi = <TBody, TVariables>(
  props: UseMutationApiProps<TBody, TVariables>,
) => {
  const successCode = props.successCode ?? 200;

  return useMutation({
    mutationFn: props.mutationFn,
    onSuccess: async (data) => {
      // Success
      if (
        data.status === successCode &&
        typeof data.bodyJson === "object" &&
        data.bodyJson &&
        !("error" in data.bodyJson)
      ) {
        props.onSuccess?.(data.bodyJson as TBody);
        return;
      }

      // Not success but also no error in the response
      if (
        typeof data.bodyJson !== "object" ||
        data.bodyJson === null ||
        !("error" in data.bodyJson)
      ) {
        console.error(
          "Received an error response with an unexpected format:",
          data.bodyJson,
        );
        toaster.create(UNKNOWN_ERROR_TOAST);
        return;
      }

      // Error in response
      const serverError = data.bodyJson as ServerErrorResponse;

      switch (serverError.error) {
        case "VALIDATION_ERROR": {
          const description = serverError.fields
            .map(
              (field) =>
                `Field "${field.field}" is invalid, it failed the "${field.invalidTag}" validation rule.`,
            )
            .join("\n");

          toaster.create({
            title: "An error occurred when validating your request",
            description,
            type: "error",
          });

          return;
        }

        case "TOO_MANY_REQUESTS": {
          console.warn(`Too many requests with the same ${serverError.reason}`);

          toaster.create({
            title: "Too many requests",
            description: `Try again in ${serverError.retryAfterTime} seconds`,
            type: "error",
          });

          return;
        }

        case "USERNAME_ALREADY_EXISTS": {
          toaster.create({
            title: "Username already taken",
            description: "Please choose a different username and try again",
            type: "error",
          });

          return;
        }

        case "EMAIL_ALREADY_EXISTS": {
          toaster.create({
            title: "Email already taken",
            description: "Please choose a different email and try again",
            type: "error",
          });

          return;
        }

        case "LAST_ADMIN_DEMOTION": {
          toaster.create({
            title:
              "You cannot demote yourself because you are the last admin in this group",
            description: "Promote another member to admin before trying again",
            type: "error",
          });

          return;
        }

        case "LAST_ADMIN_KICK": {
          toaster.create({
            title:
              "You cannot leave because you are the last admin in this group",
            description: "Promote another member to admin before trying again",
            type: "error",
          });

          return;
        }

        default: {
          props.onOtherError?.(serverError);
          return;
        }
      }
    },

    onError: (error) => {
      // TODO: Handle network error, JSON parsing error...
      console.error("An error occurred during the mutation:", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });
};
