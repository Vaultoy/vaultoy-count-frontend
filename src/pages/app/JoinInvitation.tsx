import { joinInvitationMutation } from "@/api/group";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import { toaster } from "@/components/ui/toaster";
import { UserContext } from "@/contexts/UserContext";
import { decryptEncryptionKey, encryptEncryptionKey } from "@/utils/encryption";
import {
  deriveVerificationTokenFromLinkSecret,
  stringToCryptoKey,
} from "@/utils/keyDerivation";
import { AbsoluteCenter, ProgressCircle } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

export const JoinInvitation = () => {
  const { groupId, invitationLinkSecret } = useParams<{
    groupId: string;
    invitationLinkSecret: string;
  }>();

  const navigate = useNavigate();

  const { user } = useContext(UserContext);

  const firstMutation = useMutation({
    mutationFn: joinInvitationMutation,
    onSuccess: async (data) => {
      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));
        return;
      }

      if (!groupId || !invitationLinkSecret) {
        toaster.create({
          title: "Invalid invitation link",
          description: "Missing group ID or invitation link secret.",
          type: "error",
        });
        return;
      }

      if (!user) {
        toaster.create({
          title: "User not logged in",
          description: "Please log in to join the group.",
          type: "error",
        });
        return;
      }

      const invitationVerificationToken =
        await deriveVerificationTokenFromLinkSecret(invitationLinkSecret);

      const invitationLinkSecretKey = await stringToCryptoKey(
        invitationLinkSecret
      );

      const invitationKey = (await data.json()).invitationKey as string;

      if (!invitationKey) {
        toaster.create({
          title: "Invalid response from server",
          description: "The response did not contain an invitation key.",
          type: "error",
        });
        return;
      }

      const groupEncryptionKey = await decryptEncryptionKey(
        invitationKey,
        invitationLinkSecretKey
      );

      const groupEncryptionKeyRaw = new Uint8Array(
        await crypto.subtle.exportKey("raw", groupEncryptionKey)
      );

      const encryptedGroupEncryptionKey = await encryptEncryptionKey(
        groupEncryptionKeyRaw,
        user.encryptionKey
      );

      secondMutation.mutate({
        groupId,
        invitationData: {
          invitationVerificationToken,
          encryptionKey: encryptedGroupEncryptionKey,
        },
      });
    },
    onError: (error) => {
      console.error("Mutation failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const secondMutation = useMutation({
    mutationFn: joinInvitationMutation,
    onSuccess: async (data) => {
      if (data.status === 409) {
        toaster.create({
          title: "You are already a member of this group",
          type: "warning",
        });
        navigate("/app/group/" + groupId);
        return;
      }

      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));
        return;
      }

      toaster.create({
        title: "Successfully joined the group",
        type: "success",
      });
      navigate("/app/group/" + groupId);
    },

    onError: (error) => {
      console.error("Mutation failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  useEffect(() => {
    const joinGroup = async () => {
      if (!groupId || !invitationLinkSecret) {
        toaster.create({
          title: "Invalid invitation link",
          description: "Missing group ID or invitation link secret.",
          type: "error",
        });
        return;
      }

      const invitationVerificationToken =
        await deriveVerificationTokenFromLinkSecret(invitationLinkSecret);

      firstMutation.mutate({
        groupId,
        invitationData: {
          invitationVerificationToken,
          encryptionKey: undefined,
        },
      });
    };

    joinGroup();
  }, []);

  return (
    <AbsoluteCenter>
      <ProgressCircle.Root value={null} size="xl">
        <ProgressCircle.Circle>
          <ProgressCircle.Track />
          <ProgressCircle.Range />
        </ProgressCircle.Circle>
      </ProgressCircle.Root>
    </AbsoluteCenter>
  );
};
