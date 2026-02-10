import {
  EXPENSE,
  REPAYMENT,
  REVENUE,
  type GroupExtended,
  type GroupMember,
  type TransactionType,
} from "@/api/group";
import { Text, Card, VStack, Flex } from "@chakra-ui/react";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { getForText, getPaidByText } from "./transactionTypeInfos";

const getTransactionEmoji = (transactionType: TransactionType) => {
  switch (transactionType) {
    case EXPENSE:
      return "🧾";
    case REPAYMENT:
      return "🤝";
    case REVENUE:
      return "💸";
  }
};
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

      {groupData?.transactions.map((transaction) => {
        const amountSign = transaction.transactionType === REVENUE ? -1 : 1;

        return (
          <Card.Root key={transaction.id} width="100%">
            <Card.Body>
              <Flex alignItems="center" justifyContent="space-between">
                <VStack alignItems="flex-start" gap="0">
                  <Text fontWeight="bold">
                    {getTransactionEmoji(transaction.transactionType)}{" "}
                    {transaction.name}
                  </Text>
                  <Text color="gray.600">
                    {getPaidByText(transaction.transactionType)}{" "}
                    {membersIndex[transaction.fromUserId].username}
                  </Text>
                  <Text color="gray.600">
                    {getForText(transaction.transactionType)}{" "}
                    {transaction.toUserIds
                      .map((id) => membersIndex[id].username)
                      .join(", ")}
                  </Text>
                </VStack>
                <Text>
                  {(transaction.amount / 100) % 1 === 0
                    ? ((amountSign * transaction.amount) / 100).toFixed(0)
                    : ((amountSign * transaction.amount) / 100).toFixed(2)}{" "}
                  €
                </Text>
              </Flex>
            </Card.Body>
          </Card.Root>
        );
      })}
    </VStack>
  );
};
