import { UNKNOWN_ERROR_TOAST } from "@/components/toastMessages";
import { toaster } from "@/components/ui/toast-store";

interface ValidationErrorField {
  field: string;
  invalidTag: string;
}

interface ValidationErrorResponse {
  error: "VALIDATION_ERROR";
  fields: ValidationErrorField[];
}

interface TooManyRequestsResponse {
  error: "TOO_MANY_REQUESTS";
  limit: number;
  retryAfterTime: number;
  reason: string;
}

type ServerErrorResponse = ValidationErrorResponse | TooManyRequestsResponse;

/**
 * Returns true if there was an error AND it was handled, false otherwise.
 */
export const checkResponseError = async (
  dataStatus: number,
  dataJson: unknown,
): Promise<boolean> => {
  if (dataStatus >= 200 && dataStatus < 300) {
    return false;
  }

  if (
    typeof dataJson !== "object" ||
    dataJson === null ||
    !("error" in dataJson)
  ) {
    console.error(
      "Received an error response with an unexpected format:",
      dataJson,
    );
    toaster.create(UNKNOWN_ERROR_TOAST);
    return true;
  }

  const typedDataJson = dataJson as ServerErrorResponse;

  switch (typedDataJson.error) {
    case "VALIDATION_ERROR": {
      const description = typedDataJson.fields
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

      return true;
    }
    case "TOO_MANY_REQUESTS": {
      console.warn(`Too many requests with the same ${typedDataJson.reason}`);

      toaster.create({
        title: "Too many requests",
        description: `Try again in ${typedDataJson.retryAfterTime} seconds`,
        type: "error",
      });

      return true;
    }
  }

  return false;
};
