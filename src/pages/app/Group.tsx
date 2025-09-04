import { getGroupQuery } from "../../api/group";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { ErrorPage } from "../ErrorPage";

export const GroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();

  if (!groupId || isNaN(Number(groupId))) {
    return (
      <ErrorPage
        title="404 - Page Not Found"
        description="The URL you have entered is invalid."
      />
    );
  }

  const { data } = useQuery({
    queryKey: ["getGroup", groupId],
    queryFn: () => getGroupQuery(groupId),
  });

  console.log(data);

  return (
    <div>
      Group: {groupId} {data?.group.name}
    </div>
  );
};
