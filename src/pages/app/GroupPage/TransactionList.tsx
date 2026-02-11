import {
  EXPENSE,
  REPAYMENT,
  REVENUE,
  type GroupExtended,
  type GroupMember,
  type TransactionType,
} from "@/api/group";
import {
  Text,
  Card,
  VStack,
  Flex,
  Skeleton,
  SkeletonCircle,
  HStack,
} from "@chakra-ui/react";
import { AddTransactionDialog } from "./AddTransactionDialog";
import {
  CURRENCY_SYMBOL,
  floatCentsToString,
  getForText,
  getPaidByText,
} from "../../../utils/textGeneration";

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
                    {transaction.toUsers
                      .map(({ id }) => membersIndex[id].username)
                      .join(", ")}
                  </Text>
                </VStack>
                <Text>
                  {floatCentsToString(amountSign * transaction.amount)}{" "}
                  {CURRENCY_SYMBOL}
                </Text>
              </Flex>
            </Card.Body>
          </Card.Root>
        );
      })}

      {!groupData &&
        Array(3)
          .fill(0)
          .map((_, i) => (
            <Card.Root key={i} width="100%">
              <Card.Body>
                <Flex alignItems="center" justifyContent="space-between">
                  <VStack alignItems="flex-start" gap="0.5em">
                    <Text fontWeight="bold">
                      <HStack>
                        <SkeletonCircle size="1.1em" />{" "}
                        <Skeleton height="1.1em" width="10em" />
                      </HStack>
                    </Text>
                    <Text color="gray.600">
                      <Skeleton height="0.8em" width="8em" />
                    </Text>
                    <Text color="gray.600">
                      <Skeleton height="0.8em" width="14em" />
                    </Text>
                  </VStack>
                  <Text>
                    <Skeleton height="0.8em" width="3em" />
                  </Text>
                </Flex>
              </Card.Body>
            </Card.Root>
          ))}
    </VStack>
  );
};
