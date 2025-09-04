import { AbsoluteCenter } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

export const AppHome = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["getGroupsAll"],
    queryFn: async () => ({}), // TODO
  });
  return <AbsoluteCenter>App Home - {JSON.stringify(data)}</AbsoluteCenter>;
};
