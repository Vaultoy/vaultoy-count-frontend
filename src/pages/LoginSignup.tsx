import { Link, useNavigate } from "react-router";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Button,
  Card,
  Checkbox,
  Field,
  Flex,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toast-store";
import { postSignupLoginMutation, type LoginSignupResponse } from "@/api/auth";
import { UserContext } from "@/contexts/UserContext";
import {
  UNEXPECTED_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import { PostLoginRedirectContext } from "@/contexts/PostLoginRedirectContext";
import { useKeyDerivation } from "@/encryption/useKeyDerivation";
import {
  decryptEncryptionKey,
  encryptEncryptionKey,
} from "@/encryption/encryption";
import {
  PASSWORD_MINIMUM_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/utils/constants";
import { checkResponseError } from "@/utils/checkResponseError";
import { checkResponseJson } from "@/utils/checkResponseJson";
import { MdArrowBack } from "react-icons/md";
import { LuExternalLink } from "react-icons/lu";
import { PasswordHints } from "@/components/PasswordHints";

interface TemporaryUserWaitingForServerResponse {
  username: string;
  passwordEncryptionKey: CryptoKey;
}

const LoginSignup = ({ isLogin }: { isLogin: boolean }) => {
  const [passwordLength, setPasswordLength] = useState(0);
  const [keyDerivationInProgress, setKeyDerivationInProgress] = useState(false);
  const [tmpUserWaiting, setTmpUserWaiting] = useState<
    TemporaryUserWaitingForServerResponse | undefined
  >(undefined);

  const navigate = useNavigate();
  const user = useContext(UserContext);
  const { postLoginRedirectInfos, setPostLoginRedirectInfos } = useContext(
    PostLoginRedirectContext,
  );
  const keyDerivation = useKeyDerivation();

  const formValuesSchema = z
    .object({
      username: z
        .string()
        .min(USERNAME_MIN_LENGTH)
        .max(USERNAME_MAX_LENGTH)
        .regex(
          /^[a-z0-9]+$/,
          "Username can only contain lowercase letters and numbers, without spaces",
        ),
      password: z.string().min(PASSWORD_MINIMUM_LENGTH),
      confirmPassword: isLogin ? z.string().optional() : z.string(),
      email: isLogin
        ? z.string().optional()
        : z.email("Please provide a valid email address"),
      acceptTerms: z
        .boolean()
        .default(false)
        .refine((value) => isLogin || value === true, {
          message: "To use our service, you must accept those documents",
        }),
    })
    .refine(
      (data) => {
        if (!isLogin) {
          // In signup mode, confirmPassword must match password
          return data.password === data.confirmPassword;
        }
        return true;
      },
      {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      },
    );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const mutation = useMutation({
    mutationFn: postSignupLoginMutation,
    onSuccess: async (data) => {
      const responseData = await checkResponseJson(data);
      if (await checkResponseError(data.status, responseData)) {
        return;
      }

      if (isLogin && data.status === 401) {
        toaster.create({
          title: "Login failed",
          description: `Invalid username or password`,
          type: "error",
        });

        return;
      }

      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));

        return;
      }

      const typedResponse = responseData as LoginSignupResponse;

      if (!tmpUserWaiting) {
        console.error(
          "Temporary user data not set, yet it should have been set when user clicked login/signup",
        );
        toaster.create(UNEXPECTED_ERROR_TOAST);

        return undefined;
      }

      const userEncryptionKey = await decryptEncryptionKey(
        typedResponse.userEncryptionKey,
        tmpUserWaiting.passwordEncryptionKey,
        false,
        "user key",
      );

      user.setUser({
        id: typedResponse.userId as number,
        username: tmpUserWaiting.username,
        email: typedResponse.email,
        userEncryptionKey,
      });

      setTmpUserWaiting(undefined);

      toaster.create({
        title: isLogin ? "Login successful" : "Account created successfully",
        type: "success",
      });

      if (postLoginRedirectInfos) {
        const uri = postLoginRedirectInfos.uri;
        setPostLoginRedirectInfos(undefined);
        await navigate(uri);
        return;
      }

      await navigate("/app");
    },
    onError: (error) => {
      console.error("Login failed", error);
      toaster.create(UNEXPECTED_ERROR_TOAST);
      setTmpUserWaiting(undefined);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!isLogin && !data.acceptTerms) {
      toaster.create({
        title:
          "To use our service, you must accept the legal notice, privacy policy and terms of service",
        type: "error",
      });
      return;
    }

    const normalizedUsername = data.username.normalize("NFKC");
    const normalizedPassword = data.password.normalize("NFKC");

    setKeyDerivationInProgress(true);
    try {
      const { passwordEncryptionKey, authenticationToken } =
        await keyDerivation(normalizedUsername, normalizedPassword);
      setKeyDerivationInProgress(false);

      setTmpUserWaiting({
        username: normalizedUsername,
        passwordEncryptionKey,
      });

      if (isLogin) {
        mutation.mutate({
          username: normalizedUsername,
          email: null,
          authenticationToken,
          isLogin,
          userEncryptionKey: null,
        });
      } else {
        const userEncryptionKeyRaw = crypto.getRandomValues(new Uint8Array(32));

        const encryptedUserEncryptionKey = await encryptEncryptionKey(
          userEncryptionKeyRaw,
          passwordEncryptionKey,
          "user key",
        );

        mutation.mutate({
          username: normalizedUsername,
          email: data.email!,
          authenticationToken,
          isLogin,
          userEncryptionKey: encryptedUserEncryptionKey,
        });
      }
    } catch (error) {
      setKeyDerivationInProgress(false);
      console.error("Key derivation failed", error);
      toaster.create(UNEXPECTED_ERROR_TOAST);
    }
  });

  return (
    <Flex minH="100vh" align="center" justify="center" marginY="1em">
      <VStack
        gap="1em"
        alignItems="stretch"
        maxWidth="100%"
        width={{ base: "94vw", sm: "70%", md: "25em" }}
      >
        <Button
          onClick={() => navigate("/")}
          width="fit-content"
          variant="outline"
        >
          <MdArrowBack /> Back
        </Button>
        {postLoginRedirectInfos?.type === "JOIN_INVITATION" && (
          <Card.Root padding="1em">
            <Card.Header>
              <Heading>Someone invited you to join a group!</Heading>
            </Card.Header>
            <Card.Body>Please log in or sign up to join it!</Card.Body>
          </Card.Root>
        )}

        <Card.Root width="100%">
          <Card.Body>
            <Text>
              ⚠️ This is a very early prototype. Feel free to play around with
              it. However, be aware that until the project reaches a more mature
              state, I intent to <strong>regularly delete all data</strong> such
              as accounts and groups.
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root padding="1em">
          <Card.Header>
            <HStack justifyContent="space-between">
              <Heading whiteSpace="nowrap">
                {isLogin ? "Log In" : "Sign Up"}
              </Heading>
              <Link to={isLogin ? "/signup" : "/login"}>
                <Button variant="outline">
                  {isLogin ? "Sign up" : "Log in"} instead
                </Button>
              </Link>
            </HStack>
          </Card.Header>

          <Card.Body>
            <form onSubmit={onSubmit}>
              <Field.Root invalid={!!errors.username}>
                <Field.Label>Username</Field.Label>
                <Input {...register("username")} />
                <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
              </Field.Root>
              {!isLogin && (
                <Field.Root invalid={!!errors.email} marginTop="1em">
                  <Field.Label>Email</Field.Label>
                  <Input {...register("email")} />
                  <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                </Field.Root>
              )}
              <Field.Root invalid={!!errors.password} marginTop="1em">
                <Field.Label>Password</Field.Label>
                <PasswordInput
                  {...register("password")}
                  onChange={(e) =>
                    setPasswordLength(e.target.value?.length ?? 0)
                  }
                />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>
              {!isLogin && (
                <>
                  <Field.Root
                    invalid={!!errors.confirmPassword}
                    marginTop="1em"
                  >
                    <Field.Label>Confirm Password</Field.Label>
                    <PasswordInput {...register("confirmPassword")} />
                    <Field.ErrorText>
                      {errors.confirmPassword?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <PasswordHints value={passwordLength} />
                </>
              )}

              {!isLogin && (
                <Field.Root invalid={!!errors.acceptTerms} marginTop="2em">
                  <Controller
                    control={control}
                    name="acceptTerms"
                    render={({ field: { onChange, value, ref, ...field } }) => (
                      <Checkbox.Root
                        checked={!!value}
                        onCheckedChange={({ checked }) => onChange(!!checked)}
                        ref={ref}
                        {...field}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label whiteSpace="normal">
                          I agree to the{" "}
                          <ChakraLink
                            href="/legal"
                            target="_blank"
                            variant="underline"
                            style={{ display: "inline" }}
                          >
                            legal notice, privacy policy and terms of service
                            <LuExternalLink
                              style={{
                                display: "inline",
                                verticalAlign: "middle",
                                marginLeft: "0.3em",
                                marginBottom: "0.2em",
                              }}
                            />
                          </ChakraLink>
                        </Checkbox.Label>
                      </Checkbox.Root>
                    )}
                  />
                  <Field.ErrorText>
                    {errors.acceptTerms?.message}
                  </Field.ErrorText>
                </Field.Root>
              )}

              <HStack alignItems="center" marginTop="2em">
                <Button
                  type="submit"
                  loading={keyDerivationInProgress || mutation.isPending}
                >
                  {isLogin ? "Log in" : "Sign up"}
                </Button>
                <Text fontSize="lg" marginLeft="1em">
                  {keyDerivationInProgress && "🔐..."}
                  {mutation.isPending && "🖥️..."}
                </Text>
              </HStack>
            </form>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Flex>
  );
};

export default LoginSignup;
