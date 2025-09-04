import { fetchApi } from "./fetch";

export const createGroupQuery = async ({ name }: { name: string }) => {
  return fetchApi("POST", "/group", {
    name,
  });
};
