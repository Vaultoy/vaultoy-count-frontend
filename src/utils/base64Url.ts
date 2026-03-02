export const toBase64Url = (data: Uint8Array<ArrayBuffer>): string => {
  const binaryDetails = new TextEncoder().encode(String.fromCharCode(...data));
  const binaryString = String.fromCodePoint(...binaryDetails);
  return btoa(binaryString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const fromBase64Url = (data: string): Uint8Array<ArrayBuffer> => {
  data = data.replace(/-/g, "+").replace(/_/g, "/");
  while (data.length % 4) {
    data += "=";
  }
  const binaryString = atob(data);
  const binaryDetails = Uint8Array.from(
    binaryString,
    (char) => char.codePointAt(0)!,
  );
  return binaryDetails;
};
