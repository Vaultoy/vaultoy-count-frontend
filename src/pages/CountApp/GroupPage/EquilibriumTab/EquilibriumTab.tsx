import { Text, Card, VStack, HStack, Skeleton } from "@chakra-ui/react";
import { CURRENCY_SYMBOL, floatCentsToString } from "@/utils/textGeneration";
import { useContext, useMemo } from "react";
import { EquilibriumRepaymentsDialog } from "./EquilibriumRepaymentsDialog";
import { GroupContext } from "@/contexts/GroupContext";

export const EquilibriumTab = () => {
  const { group, groupError } = useContext(GroupContext);

  const numberOfNonZeroBalances = useMemo(() => {
    if (!group) return 0;

    const numberOfNonZeroBalances = group.members.reduce(
      (count, member) => count + (member.balance !== 0 ? 1 : 0),
      0,
    );

    if (numberOfNonZeroBalances === 1) {
      const memberWithNonZeroBalance = group?.members.find(
        (member) => member.balance !== 0,
      );

      console.warn(
        `Only one member has a non-zero balance. This is expected due to rounding issues. His balance is displayed as zero.\nMember: ${memberWithNonZeroBalance?.nickname}\nBalance: ${floatCentsToString(memberWithNonZeroBalance?.balance || 0)}`,
      );
    }

    return numberOfNonZeroBalances;
  }, [group]);

  return (
    <VStack>
      <EquilibriumRepaymentsDialog />

      {group?.members.map((member) => {
        const displayedBalance =
          numberOfNonZeroBalances !== 1 ? member.balance : 0;

        return (
          <Card.Root key={member.memberId} width="100%">
            <Card.Body padding="0">
              <HStack
                justifyContent="space-between"
                alignItems="center"
                margin="1em"
              >
                <Text>{member.nickname}</Text>

                <Text
                  color={
                    displayedBalance > 0
                      ? "green.600"
                      : displayedBalance == 0
                        ? "gray.400"
                        : "red.600"
                  }
                  fontWeight="bold"
                >
                  {floatCentsToString(displayedBalance)}&nbsp;{CURRENCY_SYMBOL}
                </Text>
              </HStack>
            </Card.Body>
          </Card.Root>
        );
      })}

      {!group &&
        !groupError &&
        Array(3)
          .fill(0)
          .map((_, i) => (
            <Card.Root key={i} width="100%">
              <Card.Body padding="0">
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  margin="1em"
                >
                  <Skeleton height="1.1em" width="10em" />

                  <Skeleton height="1.1em" width="3em" />
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}
    </VStack>
  );
};
