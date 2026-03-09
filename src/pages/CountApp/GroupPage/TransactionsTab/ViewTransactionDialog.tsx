import { REPAYMENT } from "@/api/group";
import {
  VStack,
  Dialog,
  Portal,
  CloseButton,
  HStack,
  Text,
  Card,
  Icon,
  Box,
  Heading,
} from "@chakra-ui/react";
import { useContext, useMemo, useState } from "react";
import {
  CURRENCY_SYMBOL,
  floatCentsToString,
  getForText,
  getPaidByText,
  getTransactionEmoji,
} from "@/utils/textGeneration";
import { GroupContext } from "@/contexts/GroupContext";
import { FaArrowDownLong, FaArrowUpLong } from "react-icons/fa6";
import { AddEditTransactionDialog } from "./AddEditTransactionDialog";

export const ViewTransactionDialog = ({
  transactionId,
  children,
}: {
  transactionId: number;
  children: React.ReactNode;
}) => {
  const { group, groupMembersIndex } = useContext(GroupContext);

  const [open, setOpen] = useState(false);

  const {
    transaction,
    fromMember,
    toMembers,
    totalShares,
    fancyDate,
    defaultValuesForEdit,
  } = useMemo(() => {
    const transaction = group?.transactions.find((t) => t.id === transactionId);

    return {
      transaction,
      fromMember:
        transaction && groupMembersIndex
          ? groupMembersIndex[transaction.fromMemberId]
          : null,
      toMembers:
        transaction && groupMembersIndex
          ? transaction.toMembers.map((toMember) => ({
              ...toMember,
              ...groupMembersIndex![toMember.memberId],
            }))
          : [],
      totalShares: transaction
        ? transaction.toMembers.reduce(
            (sum, toMember) => sum + toMember.share,
            0,
          )
        : 0,
      fancyDate: transaction
        ? new Date(transaction.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }) +
          " at " +
          new Date(transaction.date).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
          })
        : "",
      defaultValuesForEdit: transaction
        ? {
            name: transaction.name,
            fromMemberId: [transaction.fromMemberId.toString()],
            toMembers: transaction.toMembers.map((toMember) => ({
              memberId: toMember.memberId.toString(),
              share: toMember.share,
            })),
            amount: floatCentsToString(Math.abs(transaction.amount)),
            transactionType: transaction.transactionType,
          }
        : undefined,
    };
  }, [group, groupMembersIndex, transactionId]);

  if (!transaction) return <Text>Transaction not found</Text>;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header />
            <Dialog.Body>
              <VStack width="100%">
                <Heading>
                  {getTransactionEmoji(transaction.transactionType)}{" "}
                  {transaction.name}
                </Heading>
                <Text color="gray.500" marginBottom="2em">
                  {fancyDate}
                </Text>

                <Card.Root>
                  <Card.Body
                    padding="1em 2em 1em 2em"
                    gap="0.5em"
                    alignItems="center"
                  >
                    <Text fontWeight="medium">
                      {getPaidByText(transaction.transactionType)}
                    </Text>
                    <Text>{fromMember?.nickname}</Text>
                  </Card.Body>
                </Card.Root>

                <Box
                  position="relative"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon
                    as={
                      transaction.amount > 0 ? FaArrowDownLong : FaArrowUpLong
                    }
                    height="5em"
                    width="5em"
                    color="gray.200"
                  />
                  <Text
                    position="absolute"
                    fontWeight="bold"
                    fontSize="lg"
                    color="gray.800"
                    marginBottom={transaction.amount > 0 ? "0.5em" : "-0.5em"}
                  >
                    {floatCentsToString(Math.abs(transaction.amount))}&nbsp;
                    {CURRENCY_SYMBOL}
                  </Text>
                </Box>

                {toMembers.length > 1 && (
                  <Card.Root width="100%">
                    <Card.Body padding="1em" gap="0.5em">
                      <HStack
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                        paddingLeft="1em"
                        paddingRight="1em"
                      >
                        <Text fontWeight="medium">
                          {getForText(
                            transaction.transactionType,
                            toMembers.length,
                          )}
                        </Text>

                        {transaction.transactionType !== REPAYMENT && (
                          <Text fontWeight="medium">Shares</Text>
                        )}
                      </HStack>

                      {toMembers.map((toMember) => (
                        <Card.Root key={toMember.memberId} width="100%">
                          <Card.Body padding="0.5em 1em">
                            <HStack justifyContent="space-between" width="100%">
                              <Text>{toMember.nickname}</Text>
                              <VStack
                                gap="0"
                                marginRight="0.5em"
                                alignItems="flex-end"
                              >
                                <Text fontSize="sm" marginBottom="-0.2em">
                                  {toMember.share}x
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color="gray.500"
                                  marginTop="-0.2em"
                                >
                                  {floatCentsToString(
                                    totalShares === 0
                                      ? 0
                                      : (toMember.share / totalShares) *
                                          Math.abs(transaction.amount),
                                  )}
                                  &nbsp;
                                  {CURRENCY_SYMBOL}
                                </Text>
                              </VStack>
                            </HStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </Card.Body>
                  </Card.Root>
                )}

                {toMembers.length === 1 && (
                  <Card.Root>
                    <Card.Body
                      padding="1em 2em 1em 2em"
                      gap="0.5em"
                      alignItems="center"
                    >
                      <Text fontWeight="medium">
                        {getForText(
                          transaction.transactionType,
                          toMembers.length,
                        )}
                      </Text>
                      <Text>{toMembers?.[0]?.nickname}</Text>
                    </Card.Body>
                  </Card.Root>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <AddEditTransactionDialog
                editTransactionId={transaction.id}
                defaultValues={defaultValuesForEdit}
              />
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
