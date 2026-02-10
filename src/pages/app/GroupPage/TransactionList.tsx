import { type GroupExtended, type GroupMember } from "@/api/group";
import { Text, Card, VStack, Flex } from "@chakra-ui/react";
import { AddTransactionDialog } from "./AddTransactionDialog";

export const TransactionList = ({
  groupData,
  membersIndex,
}: {
  groupData: GroupExtended<false> | undefined;
  membersIndex: Record<number, GroupMember>;
}) => {
  return (
    <VStack>
      <AddTransactionDialog groupData={groupData} />

      {groupData?.transactions.length === 0 && (
        <Text>🙅 No transactions yet.</Text>
      )}

      {groupData?.transactions.map((transaction) => (
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
              <Text>
                {(transaction.amount / 100) % 1 === 0
                  ? (transaction.amount / 100).toFixed(0)
                  : (transaction.amount / 100).toFixed(2)}{" "}
                €
              </Text>
            </Flex>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
};
