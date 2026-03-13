export const UNEXPECTED_ERROR_TOAST = {
  title: "An unexpected error occurred",
  description: `Try to refresh your page or try again later.`,
  type: "error",
};

export const unexpectedErrorToastWithServerError = (error: string) => ({
  title: "An unexpected error occurred",
  description: `Try to refresh your page or try again later. Error code: ${error}.`,
  type: "error",
});
