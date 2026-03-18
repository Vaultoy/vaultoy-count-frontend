import {
  joinInvitationConcludeMutation,
  joinInvitationInitiateMutation,
} from "@/api/invitation";
import { toaster } from "@/components/ui/toast-store";
import { PostLoginRedirectContext } from "@/contexts/PostLoginRedirectContext";
import { UserContext } from "@/contexts/UserContext";
import {
  decryptGroupForJoining,
  type GroupForJoiningWithKey,
} from "@/encryption/groupEncryption";
import { deriveInvitationAuthenticationToken } from "@/encryption/groupInvitationDerivation";
import {
  Button,
  Card,
  Center,
  Field,
  Fieldset,
  Heading,
  HStack,
  Icon,
  Input,
  ProgressCircle,
  RadioGroup,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import z from "zod";
import { encryptEncryptionKey, encryptString } from "@/encryption/encryption";
import { TbFaceIdError } from "react-icons/tb";
import { onUnknownError, useMutationApi } from "@/api/useMutationApi";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "@/utils/constants";

const CREATE_NEW_MEMBER_VALUE = "CREATE_NEW_MEMBER_VALUE" as const;

const formValuesSchema = z
  .object({
    selfMemberId: z.string("Please select who you are in this list"),
    selfMemberNickname: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.selfMemberId === CREATE_NEW_MEMBER_VALUE) {
        const trimmedNickname = data.selfMemberNickname?.trim();
        return (
          trimmedNickname !== undefined &&
          trimmedNickname.length >= USERNAME_MIN_LENGTH &&
          trimmedNickname.length <= USERNAME_MAX_LENGTH
        );
      }
      return true;
    },
    {
      message: "Your nickname must be between 3 and 20 characters long",
      path: ["selfMemberNickname"],
    },
  );

type JoiningError =
  | "GROUP_INVITATION_NOT_FOUND"
  | "GROUP_JOINING_FORBIDDEN"
  | "UNKNOWN_ERROR";

const JoinInvitation = () => {
  const { groupId: groupIdString, invitationLinkSecret } = useParams<{
    groupId: string;
    invitationLinkSecret: string;
  }>();
  const groupId =
    groupIdString !== undefined && !isNaN(Number(groupIdString))
      ? Number(groupIdString)
      : undefined;

  const navigate = useNavigate();

  const { user, userDataRetrievedFromLocalDB } = useContext(UserContext);
  const { setPostLoginRedirectInfos } = useContext(PostLoginRedirectContext);

  const [isOtherError, setIsOtherError] = useState<JoiningError | null>(null);

  const hasExecuted = useRef(false);

  const [groupForJoining, setGroupForJoining] = useState<
    GroupForJoiningWithKey | undefined
  >(undefined);

  const {
    handleSubmit,
    reset,
    control,
    register,
    watch,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const joinInitiateMutation = useMutationApi({
    mutationFn: joinInvitationInitiateMutation,
    onSuccess: async (data) => {
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

      if (!data.invitationGroupEncryptionKey) {
        toaster.create({
          title: "Invalid response from server",
          description:
            "The response did not contain an invitation group encryption key.",
          type: "error",
        });
        return;
      }

      const group = await decryptGroupForJoining(data, invitationLinkSecret);

      setGroupForJoining(group);
    },
    onOtherError: (error) => {
      if (error.error === "USER_ALREADY_IN_GROUP") {
        toaster.create({
          title: "You are already a member of this group",
          type: "warning",
        });
        navigate(`/app/group/${groupId}`);
        return;
      }

      if (
        error.error === "GROUP_INVITATION_NOT_FOUND" ||
        error.error === "GROUP_JOINING_FORBIDDEN"
      ) {
        setIsOtherError(error.error);
        return;
      }

      onUnknownError(error);
    },
  });

  const joinConcludeMutation = useMutationApi({
    mutationFn: joinInvitationConcludeMutation,
    onSuccess: async () => {
      toaster.create({
        title: "Successfully joined the group",
        type: "success",
      });
      navigate(`/app/group/${groupId}`);

      setGroupForJoining(undefined);
      reset();
    },
    onOtherError: (error) => {
      if (error.error === "USER_ALREADY_IN_GROUP") {
        toaster.create({
          title: "You are already a member of this group",
          type: "warning",
        });
        navigate(`/app/group/${groupId}`);
        return;
      }

      if (
        error.error === "GROUP_INVITATION_NOT_FOUND" ||
        error.error === "GROUP_JOINING_FORBIDDEN"
      ) {
        setIsOtherError(error.error);
        return;
      }

      onUnknownError(error);
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

      const invitationAuthenticationToken =
        await deriveInvitationAuthenticationToken(invitationLinkSecret);

      setIsOtherError(null);
      joinInitiateMutation.mutate({
        groupId,
        invitationData: {
          invitationAuthenticationToken,
        },
      });
    };

    // Prevent multiple calls to joinGroup and wait for user data to be loaded from IndexedDB
    if (hasExecuted.current || !userDataRetrievedFromLocalDB) {
      return;
    }

    if (!user) {
      setPostLoginRedirectInfos({
        uri: `/join/${groupId}/${invitationLinkSecret}`,
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

    const selfMemberIdInt =
      data.selfMemberId !== CREATE_NEW_MEMBER_VALUE
        ? parseInt(data.selfMemberId, 10)
        : CREATE_NEW_MEMBER_VALUE;
    if (selfMemberIdInt !== CREATE_NEW_MEMBER_VALUE && isNaN(selfMemberIdInt)) {
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

    const memberData =
      selfMemberIdInt !== CREATE_NEW_MEMBER_VALUE
        ? { memberId: selfMemberIdInt }
        : {
            memberNickname: await encryptString(
              data.selfMemberNickname!,
              groupForJoining.groupEncryptionKey,
              "self nickname for invitation",
            ),
          };

    joinConcludeMutation.mutate({
      groupId,
      invitationData: {
        ...memberData,
        invitationAuthenticationToken:
          groupForJoining.invitationAuthenticationToken,
        groupEncryptionKey: encryptedGroupEncryptionKey,
      },
    });
  });

  const selfMemberId = watch("selfMemberId");

  return (
    <Center>
      <Card.Root
        marginTop="2em"
        marginBottom="4em"
        width={{ base: "94%", md: "70%", lg: "60%" }}
      >
        {!joinInitiateMutation.isError &&
          !joinConcludeMutation.isError &&
          !isOtherError && (
            <Card.Header>
              <Center marginTop="1em">
                <Heading>
                  👋 Someone invited you to join{" "}
                  {groupForJoining?.name
                    ? `"${groupForJoining.name}"`
                    : "a group"}
                  !
                </Heading>
              </Center>
            </Card.Header>
          )}
        <Card.Body>
          {joinInitiateMutation.isPending && (
            <ProgressCircle.Root value={null} size="xl">
              <ProgressCircle.Circle>
                <ProgressCircle.Track />
                <ProgressCircle.Range />
              </ProgressCircle.Circle>
            </ProgressCircle.Root>
          )}

          {joinInitiateMutation.isError ||
            joinConcludeMutation.isError ||
            (isOtherError && (
              <VStack>
                <Icon
                  as={TbFaceIdError}
                  height="4em"
                  width="4em"
                  color="gray.500"
                />
                <Text color="gray.600" textAlign="center">
                  {isOtherError === "GROUP_INVITATION_NOT_FOUND" ? (
                    <>
                      The invitation link you just used is invalid. The group
                      might have been deleted, or it might have been copied
                      incorrectly.
                      <br />
                      Please ask the group admin for a new invitation link.
                    </>
                  ) : isOtherError === "GROUP_JOINING_FORBIDDEN" ? (
                    <>
                      The invitation link you just used is invalid. The group
                      admin may have revoked it, or it might have been copied
                      incorrectly.
                      <br />
                      Please ask the group admin for a new invitation link.
                    </>
                  ) : isOtherError === "UNKNOWN_ERROR" ? (
                    <>There was an unknown error. Please try again later.</>
                  ) : null}

                  {joinInitiateMutation.isError ||
                    joinConcludeMutation.isError ||
                    (isOtherError === "UNKNOWN_ERROR" && (
                      <>There was an unknown error. Please try again later.</>
                    ))}
                </Text>
              </VStack>
            ))}

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

                        <HStack width="100%">
                          <Separator flex="1" />
                          <Text flexShrink="0" color="gray.500">
                            Or
                          </Text>
                          <Separator flex="1" />
                        </HStack>

                        <Card.Root width="100%">
                          <Card.Body padding="0.7em">
                            <RadioGroup.Item value={CREATE_NEW_MEMBER_VALUE}>
                              <RadioGroup.ItemHiddenInput
                                onBlur={field.onBlur}
                              />
                              <RadioGroup.ItemIndicator />
                              <VStack alignItems="flex-start" gap="0.25em">
                                <Text fontSize="md" color="black">
                                  Create a new member
                                </Text>
                              </VStack>
                            </RadioGroup.Item>
                          </Card.Body>
                        </Card.Root>
                      </VStack>
                    </RadioGroup.Root>
                  )}
                />

                <Fieldset.ErrorText>
                  {errors.selfMemberId?.message}
                </Fieldset.ErrorText>

                {selfMemberId === CREATE_NEW_MEMBER_VALUE && (
                  <Field.Root invalid={!!errors.selfMemberNickname}>
                    <Field.Label>Your nickname</Field.Label>
                    <Input
                      {...register("selfMemberNickname")}
                      width={{ base: "100%", md: "20em" }}
                    />
                    <Field.ErrorText>
                      {errors.selfMemberNickname?.message}
                    </Field.ErrorText>
                  </Field.Root>
                )}

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

export default JoinInvitation;
