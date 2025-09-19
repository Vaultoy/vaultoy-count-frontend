import {
  getGroupQuery,
  type GroupExtended,
  type GroupMember,
} from "@/api/group";
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
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import {
  decryptGroupEncryptionKey,
  decryptNumber,
  decryptString,
} from "@/utils/encryption";

export const GroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const { data } = useQuery({
    queryKey: ["getGroup", groupId],
    queryFn: () =>
      groupId && !isNaN(Number(groupId))
        ? getGroupQuery(groupId)
        : Promise.resolve(null),
  });

  const [decryptedGroup, setDecryptedGroup] =
    useState<GroupExtended<false> | null>(null);

  useEffect(() => {
    const decryptGroup = async () => {
      if (!user || !user.user || !data || !data.group) return;

      const groupEncryptionKey = await decryptGroupEncryptionKey(
        data.group.groupEncryptionKey,
        user.user.encryptionKey
      );

      const group = {
        ...data.group,
        name: await decryptString(data.group.name, groupEncryptionKey),
        encryptedGroupEncryptionKey: groupEncryptionKey, // That is a terrible name as when decrypted it is not encrypted anymore
        members: data.group.members,
        transactions: await Promise.all(
          data.group.transactions.map(async (transaction) => ({
            ...transaction,
            date: await decryptNumber(transaction.date, groupEncryptionKey),
            name: await decryptString(transaction.name, groupEncryptionKey),
            amount: await decryptNumber(transaction.amount, groupEncryptionKey),
            fromUserId: await decryptNumber(
              transaction.fromUserId,
              groupEncryptionKey
            ),
            toUserIds: await Promise.all(
              transaction.toUserIds.map(
                async (id) => await decryptNumber(id, groupEncryptionKey)
              )
            ),
          }))
        ),
      };

      group.transactions.sort((a, b) => b.date - a.date);

      if (!active) return;
      setDecryptedGroup(group);
    };

    let active = true;
    decryptGroup();
    return () => {
      active = false;
    };
  }, [user, data]);

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
          <Heading>{decryptedGroup?.name}</Heading>
        </Center>
      </Card.Header>
      <Card.Body>
        <VStack>
          <Text marginBottom="3em">
            Members:{" "}
            {decryptedGroup?.members
              .map((member) => member.username)
              .join(", ")}
          </Text>

          {decryptedGroup?.transactions.length === 0 && (
            <Text>🙅 No transactions yet.</Text>
          )}

          {decryptedGroup?.transactions.map((transaction) => (
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
