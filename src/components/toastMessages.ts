export const UNKNOWN_ERROR_TOAST = {
  title: "An unknown error occurred",
  description: `Try to refresh your page or try again later.`,
  type: "error",
};

export const unknownErrorToastWithStatus = (status: number) => ({
  title: "An unknown error occurred",
  description: `Try to refresh your page or try again later. Status: ${status}.`,
  type: "error",
});
