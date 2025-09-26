import {
  postAddTransactionMutation,
  type GroupExtended,
} from "../../../api/group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import {
  VStack,
  Button,
  Center,
  Dialog,
  Portal,
  Field,
  CloseButton,
  Input,
  Select,
  createListCollection,
  Fieldset,
  CheckboxGroup,
  Checkbox,
  Text,
  Card,
} from "@chakra-ui/react";
import { toaster } from "../../../components/ui/toaster";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  decryptEncryptionKey,
  encryptEncryptionKey,
  encryptNumber,
  encryptNumberList,
  encryptString,
} from "@/utils/encryption";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import { FaShareNodes } from "react-icons/fa6";
import scrypt from "scrypt-js";

export const ShareGroupDialog = ({
  groupData,
}: {
  groupData: GroupExtended<false> | undefined;
}) => {
  const { groupId } = useParams<{ groupId: string }>();

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [url, setUrl] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: postAddTransactionMutation,
    onSuccess: async (data) => {
      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));
        return;
      }

      toaster.create({
        title: "Sharing link created successfully",
        type: "success",
      });

      setOpen(false);
      // TODO
      // queryClient.invalidateQueries({ queryKey: ["getGroup", groupId] });
    },
    onError: (error) => {
      console.error("Login failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const createShareGroup = async () => {
    const invitationLinkSecretRaw = crypto.getRandomValues(new Uint8Array(32));

    const invitationLinkSecretString = btoa(
      String.fromCharCode(...invitationLinkSecretRaw)
    );

    const encryptedInvitationLinkSecret = await encryptEncryptionKey(
      invitationLinkSecretRaw,
      groupData!.groupEncryptionKey
    );

    const invitationLinkSecret = await decryptEncryptionKey(
      encryptedInvitationLinkSecret,
      groupData!.groupEncryptionKey
    );

    const groupEncryptionKeyBuffer = new Uint8Array(
      await window.crypto.subtle.exportKey("raw", groupData!.groupEncryptionKey)
    );

    const invitationKey = await encryptEncryptionKey(
      groupEncryptionKeyBuffer,
      invitationLinkSecret
    );
    const invitationValidationSaltString =
      "secure_count_invitation_validation_salt";

    const invitationValidationTokenBuffer = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(
        invitationLinkSecretString + invitationValidationSaltString
      )
    );

    const invitationValidationToken = btoa(
      String.fromCharCode(...new Uint8Array(invitationValidationTokenBuffer))
    );

    const url = new URL(
      window.location.origin +
        "/app/join/" +
        groupData!.id +
        "/" +
        invitationLinkSecretString
    );
    setUrl(url.toString());
  };

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
              {url && (
                <Card.Root marginBottom="1em">
                  <Card.Body>
                    <Text>{url}</Text>
                  </Card.Body>
                </Card.Root>
              )}
              {!url && (
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
