import {
  postChangePasswordMutation,
  postSignupLoginMutation,
  useLogoutMutation,
} from "@/api/auth";
import { UNEXPECTED_ERROR_TOAST } from "@/components/toastMessages";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toast-store";
import { UserContext } from "@/contexts/UserContext";
import {
  decryptEncryptionKey,
  encryptEncryptionKey,
} from "@/encryption/encryption";
import { PASSWORD_MINIMUM_LENGTH } from "@/utils/constants";
import {
  useKeyDerivation,
  type DerivatedFromPasswordSecrets,
} from "@/encryption/useKeyDerivation";
import {
  Button,
  Dialog,
  Portal,
  CloseButton,
  Text,
  Field,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { PasswordHints } from "@/components/PasswordHints";
import { useMutationApi } from "@/api/useMutationApi";

const formValuesSchema = z
  .object({
    oldPassword: z.string().min(PASSWORD_MINIMUM_LENGTH),
    newPassword: z.string().min(PASSWORD_MINIMUM_LENGTH),
    confirmNewPassword: z.string().min(PASSWORD_MINIMUM_LENGTH),
  })
  .refine(
    (data) => {
      return data.newPassword === data.confirmNewPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
    },
  )
  .refine(
    (data) => {
      return data.oldPassword !== data.newPassword;
    },
    {
      message: "The new password must be different from the old one",
      path: ["newPassword"],
    },
  );

export const ChangePasswordDialog = () => {
  const { user } = useContext(UserContext);
  const [passwordLength, setPasswordLength] = useState(0);
  const [open, setOpen] = useState(false);
  const [keyDerivationInProgress, setKeyDerivationInProgress] = useState(false);
  const keyDerivation = useKeyDerivation();
  const logoutMutation = useLogoutMutation({
    showSuccessToast: false,
    navigateToAfterLogout: "/login",
  });

  // This is used to store the temporarily store the derived keys
  // between login and change password mutation
  const [loginInfoDuringPasswordChange, setLoginInfoDuringPasswordChange] =
    useState<{
      username: string;
      oldKeys: DerivatedFromPasswordSecrets;
      newKeys: DerivatedFromPasswordSecrets;
    } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const changePasswordMutation = useMutationApi({
    mutationFn: postChangePasswordMutation,
    onSuccess: async () => {
      toaster.create({
        title: "Password changed successfully",
        description: "Please log in again with your new password",
        type: "success",
      });

      logoutMutation.mutate();
    },
    onOtherError: (error) => {
      if (error.error === "INCORRECT_CREDENTIALS") {
        toaster.create({
          title: "Failed to change password",
          description: "The old password is incorrect",
          type: "error",
        });
        return;
      }
    },
  });

  const loginMutation = useMutationApi({
    mutationFn: postSignupLoginMutation,
    onSuccess: async (data) => {
      if (!loginInfoDuringPasswordChange) {
        console.error(
          "Temporary login data not set, yet it should have been set when user clicked login/signup",
        );
        toaster.create(UNEXPECTED_ERROR_TOAST);
        return undefined;
      }

      const userEncryptionKey = await decryptEncryptionKey(
        data.userEncryptionKey,
        loginInfoDuringPasswordChange.oldKeys.passwordEncryptionKey,
        true, // Not a security issue as it is dropped immediately after
        "old user key",
      );

      const userEncryptionKeyRaw = new Uint8Array(
        await crypto.subtle.exportKey("raw", userEncryptionKey),
      );

      const newEncryptedUserEncryptionKey = await encryptEncryptionKey(
        userEncryptionKeyRaw,
        loginInfoDuringPasswordChange.newKeys.passwordEncryptionKey,
        "new user encryption key for password change",
      );

      changePasswordMutation.mutate({
        username: loginInfoDuringPasswordChange.username,
        oldAuthenticationToken:
          loginInfoDuringPasswordChange.oldKeys.authenticationToken,
        newAuthenticationToken:
          loginInfoDuringPasswordChange.newKeys.authenticationToken,
        newUserEncryptionKey: newEncryptedUserEncryptionKey,
      });
    },
    onOtherError: (error) => {
      if (error.error === "INCORRECT_CREDENTIALS") {
        toaster.create({
          title: "Failed to change password",
          description: "The old password is incorrect",
          type: "error",
        });
        return;
      }
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!user) {
      console.error(
        "User not found in context when trying to submit change password form",
      );
      return;
    }

    const normalizedUsername = user.username.normalize("NFKC");
    const normalizedOldPassword = data.oldPassword.normalize("NFKC");
    const normalizedNewPassword = data.newPassword.normalize("NFKC");

    setKeyDerivationInProgress(true);
    const oldKeys = await keyDerivation(
      normalizedUsername,
      normalizedOldPassword,
    );
    const newKeys = await keyDerivation(
      normalizedUsername,
      normalizedNewPassword,
    );
    setKeyDerivationInProgress(false);

    setLoginInfoDuringPasswordChange({
      username: normalizedUsername,
      oldKeys,
      newKeys,
    });

    loginMutation.mutate({
      isLogin: true,
      username: normalizedUsername,
      authenticationToken: oldKeys.authenticationToken,
      email: null,
      userEncryptionKey: null,
    });
  });

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button width="fit-content" disabled={!user} variant="outline">
          Change password
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Change Password</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={onSubmit}>
              <Dialog.Body>
                <Field.Root invalid={!!errors.oldPassword} marginTop="1em">
                  <Field.Label>Old password</Field.Label>
                  <PasswordInput {...register("oldPassword")} />
                  <Field.ErrorText>
                    {errors.oldPassword?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.newPassword} marginTop="1em">
                  <Field.Label>New password</Field.Label>
                  <PasswordInput
                    {...register("newPassword")}
                    onChange={(e) =>
                      setPasswordLength(e.target.value?.length ?? 0)
                    }
                  />
                  <Field.ErrorText>
                    {errors.newPassword?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root
                  invalid={!!errors.confirmNewPassword}
                  marginTop="1em"
                >
                  <Field.Label>Confirm new password</Field.Label>
                  <PasswordInput {...register("confirmNewPassword")} />
                  <Field.ErrorText>
                    {errors.confirmNewPassword?.message}
                  </Field.ErrorText>
                </Field.Root>

                <PasswordHints value={passwordLength} />
              </Dialog.Body>
              <Dialog.Footer>
                <Text fontSize="lg" marginLeft="1em">
                  {keyDerivationInProgress && "🔐..."}
                  {changePasswordMutation.isPending && "🖥️..."}
                </Text>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  disabled={!user}
                  type="submit"
                  loading={
                    keyDerivationInProgress ||
                    loginMutation.isPending ||
                    changePasswordMutation.isPending
                  }
                >
                  Change Password
                </Button>
              </Dialog.Footer>
            </form>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
