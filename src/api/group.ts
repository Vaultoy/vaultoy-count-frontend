import { fetchApi } from "./fetch";

export const createGroupMutation = async ({ name }: { name: string }) => {
  return fetchApi("POST", "/v1/group", {
    name,
  });
};

interface Group {
  id: number;
  name: string;
}

interface GroupExtended extends Group {
  transactions: number;
}
export const getGroupsQuery = async (): Promise<{ groups: Group[] }> => {
  const response = await fetchApi("GET", "/v1/group/all");
  return response.json();
};

export const getGroupQuery = async (
  groupId: string
): Promise<{ group: GroupExtended }> => {
  const response = await fetchApi("GET", `/v1/group/${groupId}`);
  return response.json();
};
