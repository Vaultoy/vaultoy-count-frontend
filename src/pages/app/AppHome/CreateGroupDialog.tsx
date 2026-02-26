import { toaster } from "../../../components/ui/toast-store";
import { createGroupMutation } from "../../../api/group";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Text,
  Portal,
  HStack,
  VStack,
  Center,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { FaPlus, FaRegTrashAlt } from "react-icons/fa";
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
import { checkResponseError } from "@/utils/checkResponseError";
import { checkResponseJson } from "@/utils/checkResponseJson";

const formValuesSchema = z.object({
  name: z.string().min(3).max(100),
  selfMemberNickname: z.string().min(3).max(100),
  memberNicknames: z.array(z.string().min(3).max(100)),
});

export const CreateGroupDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const user = useContext(UserContext);

  const {
    register,
    handleSubmit,
    control,

    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "memberNicknames" as never,
  });

  const mutation = useMutation({
    mutationFn: createGroupMutation,
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
    if (!user || !user.user?.userEncryptionKey) {
      toaster.create(UNKNOWN_ERROR_TOAST);
      return;
    }

    const groupEncryptionKeyRaw = crypto.getRandomValues(new Uint8Array(32));

    const encryptedGroupEncryptionKey = await encryptEncryptionKey(
      groupEncryptionKeyRaw,
      user.user.userEncryptionKey,
      "group key for new group",
    );

    const groupEncryptionKey = await decryptEncryptionKey(
      encryptedGroupEncryptionKey,
      user.user.userEncryptionKey,
      false,
      "group key for new group",
    );

    mutation.mutate({
      name: await encryptString(data.name, groupEncryptionKey, "group name"),
      encryptedGroupEncryptionKey,
      selfMemberNickname: await encryptString(
        data.selfMemberNickname,
        groupEncryptionKey,
        "self member nickname for new group",
      ),
      memberNicknames: await Promise.all(
        data.memberNicknames.map((nickname, index) =>
          encryptString(
            nickname,
            groupEncryptionKey,
            `member nickname ${index} for new group`,
          ),
        ),
      ),
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

                <Field.Root
                  invalid={!!errors.selfMemberNickname}
                  marginTop="1em"
                >
                  <Field.Label>Your nickname in this group</Field.Label>
                  <Input {...register("selfMemberNickname")} />
                  <Field.ErrorText>
                    {errors.selfMemberNickname?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Text marginTop="1em" marginBottom="0.5em">
                  Other members' nicknames
                </Text>
                <Field.Root invalid={!!errors.memberNicknames} width="100%">
                  <VStack
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                  >
                    {fields.map((fieldItem, index) => (
                      <Field.Root
                        key={fieldItem.id}
                        marginBottom="0.5em"
                        invalid={!!errors.memberNicknames?.[index]}
                      >
                        <HStack gap="0.5em" alignItems="stretch" width="100%">
                          <Input
                            width="100%"
                            {...register(`memberNicknames.${index}`)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            padding="0"
                            color={"red.600"}
                            onClick={() => remove(index)}
                          >
                            <FaRegTrashAlt />
                          </Button>
                        </HStack>
                        <Field.ErrorText>
                          {errors.memberNicknames?.[index]?.message}
                        </Field.ErrorText>
                      </Field.Root>
                    ))}
                  </VStack>

                  <Field.ErrorText>
                    {errors.memberNicknames?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Center>
                  <Button
                    marginTop="1em"
                    variant="outline"
                    onClick={() => {
                      append("");
                    }}
                  >
                    <FaPlus /> Add an other member
                  </Button>
                </Center>
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
