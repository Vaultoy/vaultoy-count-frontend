import { toaster } from "@/components/ui/toast-store";

interface ValidationErrorField {
  field: string;
  invalidTag: string;
}

interface ValidationErrorResponse {
  error: string;
  fields: ValidationErrorField[];
}

export const checkValidationError = async (
  data: Response,
): Promise<boolean> => {
  if (data.status !== 400) {
    return false;
  }

  let dataJson: ValidationErrorResponse;

  try {
    dataJson = await data.json();
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    return false;
  }

  if (dataJson.error !== "VALIDATION_ERROR") {
    return false;
  }

  const description = dataJson.fields
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
};
