import { toaster } from "../../../components/ui/toast-store";
import { createGroupMutation } from "../../../api/group";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  decryptEncryptionKey,
  encryptEncryptionKey,
  encryptString,
} from "@/utils/encryption";
import { UserContext } from "@/contexts/UserContext";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";

const formValuesSchema = z.object({
  name: z.string().min(3).max(100),
});

export const CreateGroupDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const user = useContext(UserContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const mutation = useMutation({
    mutationFn: createGroupMutation,
    onSuccess: async (data) => {
      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));
        return;
      }

      toaster.create({
        title: "Group created successfully",
        type: "success",
      });

      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["getGroupsAll"] });
    },
    onError: (error) => {
      console.error("Login failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!user || !user.user?.encryptionKey) {
      toaster.create(UNKNOWN_ERROR_TOAST);
      return;
    }

    const groupEncryptionKeyRaw = crypto.getRandomValues(new Uint8Array(32));

    const encryptedGroupEncryptionKey = await encryptEncryptionKey(
      groupEncryptionKeyRaw,
      user.user.encryptionKey,
    );

    const groupEncryptionKey = await decryptEncryptionKey(
      encryptedGroupEncryptionKey,
      user.user.encryptionKey,
    );

    mutation.mutate({
      name: await encryptString(data.name, groupEncryptionKey),
      encryptedGroupEncryptionKey,
    });
  });

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild marginTop="1em">
        <Button variant="outline">
          <FaPlus /> Create Group
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create Group</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={onSubmit}>
              <Dialog.Body>
                <Field.Root invalid={!!errors.name}>
                  <Field.Label>Group name</Field.Label>
                  <Input {...register("name")} />
                  <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button type="submit">Create</Button>
              </Dialog.Footer>
            </form>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
