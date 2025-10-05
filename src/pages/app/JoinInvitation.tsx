import { joinInvitationMutation } from "@/api/group";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import { toaster } from "@/components/ui/toaster";
import { PostLoginRedirectContext } from "@/contexts/PostLoginRedirectContext";
import { UserContext } from "@/contexts/UserContext";
import { atob_uri } from "@/utils/base64Uri";
import { decryptEncryptionKey, encryptEncryptionKey } from "@/utils/encryption";
import {
  deriveVerificationTokenFromLinkSecret,
  stringToCryptoKey,
} from "@/utils/keyDerivation";
import { AbsoluteCenter, Heading, ProgressCircle } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

export const JoinInvitation = () => {
  const { groupId, invitationLinkSecret: invitationLinkSecretTransformed } =
    useParams<{
      groupId: string;
      invitationLinkSecret: string;
    }>();

  const invitationLinkSecret = invitationLinkSecretTransformed
    ? atob_uri(invitationLinkSecretTransformed)
    : undefined;

  const navigate = useNavigate();

  const { user, userDataRetrievedFromLocalDB } = useContext(UserContext);
  const { setPostLoginRedirectInfos } = useContext(PostLoginRedirectContext);

  const hasExecuted = useRef(false);

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

    // Prevent multiple calls to joinGroup and wait for user data to be loaded from IndexedDB
    if (hasExecuted.current || !userDataRetrievedFromLocalDB) {
      return;
    }

    if (!user) {
      setPostLoginRedirectInfos({
        uri: `/join/${groupId}/${invitationLinkSecretTransformed}`,
        type: "JOIN_INVITATION",
      });

      navigate("/login");
      return;
    }

    hasExecuted.current = true;
    joinGroup();
  }, [userDataRetrievedFromLocalDB]);

  return (
    <AbsoluteCenter>
      {(firstMutation.isPending || secondMutation.isPending) && (
        <ProgressCircle.Root value={null} size="xl">
          <ProgressCircle.Circle>
            <ProgressCircle.Track />
            <ProgressCircle.Range />
          </ProgressCircle.Circle>
        </ProgressCircle.Root>
      )}
      {(firstMutation.isSuccess && secondMutation.isSuccess) ||
        ((firstMutation.isError || secondMutation.isError) && (
          <Heading size="xl">
            There was an error joining the group. Please try again later.
          </Heading>
        ))}
    </AbsoluteCenter>
  );
};
