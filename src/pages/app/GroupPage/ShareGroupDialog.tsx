import {
  createInvitationMutation,
  deleteInvitationMutation,
  getInvitationQuery,
} from "@/api/group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Center,
  Dialog,
  Portal,
  CloseButton,
  Text,
  Card,
  HStack,
  VStack,
  QrCode,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toast-store";
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
import { LuClipboardCheck, LuClipboardCopy, LuDelete } from "react-icons/lu";
import { btoa_uri } from "@/utils/base64Uri";
import { GroupContext } from "@/contexts/GroupContext";
import { useQueryApi } from "@/api/useQueryApi";

const urlFromInvitationLinkSecret = (
  groupId: string,
  invitationLinkSecret: string,
) => {
  const url = new URL(
    window.location.origin +
      "/join/" +
      groupId +
      "/" +
      btoa_uri(invitationLinkSecret),
  );
  return url.toString();
};

export const ShareGroupDialog = () => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const { user } = useContext(UserContext);
  const { group } = useContext(GroupContext);

  const queryClient = useQueryClient();

  const userMember = group?.members.find(
    (member) => member.userId === user?.id,
  );

  const { body: existingInvitation, isLoading: isLoadingExistingInvitation } =
    useQueryApi({
      queryKey: ["getInvitation", group?.id],
      queryFn: () =>
        // Only fetch invitation if user is an admin
        group?.id && !isNaN(Number(group?.id)) && userMember?.rights === "admin"
          ? getInvitationQuery(group?.id.toString())
          : Promise.resolve(null),
    });

  useEffect(() => {
    const existingInvitationDecrypt = async () => {
      if (!existingInvitation?.invitationLinkSecret || !group) {
        return;
      }

      const invitationLinkSecretKey = await decryptEncryptionKey(
        existingInvitation?.invitationLinkSecret,
        group.groupEncryptionKey,
      );

      const invitationLinkSecret = await cryptoKeyToString(
        invitationLinkSecretKey,
      );

      const url = urlFromInvitationLinkSecret(
        group.id.toString(),
        invitationLinkSecret,
      );

      setUrl(url);
    };

    existingInvitationDecrypt();
  }, [existingInvitation, group]);

  const createMutation = useMutation({
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
        queryKey: ["getInvitation", group?.id],
      });
    },
    onError: (error) => {
      console.error("Mutation failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
      setUrl(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvitationMutation,
    onSuccess: async (data) => {
      if (data.status === 403) {
        toaster.create({
          title: "You are not allowed to delete this invitation",
          description: "Only group administrators can delete sharing links.",
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
        title: "Sharing link deleted successfully",
        type: "success",
      });

      setUrl(null);
      setCopiedToClipboard(false);

      queryClient.invalidateQueries({
        queryKey: ["getInvitation", group?.id],
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
      String.fromCharCode(...invitationLinkSecretRaw),
    );
    const invitationVerificationToken =
      await deriveVerificationTokenFromLinkSecret(invitationLinkSecret);

    const encryptedInvitationLinkSecret = await encryptEncryptionKey(
      invitationLinkSecretRaw,
      group!.groupEncryptionKey,
    );

    const invitationLinkSecretKey = await decryptEncryptionKey(
      encryptedInvitationLinkSecret,
      group!.groupEncryptionKey,
    );

    const groupEncryptionKeyBuffer = new Uint8Array(
      await window.crypto.subtle.exportKey("raw", group!.groupEncryptionKey),
    );

    const invitationKey = await encryptEncryptionKey(
      groupEncryptionKeyBuffer,
      invitationLinkSecretKey,
    );

    const url = urlFromInvitationLinkSecret(
      group!.id.toString(),
      invitationLinkSecret,
    );

    setUrl(url);

    createMutation.mutate({
      groupId: group!.id.toString(),
      invitationData: {
        invitationVerificationToken,
        invitationKey,
        invitationLinkSecret: encryptedInvitationLinkSecret,
      },
    });
  };

  const isGroupAdmin = user
    ? group?.members.find(
        (member) => member.userId === user.id && member.rights === "admin",
      ) !== undefined
    : false;

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Center>
          <Button variant="outline" width="fit-content" disabled={!group}>
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
                <VStack>
                  <QrCode.Root value={url} size="lg" marginBottom="1em">
                    <QrCode.Frame>
                      <QrCode.Pattern />
                    </QrCode.Frame>
                  </QrCode.Root>
                  <Card.Root marginBottom="1em">
                    <Card.Body>
                      <Text wordBreak="break-all" marginRight="1em">
                        {url}
                      </Text>
                    </Card.Body>
                  </Card.Root>
                  <HStack>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(url);
                        setCopiedToClipboard(true);
                        toaster.create({
                          title: "Link copied to clipboard",
                          type: "success",
                        });
                      }}
                    >
                      {copiedToClipboard ? (
                        <LuClipboardCheck />
                      ) : (
                        <LuClipboardCopy />
                      )}
                      Copy
                    </Button>
                    <Button
                      onClick={() => {
                        deleteMutation.mutate({
                          groupId: group!.id.toString(),
                        });
                      }}
                      colorScheme="red"
                      loading={deleteMutation.isPending}
                    >
                      <LuDelete />
                      Delete
                    </Button>
                  </HStack>
                </VStack>
              )}
              {isGroupAdmin && !url && (
                <Center>
                  <Button
                    loading={createMutation.isPending}
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
