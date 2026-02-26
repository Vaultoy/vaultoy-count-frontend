import { EquilibriumRepayment } from "@/components/ui/EquilibriumRepayment";
import { GroupContext } from "@/contexts/GroupContext";
import { UserContext } from "@/contexts/UserContext";
import {
  Button,
  Dialog,
  Portal,
  CloseButton,
  Heading,
  VStack,
  Flex,
  Card,
  Text,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { FaAnglesRight } from "react-icons/fa6";

const getDialogButtonText = (
  userHasRepaymentsToMake: boolean | undefined,
  othersMustSendMeRepayments: boolean | undefined,
  othersHaveRepaymentsToMake: boolean | undefined,
): string => {
  if (
    userHasRepaymentsToMake === undefined ||
    othersMustSendMeRepayments === undefined ||
    othersHaveRepaymentsToMake === undefined
  ) {
    return "";
  }

  if (userHasRepaymentsToMake) {
    return "🤝 You have repayments to make!";
  }

  if (othersMustSendMeRepayments) {
    return "👋 You have no repayments to make, but others must repay you";
  }

  if (othersHaveRepaymentsToMake) {
    return "✅ You have no repayments to make, but others do";
  }

  return "✅ No repayments to make";
};

export const EquilibriumRepaymentsDialog = () => {
  const { user } = useContext(UserContext);
  const { group, groupMembersIndex, selfMember } = useContext(GroupContext);
  const selfRepayments = selfMember?.repaymentsToMake;

  const [open, setOpen] = useState(false);

  const othersRepayments = group
    ? group.members
        .filter((member) => member.userId !== user?.id)
        .flatMap((member) =>
          member.repaymentsToMake.map((repayment) => ({
            fromMemberId: member.memberId,
            toMemberId: repayment.toMemberId,
            amount: repayment.amount,
          })),
        )
    : undefined;

  const userHasRepaymentsToMake = selfRepayments && selfRepayments.length > 0;
  const othersMustSendMeRepayments =
    othersRepayments &&
    othersRepayments.some(
      (repayment) => repayment.toMemberId === user?.id && repayment.amount > 0,
    );
  const othersHaveRepaymentsToMake =
    othersRepayments && othersRepayments.length > 0;

  const dialogButtonText = getDialogButtonText(
    userHasRepaymentsToMake,
    othersMustSendMeRepayments,
    othersHaveRepaymentsToMake,
  );

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild marginTop="1em">
        <Card.Root width="100%" marginBottom="1em" cursor="pointer">
          <Card.Body>
            <Flex alignItems="center" justifyContent="space-between">
              <Heading size="lg">{dialogButtonText}</Heading>
              {(userHasRepaymentsToMake || othersHaveRepaymentsToMake) && (
                <FaAnglesRight size="1.6em" />
              )}
            </Flex>
          </Card.Body>
        </Card.Root>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Repayments</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Heading size="md" marginBottom="0.5em">
                Yours
              </Heading>
              {selfRepayments?.length === 0 && (
                <Text>✅ You have no repayments to make!</Text>
              )}
              <VStack alignItems="flex-start" marginBottom="1em">
                {selfRepayments?.map((repayment) => (
                  <EquilibriumRepayment
                    key={repayment.toMemberId}
                    fromNickname={selfMember?.nickname ?? "Unknown User"}
                    toNickname={
                      groupMembersIndex
                        ? groupMembersIndex[repayment.toMemberId]?.nickname ||
                          "Unknown User"
                        : "Unknown User"
                    }
                    amount={repayment.amount}
                  />
                ))}
              </VStack>
              <Heading size="md" marginBottom="0.5em">
                Others
              </Heading>
              {othersRepayments?.length === 0 && (
                <Text>✅ Others have no repayments to make!</Text>
              )}
              <VStack alignItems="flex-start" marginBottom="1em">
                {othersRepayments?.map((repayment) => (
                  <EquilibriumRepayment
                    key={repayment.toMemberId}
                    fromNickname={
                      groupMembersIndex
                        ? groupMembersIndex[repayment.fromMemberId]?.nickname ||
                          "Unknown User"
                        : "Unknown User"
                    }
                    toNickname={
                      groupMembersIndex
                        ? groupMembersIndex[repayment.toMemberId]?.nickname ||
                          "Unknown User"
                        : "Unknown User"
                    }
                    amount={repayment.amount}
                  />
                ))}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
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
