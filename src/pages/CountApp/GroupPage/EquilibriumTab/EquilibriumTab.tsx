import { Text, Card, VStack, HStack, Skeleton } from "@chakra-ui/react";
import { floatCentsToString } from "@/utils/textGeneration";
import { useContext, useMemo } from "react";
import { EquilibriumRepaymentsDialog } from "./EquilibriumRepaymentsDialog";
import { GroupContext } from "@/contexts/GroupContext";
import { displayAmount } from "@/utils/currency";

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
    <VStack gap={{ base: "0.5em", md: "1em" }}>
      <EquilibriumRepaymentsDialog />

      {group?.members.map((member) => {
        // Show zero if there is only one non-zero balance and that it
        // is inferior to 100 cents
        const displayedBalance =
          numberOfNonZeroBalances === 1 && Math.abs(member.balance) <= 100
            ? 0
            : member.balance;

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
                  {displayAmount(displayedBalance, group.currencyInfo)}
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
