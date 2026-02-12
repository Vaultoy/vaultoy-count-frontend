import { CURRENCY_SYMBOL, floatCentsToString } from "@/utils/textGeneration";
import { VStack, Card, Text, HStack } from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa6";

export const EquilibriumRepayment = ({
  fromUsername,
  toUsername,
  amount,
}: {
  fromUsername: string;
  toUsername: string;
  amount: number;
}) => {
  return (
    <Card.Root width="100%">
      <Card.Body padding="0.4em 1em 0.4em 1em">
        <HStack justifyContent="space-between">
          <Text>{fromUsername}</Text>
          <VStack gap="0" margin="1.3em">
            <FaArrowRight size="1.5em" />
            <Text fontSize="0.9em" color="gray.500" height="0">
              {floatCentsToString(amount)} {CURRENCY_SYMBOL}
            </Text>
          </VStack>
          <Text>{toUsername}</Text>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};
