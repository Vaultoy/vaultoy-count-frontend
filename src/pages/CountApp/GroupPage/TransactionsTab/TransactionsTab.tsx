import {
  Text,
  Card,
  VStack,
  Flex,
  Skeleton,
  SkeletonCircle,
  HStack,
  Center,
  Button,
  Icon,
  Heading,
} from "@chakra-ui/react";
import { AddEditTransactionDialog } from "./AddEditTransactionDialog";
import {
  getForText,
  getPaidByText,
  getTransactionEmoji,
} from "@/utils/textGeneration";
import { GroupContext } from "@/contexts/GroupContext";
import { useContext } from "react";
import { ViewTransactionDialog } from "./ViewTransactionDialog";
import { FaPlus } from "react-icons/fa";
import { displayAmount } from "@/utils/currency";
import { TbFaceIdError } from "react-icons/tb";

export const TransactionsTab = () => {
  const { group, groupMembersIndex, groupError } = useContext(GroupContext);

  return (
    <VStack gap={{ base: "0.5em", md: "1em" }}>
      <Center marginBottom="1.5em">
        <AddEditTransactionDialog>
          <Button variant="outline" disabled={!group}>
            <FaPlus /> Add a transaction
          </Button>
        </AddEditTransactionDialog>
      </Center>

      {group?.transactions.length === 0 && <Text>🙅 No transactions yet.</Text>}

      {group?.transactions.map((transaction) => {
        return (
          <ViewTransactionDialog
            key={transaction.id}
            transactionId={transaction.id}
          >
            <Card.Root key={transaction.id} width="100%" cursor="pointer">
              <Card.Body>
                {transaction.isOk ? (
                  <Flex alignItems="center" justifyContent="space-between">
                    <VStack alignItems="flex-start" gap="0">
                      <Text fontWeight="bold">
                        {getTransactionEmoji(transaction.transactionType)}{" "}
                        {transaction.name}
                      </Text>
                      <Text color="gray.500">
                        <Text as="span" fontWeight="bold">
                          {getPaidByText(transaction.transactionType)}
                        </Text>{" "}
                        {(groupMembersIndex &&
                          groupMembersIndex[transaction.fromMemberId]
                            ?.nickname) ??
                          "[Unknown]"}
                      </Text>
                      <Text color="gray.500">
                        <Text as="span" fontWeight="bold">
                          {getForText(
                            transaction.transactionType,
                            transaction.toMembers.length,
                          )}
                        </Text>{" "}
                        {transaction.toMembers
                          .map(
                            ({ memberId }) =>
                              (groupMembersIndex &&
                                groupMembersIndex[memberId]?.nickname) ??
                              "[Unknown]",
                          )
                          .join(", ")}
                      </Text>
                    </VStack>
                    <Text fontSize="lg" fontWeight="bold">
                      {displayAmount(
                        Math.abs(transaction.amount),
                        group?.currencyInfo,
                      )}
                    </Text>
                  </Flex>
                ) : (
                  <VStack width="100%" alignItems="start">
                    <HStack width="100%">
                      <Icon
                        as={TbFaceIdError}
                        height="2em"
                        width="2em"
                        color="gray.500"
                      />
                      <Heading size="md" color="gray.400">
                        Failed to decrypt this transaction
                      </Heading>
                    </HStack>
                    <Text fontSize="sm" color="gray.400">
                      Please contact the support for help.
                    </Text>
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>
          </ViewTransactionDialog>
        );
      })}

      {!group &&
        !groupError &&
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
