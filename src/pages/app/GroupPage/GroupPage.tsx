import { getGroupQuery, type GroupMember } from "../../../api/group";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { ErrorPage } from "../../ErrorPage";
import {
  Card,
  VStack,
  Text,
  Flex,
  Heading,
  Button,
  Center,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { useContext, useMemo } from "react";
import { UserContext } from "@/contexts/UserContext";

export const GroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const user = useContext(UserContext);

  console.log({ user });

  const { data } = useQuery({
    queryKey: ["getGroup", groupId],
    queryFn: () =>
      groupId && !isNaN(Number(groupId))
        ? getGroupQuery(groupId)
        : Promise.resolve(null),
  });

  const transactionsSorted = useMemo(
    () => data?.group.transactions.sort((a, b) => b.date - a.date),
    [data?.group.transactions]
  );

  if (!groupId || isNaN(Number(groupId))) {
    return (
      <ErrorPage
        title="404 - Page Not Found"
        description="The URL you have entered is invalid."
      />
    );
  }

  const membersIndex =
    data?.group.members.reduce((acc, member) => {
      acc[member.userId] = member;
      return acc;
    }, {} as Record<number, GroupMember>) ?? {};

  return (
    <Card.Root
      marginTop="4em"
      marginBottom="4em"
      marginLeft={{ base: "1em", md: "10em", lg: "30em" }}
      marginRight={{ base: "1em", md: "10em", lg: "30em" }}
    >
      <Card.Header>
        <Button
          onClick={() => navigate(-1)}
          width="fit-content"
          variant="outline"
        >
          <MdArrowBack /> Back
        </Button>
        <Center>
          <Heading>{data?.group.name}</Heading>
        </Center>
      </Card.Header>
      <Card.Body>
        <VStack>
          <Text marginBottom="3em">
            Members:{" "}
            {data?.group.members.map((member) => member.username).join(", ")}
          </Text>

          {data?.group.transactions.length === 0 && (
            <Text>🙅 No transactions yet.</Text>
          )}

          {transactionsSorted?.map((transaction) => (
            <Card.Root key={transaction.id} width="100%">
              <Card.Body>
                <Flex alignItems="center" justifyContent="space-between">
                  <VStack alignItems="flex-start" gap="0">
                    <Text fontWeight="bold">{transaction.name}</Text>
                    <Text color="gray.600">
                      Paid by {membersIndex[transaction.fromUserId].username}
                    </Text>
                    <Text color="gray.600">
                      For{" "}
                      {transaction.toUserIds
                        .map((id) => membersIndex[id].username)
                        .join(", ")}
                    </Text>
                  </VStack>
                  <Text>{transaction.amount} €</Text>
                </Flex>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>

        <AddTransactionDialog groupData={data?.group} />
      </Card.Body>
      <Card.Footer />
    </Card.Root>
  );
};
