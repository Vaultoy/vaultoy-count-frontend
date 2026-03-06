import { postAddMemberMutation } from "@/api/group";
import {
  unknownErrorToastWithStatus,
  UNKNOWN_ERROR_TOAST,
} from "@/components/toastMessages";
import { toaster } from "@/components/ui/toast-store";
import { GroupContext } from "@/contexts/GroupContext";
import { encryptString } from "@/encryption/encryption";
import { checkResponseError } from "@/utils/checkResponseError";
import { checkResponseJson } from "@/utils/checkResponseJson";
import {
  Button,
  Center,
  Dialog,
  Portal,
  CloseButton,
  Field,
  Input,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import z from "zod";

const formValuesSchema = z.object({
  nickname: z.string().min(3).max(100),
});

export const AddMemberDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { group } = useContext(GroupContext);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const addMemberMutation = useMutation({
    mutationFn: postAddMemberMutation,
    onSuccess: async (data) => {
      const responseData = await checkResponseJson(data);
      if (await checkResponseError(data.status, responseData)) {
        return;
      }

      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));
        return;
      }

      toaster.create({
        title: "Member added successfully",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id.toString()],
      });

      reset();

      setOpen(false);
    },
    onError: (error) => {
      console.error("Adding member failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!group) return;

    addMemberMutation.mutate({
      groupId: group!.id,
      nickname: await encryptString(
        data.nickname,
        group!.groupEncryptionKey,
        "nickname",
      ),
    });
  });

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild marginTop="0.5em">
        <Center>
          <Button>
            <FaPlus />
            Add a member
          </Button>
        </Center>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Add a member</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={onSubmit}>
              <Dialog.Body>
                <Field.Root invalid={!!errors.nickname} width="100%">
                  <Field.Label>Member's nickname</Field.Label>
                  <Input {...register("nickname")} />
                  <Field.ErrorText>{errors.nickname?.message}</Field.ErrorText>
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button type="submit" loading={addMemberMutation.isPending}>
                  Add member
                </Button>
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
