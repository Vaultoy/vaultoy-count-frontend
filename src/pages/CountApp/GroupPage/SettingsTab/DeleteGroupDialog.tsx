import { deleteGroupMutation } from "@/api/group";
import { useMutationApi } from "@/api/useMutationApi";
import { toaster } from "@/components/ui/toast-store";
import { GroupContext } from "@/contexts/GroupContext";
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
import { useNavigate } from "react-router";

export const DeleteGroupDialog = () => {
  const { group, selfMember } = useContext(GroupContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const mutation = useMutationApi({
    mutationFn: deleteGroupMutation,
    onSuccess: () => {
      setOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id],
      });

      toaster.create({
        title: "Group successfully deleted",
        type: "success",
      });

      navigate("/app");
    },
  });

  return (
    <>
      {selfMember?.rights !== "admin" && (
        <Text color="gray.500">Only group admins can delete the group.</Text>
      )}

      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Dialog.Trigger asChild>
          <Button
            colorPalette="red"
            variant="outline"
            disabled={selfMember?.rights !== "admin"}
          >
            <FaRegTrashAlt /> Delete this group
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Heading>Delete this group</Heading>
              </Dialog.Header>
              <Dialog.Body>
                <Text>
                  Are you sure you want to <strong>delete</strong> the following
                  group?
                </Text>
                <Heading
                  size="md"
                  marginTop="1em"
                  marginBottom="1em"
                  textAlign="center"
                >
                  {group?.name}
                </Heading>
                <Text>
                  This action <strong>cannot be undone</strong>.{" "}
                  <strong>All group data will be permanently deleted</strong>,
                  including all transactions and members.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  variant="solid"
                  disabled={selfMember?.rights !== "admin"}
                  loading={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      groupId: group!.id,
                    })
                  }
                >
                  <FaRegTrashAlt /> Delete this group
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
