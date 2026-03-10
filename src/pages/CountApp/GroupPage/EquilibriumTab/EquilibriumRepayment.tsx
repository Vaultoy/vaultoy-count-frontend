import { CURRENCY_SYMBOL, floatCentsToString } from "@/utils/textGeneration";
import { VStack, Card, Text, HStack, Button, Icon } from "@chakra-ui/react";
import { FaRegEdit } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { AddEditTransactionDialog } from "../TransactionsTab/AddEditTransactionDialog";
import { useContext } from "react";
import { GroupContext } from "@/contexts/GroupContext";

export const EquilibriumRepayment = ({
  fromMemberId,
  toMemberId,
  amount,
}: {
  fromMemberId: number | undefined;
  toMemberId: number | undefined;
  amount: number;
}) => {
  const { groupMembersIndex } = useContext(GroupContext);

  const fromMember = fromMemberId
    ? groupMembersIndex?.[fromMemberId]
    : undefined;
  const toMember = toMemberId ? groupMembersIndex?.[toMemberId] : undefined;

  const addTransactionValues = {
    name: "",
    amount: floatCentsToString(amount),
    transactionType: "repayment" as const,
    fromMemberId: [fromMemberId?.toString() ?? ""],
    toMembers: [
      {
        memberId: toMemberId?.toString() ?? "",
        share: 1,
      },
    ],
  };

  return (
    <Card.Root width="100%">
      <Card.Body padding="0.4em 1em 0.4em 1em">
        <HStack justifyContent="space-between">
          <Text>{fromMember?.nickname}</Text>
          <VStack gap="0" margin="0.8em">
            <AddEditTransactionDialog defaultValues={addTransactionValues}>
              <Button
                variant="outline"
                colorPalette="green"
                size="xs"
                padding="0.2em 1em"
                marginBottom="0.3em"
                marginTop="0"
                height="1.7em"
              >
                Mark as Paid <Icon as={FaRegEdit} height="1em" width="1em" />
              </Button>
            </AddEditTransactionDialog>
            <FaArrowRight size="1.5em" />
            <Text fontSize="0.9em" color="gray.500" height="1.7em">
              {floatCentsToString(amount)}&nbsp;{CURRENCY_SYMBOL}
            </Text>
          </VStack>
          <Text>{toMember?.nickname}</Text>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};
