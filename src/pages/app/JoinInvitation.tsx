import {
  joinInvitationConcludeMutation,
  joinInvitationInitiateMutation,
  type GroupForJoiningInitiate,
} from "@/api/invitation";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import { toaster } from "@/components/ui/toast-store";
import { PostLoginRedirectContext } from "@/contexts/PostLoginRedirectContext";
import { UserContext } from "@/contexts/UserContext";
import { atob_uri } from "@/utils/base64Uri";
import { checkResponseError } from "@/utils/checkResponseError";
import { checkResponseJson } from "@/utils/checkResponseJson";
import {
  decryptGroupForJoining,
  encryptEncryptionKey,
  type GroupForJoiningWithKey,
} from "@/utils/encryption";
import { deriveVerificationTokenFromLinkSecret } from "@/utils/groupInvitationDerivation";
import {
  Button,
  Card,
  Center,
  Fieldset,
  Heading,
  ProgressCircle,
  RadioGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import z from "zod";

const formValuesSchema = z.object({
  selfMemberId: z.string("Please select who you are in this list"),
});

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

  const [isStatusError, setIsStatusError] = useState(false);

  const hasExecuted = useRef(false);

  const [groupForJoining, setGroupForJoining] = useState<
    GroupForJoiningWithKey | undefined
  >(undefined);

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const joinInitiateMutation = useMutation({
    mutationFn: joinInvitationInitiateMutation,
    onSuccess: async (data) => {
      const responseData = await checkResponseJson(data);
      if (await checkResponseError(data.status, responseData)) {
        return;
      }

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
        setIsStatusError(true);
        return;
      }

      const typedResponse = responseData as GroupForJoiningInitiate;

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

      if (!typedResponse.invitationKey) {
        toaster.create({
          title: "Invalid response from server",
          description: "The response did not contain an invitation key.",
          type: "error",
        });
        return;
      }

      const group = await decryptGroupForJoining(
        typedResponse,
        invitationLinkSecret,
        typedResponse.invitationKey,
      );

      setGroupForJoining(group);
    },
    onError: (error) => {
      console.error("Mutation failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const joinConcludeMutation = useMutation({
    mutationFn: joinInvitationConcludeMutation,
    onSuccess: async (data) => {
      const responseData = await checkResponseJson(data);
      if (await checkResponseError(data.status, responseData)) {
        return;
      }

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
        setIsStatusError(true);
        return;
      }

      toaster.create({
        title: "Successfully joined the group",
        type: "success",
      });
      navigate("/app/group/" + groupId);

      setGroupForJoining(undefined);
      reset();
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

      setIsStatusError(false);
      joinInitiateMutation.mutate({
        groupId,
        invitationData: {
          invitationVerificationToken,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userDataRetrievedFromLocalDB]);

  const onSubmit = handleSubmit(async (data) => {
    if (!groupId) {
      toaster.create({
        title: "Invalid invitation link",
        description: "Missing group ID.",
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

    if (!groupForJoining) {
      toaster.create({
        title: "Group data not loaded",
        description: "The group data is not loaded yet. Please wait a moment.",
        type: "error",
      });
      return;
    }

    const selfMemberIdInt = parseInt(data.selfMemberId, 10);
    if (isNaN(selfMemberIdInt)) {
      toaster.create({
        title: "Invalid member ID",
        description: "Please select a valid member from the list.",
        type: "error",
      });
      return;
    }

    const groupEncryptionKeyRaw = new Uint8Array(
      await crypto.subtle.exportKey("raw", groupForJoining.groupEncryptionKey),
    );

    const encryptedGroupEncryptionKey = await encryptEncryptionKey(
      groupEncryptionKeyRaw,
      user.userEncryptionKey,
      "group key for invitation",
    );

    joinConcludeMutation.mutate({
      groupId,
      invitationData: {
        memberId: selfMemberIdInt,
        invitationVerificationToken:
          groupForJoining.invitationVerificationToken,
        groupEncryptionKey: encryptedGroupEncryptionKey,
      },
    });
  });

  return (
    <Center>
      <Card.Root
        marginTop="2em"
        marginBottom="4em"
        width={{ base: "94%", md: "70%", lg: "60%" }}
      >
        <Card.Header>
          <Center marginTop="1em">
            <Heading>
              👋 Someone invited you to join{" "}
              {groupForJoining?.name ? `"${groupForJoining.name}"` : "a group"}!
            </Heading>
          </Center>
        </Card.Header>
        <Card.Body>
          {joinInitiateMutation.isPending && (
            <ProgressCircle.Root value={null} size="xl">
              <ProgressCircle.Circle>
                <ProgressCircle.Track />
                <ProgressCircle.Range />
              </ProgressCircle.Circle>
            </ProgressCircle.Root>
          )}

          {(joinInitiateMutation.isError ||
            joinConcludeMutation.isError ||
            isStatusError) && (
            <Heading size="xl">
              ❌ There was an error while joining the group. Please try again
              later.
            </Heading>
          )}

          {groupForJoining && (
            <form onSubmit={onSubmit}>
              <Fieldset.Root invalid={!!errors.selfMemberId} marginTop="2em">
                <Fieldset.Legend>Select who you are</Fieldset.Legend>
                <Controller
                  name="selfMemberId"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup.Root
                      name={field.name}
                      value={field.value}
                      onValueChange={({ value }) => {
                        field.onChange(value);
                      }}
                    >
                      <VStack gap="1em">
                        {groupForJoining.members
                          .sort(
                            // Put members with userId (already taken) at the end of the list
                            (a, b) => {
                              if (a.userId && !b.userId) {
                                return 1;
                              } else if (!a.userId && b.userId) {
                                return -1;
                              } else {
                                return 0;
                              }
                            },
                          )
                          .map((member) => (
                            <Card.Root key={member.memberId} width="100%">
                              <Card.Body padding="0.7em">
                                <RadioGroup.Item
                                  value={member.memberId.toString()}
                                  disabled={member.userId !== null}
                                >
                                  <RadioGroup.ItemHiddenInput
                                    onBlur={field.onBlur}
                                  />
                                  <RadioGroup.ItemIndicator />
                                  <VStack alignItems="flex-start" gap="0.25em">
                                    <Text
                                      fontSize="md"
                                      color={
                                        member.userId ? "gray.300" : "black"
                                      }
                                    >
                                      {member.nickname}
                                    </Text>

                                    <Text fontSize="xs" color="gray.300">
                                      {member.userId ? "Already taken" : ""}
                                    </Text>
                                  </VStack>
                                </RadioGroup.Item>
                              </Card.Body>
                            </Card.Root>
                          ))}
                      </VStack>
                    </RadioGroup.Root>
                  )}
                />

                <Fieldset.ErrorText>
                  {errors.selfMemberId?.message}
                </Fieldset.ErrorText>

                <Button
                  size="sm"
                  type="submit"
                  alignSelf="center"
                  marginTop="2em"
                  loading={joinConcludeMutation.isPending}
                >
                  Join the group
                </Button>
              </Fieldset.Root>
            </form>
          )}
        </Card.Body>
      </Card.Root>
    </Center>
  );
};
