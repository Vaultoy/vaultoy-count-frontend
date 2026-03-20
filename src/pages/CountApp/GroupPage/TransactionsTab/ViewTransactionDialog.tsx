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
  Button,
} from "@chakra-ui/react";
import { useContext, useMemo, useState } from "react";
import {
  floatCentsToString,
  getForText,
  getPaidByText,
  getTransactionEmoji,
} from "@/utils/textGeneration";
import { GroupContext } from "@/contexts/GroupContext";
import { FaArrowDownLong, FaArrowUpLong } from "react-icons/fa6";
import { AddEditTransactionDialog } from "./AddEditTransactionDialog";
import { LuPencilLine } from "react-icons/lu";
import { displayAmount } from "@/utils/currency";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";
import { TbFaceIdError } from "react-icons/tb";

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

    if (!transaction || !transaction.isOk || !groupMembersIndex) {
      return {
        transaction: transaction,
        fromMember: null,
        toMembers: [],
        totalShares: 0,
        fancyDate: "",
        defaultValuesForEdit: undefined,
      };
    }

    return {
      transaction,
      fromMember: groupMembersIndex[transaction.fromMemberId],
      toMembers: transaction.toMembers.map((toMember) => ({
        ...toMember,
        ...groupMembersIndex[toMember.memberId],
      })),
      totalShares: transaction.toMembers.reduce(
        (sum, toMember) => sum + toMember.share,
        0,
      ),
      fancyDate:
        new Date(transaction.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }) +
        " at " +
        new Date(transaction.date).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
        }),
      defaultValuesForEdit: {
        name: transaction.name,
        fromMemberId: [transaction.fromMemberId.toString()],
        toMembers: transaction.toMembers.map((toMember) => ({
          memberId: toMember.memberId.toString(),
          share: toMember.share,
        })),
        amount: floatCentsToString(Math.abs(transaction.amount)),
        transactionType: transaction.transactionType,
      },
    };
  }, [group, groupMembersIndex, transactionId]);

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
                {transaction && transaction.isOk ? (
                  <>
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
                        <Text fontWeight="bold">
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
                          transaction.amount > 0
                            ? FaArrowDownLong
                            : FaArrowUpLong
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
                        marginBottom={
                          transaction.amount > 0 ? "0.5em" : "-0.5em"
                        }
                      >
                        {displayAmount(
                          Math.abs(transaction.amount),
                          group?.currencyInfo,
                        )}
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
                            <Text fontWeight="bold">
                              {getForText(
                                transaction.transactionType,
                                toMembers.length,
                              )}
                            </Text>

                            {transaction.transactionType !== REPAYMENT && (
                              <Text fontWeight="bold">Shares</Text>
                            )}
                          </HStack>

                          {toMembers.map((toMember) => (
                            <Card.Root key={toMember.memberId} width="100%">
                              <Card.Body padding="0.5em 1em">
                                <HStack
                                  justifyContent="space-between"
                                  width="100%"
                                >
                                  <Text>
                                    {toMember.nickname ?? "[Unknown]"}
                                  </Text>
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
                                      {displayAmount(
                                        totalShares === 0
                                          ? 0
                                          : (toMember.share / totalShares) *
                                              Math.abs(transaction.amount),
                                        group?.currencyInfo,
                                      )}
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
                          <Text fontWeight="bold">
                            {getForText(
                              transaction.transactionType,
                              toMembers.length,
                            )}
                          </Text>
                          <Text>{toMembers?.[0]?.nickname ?? "[Unknown]"}</Text>
                        </Card.Body>
                      </Card.Root>
                    )}{" "}
                  </>
                ) : (
                  <>
                    <Icon
                      as={TbFaceIdError}
                      height="4em"
                      width="4em"
                      color="gray.500"
                    />
                    <Text color="gray.600" textAlign="center">
                      {!transaction ? (
                        <>Transaction not found. It might have been deleted.</>
                      ) : !transaction.isOk ? (
                        <>
                          Failed to decrypt this transaction. Please contact the
                          support for help.
                        </>
                      ) : (
                        ""
                      )}
                    </Text>
                  </>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer justifyContent="space-between">
              <DeleteTransactionDialog transactionId={transaction?.id ?? -1} />
              <AddEditTransactionDialog
                editTransactionId={transaction?.id ?? -1}
                defaultValues={defaultValuesForEdit}
              >
                <Button
                  variant="outline"
                  disabled={!group || !transaction || !transaction.isOk}
                >
                  <LuPencilLine /> Edit
                </Button>
              </AddEditTransactionDialog>
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
