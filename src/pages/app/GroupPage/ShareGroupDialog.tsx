import {
  createInvitationMutation,
  getInvitationQuery,
  type GroupExtended,
} from "@/api/group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Center,
  Dialog,
  Portal,
  CloseButton,
  Text,
  Card,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useContext, useEffect, useState } from "react";
import { decryptEncryptionKey, encryptEncryptionKey } from "@/utils/encryption";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import { FaShareNodes } from "react-icons/fa6";
import {
  cryptoKeyToString,
  deriveVerificationTokenFromLinkSecret,
} from "@/utils/keyDerivation";
import { UserContext } from "@/contexts/UserContext";

const urlFromInvitationLinkSecret = (
  groupId: string,
  invitationLinkSecret: string
) => {
  const url = new URL(
    window.location.origin +
      "/join/" +
      groupId +
      "/" +
      encodeURIComponent(invitationLinkSecret)
  );
  return url.toString();
};

export const ShareGroupDialog = ({
  groupData,
}: {
  groupData: GroupExtended<false> | undefined;
}) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();

  const { data: existingInvitation, isLoading: isLoadingExistingInvitation } =
    useQuery({
      queryKey: ["getInvitation", groupData?.id],
      queryFn: () =>
        groupData?.id && !isNaN(Number(groupData?.id))
          ? getInvitationQuery(groupData?.id.toString())
          : Promise.resolve(null),
    });

  useEffect(() => {
    const existingInvitationDecrypt = async () => {
      if (!existingInvitation?.invitationLinkSecret || !groupData) {
        return;
      }

      console.log(existingInvitation.invitationLinkSecret);

      const invitationLinkSecretKey = await decryptEncryptionKey(
        existingInvitation?.invitationLinkSecret,
        groupData.groupEncryptionKey
      );

      const invitationLinkSecret = await cryptoKeyToString(
        invitationLinkSecretKey
      );

      const url = urlFromInvitationLinkSecret(
        groupData.id.toString(),
        invitationLinkSecret
      );

      setUrl(url);
    };

    existingInvitationDecrypt();
  }, [existingInvitation, groupData]);

  const mutation = useMutation({
    mutationFn: createInvitationMutation,
    onSuccess: async (data) => {
      if (data.status === 403) {
        toaster.create({
          title: "You are not allowed to share this group",
          description: "Only group administrators can create sharing links.",
          type: "error",
        });
        setUrl(null);
        return;
      }
      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));
        setUrl(null);
        return;
      }

      toaster.create({
        title: "Sharing link created successfully",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["getInvitation", groupData?.id],
      });
    },
    onError: (error) => {
      console.error("Mutation failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
      setUrl(null);
    },
  });

  const createShareGroup = async () => {
    const invitationLinkSecretRaw = crypto.getRandomValues(new Uint8Array(32));
    const invitationLinkSecret = btoa(
      String.fromCharCode(...invitationLinkSecretRaw)
    );

    const invitationVerificationToken =
      await deriveVerificationTokenFromLinkSecret(invitationLinkSecret);

    const encryptedInvitationLinkSecret = await encryptEncryptionKey(
      invitationLinkSecretRaw,
      groupData!.groupEncryptionKey
    );

    const invitationLinkSecretKey = await decryptEncryptionKey(
      encryptedInvitationLinkSecret,
      groupData!.groupEncryptionKey
    );

    const groupEncryptionKeyBuffer = new Uint8Array(
      await window.crypto.subtle.exportKey("raw", groupData!.groupEncryptionKey)
    );

    const invitationKey = await encryptEncryptionKey(
      groupEncryptionKeyBuffer,
      invitationLinkSecretKey
    );

    const url = urlFromInvitationLinkSecret(
      groupData!.id.toString(),
      invitationLinkSecret
    );

    setUrl(url);

    mutation.mutate({
      groupId: groupData!.id.toString(),
      invitationData: {
        invitationVerificationToken,
        invitationKey,
        invitationLinkSecret: encryptedInvitationLinkSecret,
      },
    });
  };

  const isGroupAdmin = user
    ? groupData?.members.find(
        (member) => member.userId === user.id && member.rights === "admin"
      ) !== undefined
    : false;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Center>
          <Button variant="outline" width="fit-content" disabled={!groupData}>
            <FaShareNodes /> Share Group
          </Button>
        </Center>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Use a link to share this group</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              {isLoadingExistingInvitation && <Text>Loading...</Text>}
              {!isGroupAdmin && (
                <Text marginBottom="1em">
                  Only group administrators can create sharing links.
                </Text>
              )}
              {isGroupAdmin && url && (
                <Card.Root marginBottom="1em">
                  <Card.Body>
                    <Text>{url}</Text>
                  </Card.Body>
                </Card.Root>
              )}
              {isGroupAdmin && !url && (
                <Center>
                  <Button
                    loading={mutation.isPending}
                    onClick={createShareGroup}
                  >
                    Create link
                  </Button>
                </Center>
              )}
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
