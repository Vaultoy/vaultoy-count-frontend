import { deleteTransactionMutation } from "@/api/group";
import { useMutationApi } from "@/api/useMutationApi";
import { toaster } from "@/components/ui/toast-store";
import { GroupContext } from "@/contexts/GroupContext";
import { getTransactionEmoji } from "@/utils/textGeneration";
import {
  Button,
  CloseButton,
  Dialog,
  Heading,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";

export const DeleteTransactionDialog = ({
  transactionId,
}: {
  transactionId: number;
}) => {
  const { group } = useContext(GroupContext);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const mutation = useMutationApi({
    mutationFn: deleteTransactionMutation,
    onSuccess: () => {
      setOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id],
      });

      toaster.create({
        title: "Transaction successfully deleted",
        type: "success",
      });
    },
  });

  const transaction = group?.transactions.find((t) => t.id === transactionId);

  if (!transaction) {
    return null;
  }

  const transactionEmoji = transaction.isOk
    ? getTransactionEmoji(transaction.transactionType)
    : "";

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button colorPalette="red" variant="outline">
          <FaRegTrashAlt /> Delete
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Heading>Delete transaction</Heading>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                Are you sure you want to <strong>delete</strong> the following
                transaction?
              </Text>
              <Heading
                size="md"
                marginTop="1em"
                marginBottom="1em"
                textAlign="center"
              >
                {transactionEmoji}{" "}
                {transaction.isOk
                  ? transaction.name
                  : `Transaction #${transaction.id} that cannot be decrypted`}
              </Heading>
              <Text>
                This action <strong>cannot be undone</strong>.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette="red"
                variant="solid"
                loading={mutation.isPending}
                onClick={() =>
                  mutation.mutate({
                    groupId: group!.id,
                    transactionId: transaction.id,
                  })
                }
              >
                <FaRegTrashAlt /> Delete
              </Button>
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
