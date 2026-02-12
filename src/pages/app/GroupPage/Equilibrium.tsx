import { Text, Card, VStack, HStack } from "@chakra-ui/react";
import { CURRENCY_SYMBOL, floatCentsToString } from "@/utils/textGeneration";
import { useContext } from "react";
import { EquilibriumRepaymentsDialog } from "./EquilibriumRepaymentsDialog";
import { GroupContext } from "@/contexts/GroupContext";

export const Equilibrium = () => {
  const { group } = useContext(GroupContext);

  return (
    <VStack>
      <EquilibriumRepaymentsDialog />

      {group?.members.map((member) => (
        <Card.Root key={member.userId} width="100%">
          <Card.Body>
            <HStack justifyContent="space-between">
              <Text>{member.username}</Text>
              <Text
                color={
                  member.balance > 0
                    ? "green.600"
                    : member.balance == 0
                      ? "gray.400"
                      : "red.600"
                }
                fontWeight="bold"
              >
                {floatCentsToString(member.balance)} {CURRENCY_SYMBOL}
              </Text>
            </HStack>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
};
