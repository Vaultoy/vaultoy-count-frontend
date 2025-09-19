import { toaster } from "../../components/ui/toaster";
import { createGroupMutation, getGroupsQuery } from "../../api/group";
import {
  Button,
  Card,
  CloseButton,
  Dialog,
  Field,
  Flex,
  Heading,
  Input,
  Portal,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaAnglesRight } from "react-icons/fa6";
import { NavLink } from "react-router";
import {
  decryptGroupEncryptionKey,
  decryptString,
  encryptGroupEncryptionKey,
  encryptString,
} from "@/utils/encryption";
import { UserContext } from "@/contexts/UserContext";
import { UNKNOWN_ERROR_TOAST } from "@/components/toastMessages";

const formValuesSchema = z.object({
  name: z.string().min(3).max(100),
});

export const AppHomePage = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const user = useContext(UserContext);

  const { data } = useQuery({
    queryKey: ["getGroupsAll"],
    queryFn: getGroupsQuery,
  });

  const [decryptedGroups, setDecryptedGroups] = useState<
    { id: number; name: string; encryptionKey: CryptoKey }[]
  >([]);

  useEffect(() => {
    const decryptGroups = async () => {
      if (!user || !user.user || !data || !data.groups) return;

      const groups = await Promise.all(
        data.groups.map(async (group) => {
          const groupEncryptionKey = await decryptGroupEncryptionKey(
            group.groupEncryptionKey,
            user.user?.encryptionKey as CryptoKey
          );

          return {
            id: group.id,
            name: await decryptString(group.name, groupEncryptionKey),
            encryptionKey: groupEncryptionKey,
          };
        })
      );

      if (!active) return;
      setDecryptedGroups(groups);
    };

    let active = true;
    decryptGroups();
    return () => {
      active = false;
    };
  }, [user, data]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    any,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const mutation = useMutation({
    mutationFn: createGroupMutation,
    onSuccess: async (data) => {
      if (data.status !== 200) {
        toaster.create({
          title: "An unknown error occurred",
          description: `Try to refresh your page or try again later. Status: ${data.status}.`,
          type: "error",
        });

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

      toaster.create({
        title: "An unknown error occurred",
        description: `Try to refresh your page or try again later.`,
        type: "error",
      });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!user || !user.user?.encryptionKey) {
      toaster.create(UNKNOWN_ERROR_TOAST);
      return;
    }

    const groupEncryptionKeyRaw = crypto.getRandomValues(new Uint8Array(32));

    const encryptedGroupEncryptionKey = await encryptGroupEncryptionKey(
      groupEncryptionKeyRaw,
      user.user.encryptionKey
    );

    const groupEncryptionKey = await decryptGroupEncryptionKey(
      encryptedGroupEncryptionKey,
      user.user.encryptionKey
    );

    mutation.mutate({
      name: await encryptString(data.name, groupEncryptionKey),
      encryptedGroupEncryptionKey,
    });
  });

  return (
    <VStack marginTop="4em">
      <Heading fontSize="3xl" marginBottom="1em">
        Your groups
      </Heading>
      {decryptedGroups.map((group) => (
        <NavLink to={`/app/group/${group.id}`} key={group.id}>
          <Card.Root width="40em">
            <Card.Body>
              <Flex alignItems="center" justifyContent="space-between">
                <Heading>{group.name}</Heading>
                <FaAnglesRight size="1.6em" />
              </Flex>
            </Card.Body>
          </Card.Root>
        </NavLink>
      ))}
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
    </VStack>
  );
};
