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
  Heading,
  Button,
  Center,
  HStack,
  Tabs,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import {
  decryptEncryptionKey,
  decryptNumber,
  decryptNumberList,
  decryptString,
} from "@/utils/encryption";
import { ShareGroupDialog } from "./ShareGroupDialog";
import { TransactionList } from "./TransactionList";
import { Equilibrium } from "./Equilibrium";

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

  const [decryptedGroup, setDecryptedGroup] = useState<
    GroupExtended<false> | undefined
  >(undefined);

  useEffect(() => {
    const decryptGroup = async () => {
      if (!user || !user.user || !data || !data.group) return;

      const groupEncryptionKey = await decryptEncryptionKey(
        data.group.groupEncryptionKey,
        user.user.encryptionKey,
      );

      const group = {
        ...data.group,
        name: await decryptString(data.group.name, groupEncryptionKey),
        groupEncryptionKey,
        members: data.group.members,
        transactions: await Promise.all(
          data.group.transactions.map(async (transaction) => ({
            ...transaction,
            date: await decryptNumber(transaction.date, groupEncryptionKey),
            name: await decryptString(transaction.name, groupEncryptionKey),
            amount: await decryptNumber(transaction.amount, groupEncryptionKey),
            fromUserId: await decryptNumber(
              transaction.fromUserId,
              groupEncryptionKey,
            ),
            toUserIds: await decryptNumberList(
              transaction.toUserIds,
              groupEncryptionKey,
            ),
          })),
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
    data?.group.members.reduce(
      (acc, member) => {
        acc[member.userId] = member;
        return acc;
      },
      {} as Record<number, GroupMember>,
    ) ?? {};

  return (
    <Center>
      <Card.Root
        marginTop="2em"
        marginBottom="4em"
        width={{ base: "94%", md: "70%", lg: "60%" }}
      >
        <Card.Header>
          <HStack justifyContent="space-between">
            <Button
              onClick={() => navigate("/app")}
              width="fit-content"
              variant="outline"
            >
              <MdArrowBack /> Back
            </Button>
            <ShareGroupDialog groupData={decryptedGroup} />
          </HStack>
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

            <Tabs.Root
              defaultValue="transactions"
              width="100%"
              variant="enclosed"
            >
              <Tabs.List width="100%" justifyContent="center">
                <Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
                <Tabs.Trigger value="equilibrium">Equilibrium</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="transactions">
                <TransactionList
                  groupData={decryptedGroup}
                  membersIndex={membersIndex}
                />
              </Tabs.Content>
              <Tabs.Content value="equilibrium">
                <Equilibrium groupData={decryptedGroup} />
              </Tabs.Content>
            </Tabs.Root>
          </VStack>
        </Card.Body>
        <Card.Footer />
      </Card.Root>
    </Center>
  );
};
