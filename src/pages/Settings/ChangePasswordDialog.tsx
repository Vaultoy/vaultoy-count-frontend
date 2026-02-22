import { postChangePasswordMutation, useLogoutMutation } from "@/api/auth";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toast-store";
import { UserContext } from "@/contexts/UserContext";
import { checkValidationError } from "@/utils/checkValidationError";
import { encryptEncryptionKey } from "@/utils/encryption";
import { PASSWORD_MINIMUM_LENGTH } from "@/utils/constants";
import { useKeyDerivation } from "@/utils/useKeyDerivation";
import {
  Button,
  Dialog,
  Portal,
  CloseButton,
  Text,
  Field,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

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

  const mutation = useMutation({
    mutationFn: postChangePasswordMutation,
    onSuccess: async (data) => {
      if (await checkValidationError(data)) {
        return;
      }

      if (data.status === 401) {
        toaster.create({
          title: "Failed to change password",
          description: "The old password is incorrect",
          type: "error",
        });

        return;
      }

      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));

        return;
      }

      toaster.create({
        title: "Password changed successfully",
        description: "Please log in again with your new password",
        type: "success",
      });
      logoutMutation.mutate();
    },
    onError: (error) => {
      console.error("Password change failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
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

    // TODO: This requires the user encryption key to be extractable, which is not ideal.
    // We should change the encryption scheme to avoid this.
    const userEncryptionKeyRaw = new Uint8Array(
      await crypto.subtle.exportKey("raw", user.userEncryptionKey),
    );

    const newEncryptedUserEncryptionKey = await encryptEncryptionKey(
      userEncryptionKeyRaw,
      newKeys.passwordEncryptionKey,
      "user encryption key for password change",
    );

    mutation.mutate({
      username: normalizedUsername,
      oldAuthenticationToken: oldKeys.authenticationToken,
      newAuthenticationToken: newKeys.authenticationToken,
      newUserEncryptionKey: newEncryptedUserEncryptionKey,
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

                <PasswordStrengthMeter marginTop="1em" value={passwordLength} />
                <Text marginTop="1em" color="gray">
                  This password will be used as a key to encrypt your data.
                  <br />
                  Therefore, we recommend that you use a long and complex
                  password that you don't use anywhere else.
                  <br />A perfect password would be choosen randomly, 21
                  characters long from a-z, A-Z, 0-9 and !@#$%^&*.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Text fontSize="lg" marginLeft="1em">
                  {keyDerivationInProgress && "🔐..."}
                  {mutation.isPending && "🖥️..."}
                </Text>
                <Button
                  disabled={!user}
                  type="submit"
                  loading={keyDerivationInProgress || mutation.isPending}
                >
                  Change Password
                </Button>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
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
