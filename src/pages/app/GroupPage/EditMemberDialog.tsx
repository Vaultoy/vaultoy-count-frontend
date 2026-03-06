import { GroupContext } from "@/contexts/GroupContext";
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
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaUser } from "react-icons/fa";
import { LuCheck, LuPencilLine, LuX } from "react-icons/lu";
import { MdOutlineEdit } from "react-icons/md";
import z from "zod";

const formValuesSchema = z.object({
  nickname: z.string().min(3).max(100),
});

export const EditMemberDialog = ({ memberId }: { memberId: number }) => {
  const [open, setOpen] = useState(false);

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

  const submitNickname = () => {
    handleSubmit((data) => {
      console.log("Submitting form with data:", data);
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
              <VStack>
                <Field.Root invalid={!!errors.nickname} width="100%">
                  <Field.Label>Member Nickname</Field.Label>
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
                            <Button size="xs">
                              <LuCheck /> Save
                            </Button>
                          </Editable.SubmitTrigger>
                          <Editable.CancelTrigger asChild>
                            <Button variant="outline" size="xs">
                              <LuX /> Cancel
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
                    <Field.Label>Associated username</Field.Label>

                    <Text margin="0.5em 0 0.5em 1em">
                      <Icon as={FaUser} size="xs" />{" "}
                      {member?.username ?? "Unknown"}
                    </Text>

                    <Text color="gray.600" textAlign="center">
                      The associated username is the username of the account who
                      decided to join the group using this member nickname.
                    </Text>
                  </Field.Root>
                ) : (
                  <Text color="gray.600" marginTop="1em" textAlign="center">
                    No one joined the group with this nickname yet.{" "}
                    {selfMember?.rights == "admin"
                      ? "Send them a link to join the group!"
                      : "Ask an administrator to send them a link to join the group!"}
                  </Text>
                )}

                {member?.userId && (
                  <Card.Root borderColor="red">
                    <Card.Body padding="1em">
                      <Text textAlign="center">
                        Kicking user "<Icon as={FaUser} size="xs" />{" "}
                        {member?.username}" out of the group will remove him
                        from this group, <strong>without deleting</strong> the
                        group member with nickname "{member?.nickname}". This
                        means that no data will be deleted, only "
                        <Icon as={FaUser} size="xs" /> {member?.username}" will
                        loose access to the group. If you gave an invitation
                        link to "
                        <Icon as={FaUser} size="xs" /> {member?.username}", you
                        might want to delete the link before kicking him out, or
                        he will be able to come back.
                      </Text>
                      {selfMember?.rights !== "admin" && (
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
                        disabled={selfMember?.rights !== "admin"}
                        gap="0"
                      >
                        Kick user "
                        <Icon
                          as={FaUser}
                          height="0.85em"
                          width="0.85em"
                          marginRight="0.3em"
                        />{" "}
                        {member?.username}" out of the group
                      </Button>
                    </Card.Body>
                  </Card.Root>
                )}

                <Card.Root borderColor="red" marginTop="1em">
                  <Card.Body padding="1em">
                    <Text textAlign="center">
                      Deleteing group member "{member?.nickname}" will remove
                      this nickname from the list of members.
                    </Text>

                    {memberAppearsInATransaction && (
                      <Text textAlign="center" color="red.700" marginTop="1em">
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
                          <Icon as={FaUser} size="xs" /> {member?.username}" has
                          already joined the group using this nickname. To
                          delete the member "{member?.nickname}", you must first
                          kick user "
                          <Icon as={FaUser} size="xs" /> {member?.username}" out
                          of this group with the button above.
                        </Text>
                      )}

                    <Button
                      colorPalette="red"
                      variant="surface"
                      marginTop="1em"
                      disabled={
                        memberAppearsInATransaction || member?.userId !== null
                      }
                    >
                      Delete group member "{member?.nickname}"
                    </Button>
                  </Card.Body>
                </Card.Root>
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
