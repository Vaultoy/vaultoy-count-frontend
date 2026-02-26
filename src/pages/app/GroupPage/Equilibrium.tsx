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
        <Card.Root key={member.memberId} width="100%">
          <Card.Body padding="0">
            <HStack
              justifyContent="space-between"
              alignItems="center"
              margin="1em"
            >
              <VStack
                alignItems="flex-start"
                gap="0"
                justifyContent="center"
                height="100%"
              >
                <Text>{member.nickname}</Text>
                <Text fontSize="0.9em" color="gray.400">
                  {member.username
                    ? `Username: ${member.username}`
                    : "Not connected"}
                </Text>
              </VStack>

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
