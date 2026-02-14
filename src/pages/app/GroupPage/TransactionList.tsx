import { EXPENSE, REPAYMENT, REVENUE, type TransactionType } from "@/api/group";
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
import { GroupContext } from "@/contexts/GroupContext";
import { useContext } from "react";

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
export const TransactionList = () => {
  const { group, groupMembersIndex, isError } = useContext(GroupContext);

  return (
    <VStack>
      <AddTransactionDialog groupData={group} />

      {group?.transactions.length === 0 && <Text>🙅 No transactions yet.</Text>}

      {group?.transactions.map((transaction) => {
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
                    {groupMembersIndex &&
                      groupMembersIndex[transaction.fromUserId].username}
                  </Text>
                  <Text color="gray.600">
                    {getForText(transaction.transactionType)}{" "}
                    {transaction.toUsers
                      .map(
                        ({ id }) =>
                          groupMembersIndex && groupMembersIndex[id].username,
                      )
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

      {!isError &&
        !group &&
        Array(3)
          .fill(0)
          .map((_, i) => (
            <Card.Root key={i} width="100%">
              <Card.Body>
                <Flex alignItems="center" justifyContent="space-between">
                  <VStack alignItems="flex-start" gap="0.5em">
                    <HStack>
                      <SkeletonCircle size="1.1em" />{" "}
                      <Skeleton height="1.1em" width="10em" />
                    </HStack>

                    <Skeleton height="0.8em" width="8em" />
                    <Skeleton height="0.8em" width="14em" />
                  </VStack>
                  <Skeleton height="0.8em" width="3em" />
                </Flex>
              </Card.Body>
            </Card.Root>
          ))}
    </VStack>
  );
};
