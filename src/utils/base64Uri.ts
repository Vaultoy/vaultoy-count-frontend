export const btoa_uri = (data: string) => {
  return data.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const atob_uri = (data: string) => {
  data = data.replace(/-/g, "+").replace(/_/g, "/");
  while (data.length % 4) {
    data += "=";
  }
  return data;
};
