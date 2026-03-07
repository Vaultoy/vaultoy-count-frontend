import {
  deleteGroupMemberMutation,
  patchEditGroupMemberNicknameMutation,
  patchMemberRightsMutation,
  postKickGroupMemberMutation,
} from "@/api/group";
import { InfoPopover } from "@/components/InfoPopover";
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
  Text,
  Card,
  Icon,
  VStack,
  Editable,
  Field,
  HStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useContext, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaUser } from "react-icons/fa";
import { LuCheck, LuCrown, LuPencilLine, LuX } from "react-icons/lu";
import { MdOutlineEdit } from "react-icons/md";
import { useNavigate } from "react-router";
import z from "zod";

const formValuesSchema = z.object({
  nickname: z.string().min(3).max(100),
});

export const EditMemberDialog = ({ memberId }: { memberId: number }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { group, selfMember } = useContext(GroupContext);
  const member = group?.members.find((mbr) => mbr.memberId == memberId);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
    defaultValues: {
      nickname: member?.nickname ?? "",
    },
  });

  const editNicknameMutation = useMutation({
    mutationFn: patchEditGroupMemberNicknameMutation,
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
        title: "Nickname edited successfully",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id.toString()],
      });
    },
    onError: (error) => {
      console.error("Editing nickname failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const editRightsMutation = useMutation({
    mutationFn: patchMemberRightsMutation,
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
        title: "Member rights edited successfully",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id.toString()],
      });
    },
    onError: (error) => {
      console.error("Editing member rights failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const kickMemberMutation = useMutation({
    mutationFn: postKickGroupMemberMutation,
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
        title:
          memberId === selfMember?.memberId
            ? "You successfully left the group"
            : "User kicked out successfully",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id.toString()],
      });

      if (memberId === selfMember?.memberId) {
        setOpen(false);
        navigate("/app");
      }
    },
    onError: (error) => {
      console.error("Kicking member failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: deleteGroupMemberMutation,
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
        title: "Member removed successfully",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id.toString()],
      });

      setOpen(false);
    },
    onError: (error) => {
      console.error("Removing member failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const submitNickname = () => {
    handleSubmit(async (data) => {
      if (!group) return;

      editNicknameMutation.mutate({
        groupId: group!.id,
        memberId,
        newNickname: await encryptString(
          data.nickname,
          group!.groupEncryptionKey,
          "new nickname",
        ),
      });
    })();
  };

  const memberAppearsInATransaction = useMemo(() => {
    return group?.transactions.some(
      (transaction) =>
        transaction.fromMemberId === memberId ||
        transaction.toMembers.some(
          (toMember) => toMember.memberId === memberId,
        ),
    );
  }, [group, memberId]);

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild marginTop="1em">
        <Center>
          <Button variant="outline" size="sm">
            <MdOutlineEdit />
            Edit
          </Button>
        </Center>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit member</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap="1.5em">
                <Field.Root invalid={!!errors.nickname} width="100%">
                  <Field.Label>Member nickname</Field.Label>
                  <Controller
                    name="nickname"
                    control={control}
                    render={({ field }) => (
                      <Editable.Root
                        value={field.value}
                        onValueChange={(e) => field.onChange(e.value)}
                        onValueCommit={submitNickname}
                        selectOnFocus={false}
                        activationMode="click"
                        submitMode="none"
                        defaultEdit={false}
                        marginLeft="1em"
                      >
                        <Editable.Preview />
                        <Editable.Input />

                        <Editable.Control>
                          <Editable.EditTrigger asChild>
                            <Button variant="ghost" size="xs">
                              <LuPencilLine /> Edit
                            </Button>
                          </Editable.EditTrigger>
                          <Editable.SubmitTrigger asChild>
                            <Button
                              size="xs"
                              loading={editNicknameMutation.isPending}
                            >
                              <LuCheck /> Save
                            </Button>
                          </Editable.SubmitTrigger>
                          <Editable.CancelTrigger asChild>
                            <Button variant="outline" size="xs">
                              <LuX />
                            </Button>
                          </Editable.CancelTrigger>
                        </Editable.Control>
                      </Editable.Root>
                    )}
                  />

                  <Field.ErrorText>{errors.nickname?.message}</Field.ErrorText>
                </Field.Root>

                {member?.userId !== null ? (
                  <Field.Root width="100%" invalid={!!errors.nickname}>
                    <Field.Label>
                      Associated username{" "}
                      <InfoPopover>
                        <Text fontWeight="normal">
                          When joining the group, user "
                          <Icon
                            as={FaUser}
                            height="0.85em"
                            width="0.85em"
                          />{" "}
                          {member?.username}" has chosen the nickname "
                          {member?.nickname}".
                        </Text>
                      </InfoPopover>
                    </Field.Label>

                    <Text marginLeft="1em">
                      <Icon as={FaUser} size="xs" />{" "}
                      {member?.username ?? "Unknown"}
                    </Text>
                  </Field.Root>
                ) : (
                  <Text color="gray.600" textAlign="center">
                    No one joined the group with this nickname yet.{" "}
                    {selfMember?.rights == "admin"
                      ? "Send them a link to join the group!"
                      : "Ask an administrator to send them a link to join the group!"}
                  </Text>
                )}

                {member?.userId !== null && (
                  <Field.Root width="100%" invalid={!!errors.nickname}>
                    <Field.Label>Rights</Field.Label>

                    <HStack gap="2em">
                      <Text marginLeft="1em">
                        {member?.rights === "admin" ? (
                          <Icon as={LuCrown} size="xs" />
                        ) : (
                          <Icon as={FaUser} size="xs" />
                        )}{" "}
                        {member?.rights === "admin" ? "Admin" : "Member"}
                      </Text>
                      {selfMember?.rights === "admin" && (
                        <Button
                          variant="outline"
                          size="xs"
                          loading={editRightsMutation.isPending}
                          onClick={() => {
                            if (!group) return;
                            editRightsMutation.mutate({
                              groupId: group!.id,
                              memberId,
                              newRights:
                                member?.rights === "admin" ? "member" : "admin",
                            });
                          }}
                        >
                          {member?.rights === "admin" ? (
                            <>
                              Demote to{" "}
                              <Icon
                                as={FaUser}
                                height="0.85em"
                                width="0.85em"
                              />{" "}
                              member
                            </>
                          ) : (
                            <>
                              Promote to{" "}
                              <Icon
                                as={LuCrown}
                                height="0.85em"
                                width="0.85em"
                              />{" "}
                              admin
                            </>
                          )}
                        </Button>
                      )}
                    </HStack>
                  </Field.Root>
                )}

                {member?.userId && (
                  <Card.Root borderColor="red">
                    <Card.Body padding="1em">
                      {selfMember?.memberId !== memberId && (
                        <Text textAlign="center">
                          Kicking user "<Icon as={FaUser} size="xs" />{" "}
                          {member?.username}" out of the group will remove him
                          from this group, <strong>without deleting</strong> the
                          group member with nickname "{member?.nickname}". This
                          means that no data will be lost, only "
                          <Icon as={FaUser} size="xs" /> {member?.username}"
                          will loose access to the group.
                          <br />
                          If you gave an invitation link to "
                          <Icon as={FaUser} size="xs" /> {member?.username}",
                          you might want to delete the link before kicking him
                          out, or he will be able to come back.
                        </Text>
                      )}
                      {selfMember?.memberId === memberId && (
                        <Text textAlign="center">
                          By leaving the group, you will loose access to it.
                          However, it will <strong>not delete</strong> the group
                          member with nickname "{member?.nickname}". This means
                          that no data will be lost.
                        </Text>
                      )}
                      {selfMember?.rights !== "admin" &&
                        selfMember?.memberId !== memberId && (
                          <Text
                            color="red.700"
                            marginTop="1em"
                            textAlign="center"
                          >
                            Only group administrators can kick users out.
                          </Text>
                        )}
                      <Button
                        colorPalette="red"
                        variant="surface"
                        marginTop="1em"
                        disabled={
                          selfMember?.rights !== "admin" &&
                          selfMember?.memberId !== memberId
                        }
                        gap="0"
                        loading={kickMemberMutation.isPending}
                        onClick={() => {
                          if (!group) return;
                          kickMemberMutation.mutate({
                            groupId: group!.id,
                            memberId,
                          });
                        }}
                      >
                        {selfMember?.memberId !== memberId ? (
                          <>
                            Kick user "
                            <Icon
                              as={FaUser}
                              height="0.85em"
                              width="0.85em"
                              marginRight="0.3em"
                            />{" "}
                            {member?.username}" out of the group
                          </>
                        ) : (
                          "Leave this group"
                        )}
                      </Button>
                    </Card.Body>
                  </Card.Root>
                )}

                {selfMember?.memberId !== memberId && (
                  <Card.Root borderColor="red" marginTop="1em">
                    <Card.Body padding="1em">
                      <Text textAlign="center">
                        Deleteing group member "{member?.nickname}" will remove
                        this nickname from the list of members.
                      </Text>

                      {memberAppearsInATransaction && (
                        <Text
                          textAlign="center"
                          color="red.700"
                          marginTop="1em"
                        >
                          This member has taken part in a transaction, so he
                          cannot be deleted.
                        </Text>
                      )}

                      {!memberAppearsInATransaction &&
                        member?.userId !== null && (
                          <Text
                            textAlign="center"
                            color="red.700"
                            marginTop="1em"
                          >
                            User "
                            <Icon as={FaUser} size="xs" /> {member?.username}"
                            has already joined the group using this nickname. To
                            delete the member "{member?.nickname}", you must
                            first kick user "
                            <Icon as={FaUser} size="xs" /> {member?.username}"
                            out of this group with the button above.
                          </Text>
                        )}

                      <Button
                        colorPalette="red"
                        variant="surface"
                        marginTop="1em"
                        disabled={
                          memberAppearsInATransaction || member?.userId !== null
                        }
                        loading={deleteMemberMutation.isPending}
                        onClick={() => {
                          if (!group) return;
                          deleteMemberMutation.mutate({
                            groupId: group!.id,
                            memberId,
                          });
                        }}
                      >
                        Delete group member "{member?.nickname}"
                      </Button>
                    </Card.Body>
                  </Card.Root>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
