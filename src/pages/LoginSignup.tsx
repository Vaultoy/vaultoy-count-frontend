import { Link, useNavigate } from "react-router";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "../components/ui/password-input";
import {
  AbsoluteCenter,
  Button,
  Card,
  Field,
  Heading,
  HStack,
  Input,
  Progress,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { derivateKeys } from "../utils/keyDerivation";
import { useMutation } from "@tanstack/react-query";
import { toaster } from "../components/ui/toaster";
import { postSignupLoginMutation } from "../api/auth";

export const LoginSignup = ({ isLogin }: { isLogin: boolean }) => {
  const [passwordLength, setPasswordLength] = useState(0);
  const [keyDerivationProgress, setKeyDerivationProgress] = useState<
    number | undefined
  >(undefined);
  const navigate = useNavigate();

  const formValuesSchema = z
    .object({
      username: z.string().min(3).max(100),
      password: z.string().min(8),
      confirmPassword: isLogin ? z.string().optional() : z.string(),
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
      }
    );

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
    mutationFn: postSignupLoginMutation,
    onSuccess: async (data) => {
      if (isLogin && data.status === 401) {
        toaster.create({
          title: "Login failed",
          description: `Invalid username or password`,
          type: "error",
        });

        return;
      }

      if (!isLogin && data.status === 409) {
        toaster.create({
          title: "Could not create your account",
          description: `Username already taken`,
          type: "error",
        });

        return;
      }

      if (data.status !== 200) {
        toaster.create({
          title: "An unknown error occurred",
          description: `Try to refresh your page or try again later. Status: ${data.status}.`,
          type: "error",
        });

        return;
      }

      toaster.create({
        title: isLogin ? "Login successful" : "Account created successfully",
        type: "success",
      });

      // TODO: Redirect to the app and save keys
      await navigate("/app");
    },
    onError: (error) => {
      // TODO
      console.error("Login failed", error);

      toaster.create({
        title: "An unknown error occurred",
        description: `Try to refresh your page or try again later.`,
        type: "error",
      });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setKeyDerivationProgress(0);
    const keys = await derivateKeys(
      data.username.normalize("NFKC"),
      data.password.normalize("NFKC"),
      (progress) => {
        setKeyDerivationProgress(progress);
      }
    );

    setKeyDerivationProgress(undefined);

    console.log(data, keys);

    mutation.mutate({
      username: data.username.normalize("NFKC"),
      hashedPassword: Array.from(keys.encryptionKey).toString(),
      isLogin,
    });
  });

  return (
    <AbsoluteCenter>
      <Card.Root padding="1em">
        <Card.Header>
          <HStack justifyContent="space-between">
            <Heading>{isLogin ? "Log In" : "Sign Up"}</Heading>
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
            <Field.Root invalid={!!errors.password} marginTop="1em">
              <Field.Label>Password</Field.Label>
              <PasswordInput
                {...register("password")}
                onChange={(e) => setPasswordLength(e.target.value?.length ?? 0)}
              />
              <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
            </Field.Root>
            {!isLogin && (
              <>
                <Field.Root invalid={!!errors.confirmPassword} marginTop="1em">
                  <Field.Label>Confirm Password</Field.Label>
                  <PasswordInput {...register("confirmPassword")} />
                  <Field.ErrorText>
                    {errors.confirmPassword?.message}
                  </Field.ErrorText>
                </Field.Root>

                <PasswordStrengthMeter
                  marginTop="1em"
                  value={passwordLength}
                  max={21}
                />
                <Text marginTop="1em" color="gray">
                  This password will be used as a key to encrypt your data.
                  <br />
                  Therefore, we recommend that you use a long and complex
                  password that you don't use anywhere else.
                  <br />A perfect password would be choosen randomly, 21
                  characters long from a-z, A-Z, 0-9 and !@#$%^&*.
                </Text>
              </>
            )}
            <Button
              type="submit"
              marginTop="2em"
              loading={keyDerivationProgress !== undefined}
            >
              {isLogin ? "Log in" : "Sign up"}
            </Button>
            {keyDerivationProgress !== undefined && (
              <Progress.Root
                value={100 * keyDerivationProgress}
                maxW="sm"
                marginTop="1em"
              >
                <Progress.Label marginBottom="0.5em">
                  Derivating encryption keys
                </Progress.Label>
                <Progress.Track flex="1">
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            )}
          </form>
        </Card.Body>
      </Card.Root>
    </AbsoluteCenter>
  );
};
