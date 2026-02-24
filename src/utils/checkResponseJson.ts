import { toaster } from "@/components/ui/toast-store";

export const checkResponseJson = async <T>(
  response: Response,
): Promise<T | null> => {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error parsing JSON response:", error);

    toaster.create({
      title: "An error occurred",
      description: "Failed to parse server response.",
      type: "error",
    });

    return null;
  }
};
