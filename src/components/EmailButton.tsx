import { Button, Image, useClipboard } from "@chakra-ui/react";
import { toaster } from "./ui/toast-store";
import { LuClipboard, LuClipboardCheck } from "react-icons/lu";

/**
 * A button that displays an email address and allows the user to copy it to the clipboard.
 *
 * Protects the email address from bots by splitting it into user and domain parts and displaying an "@" image in between.
 */
export const EmailButton = ({
  mailUser,
  mailDomain,
}: {
  mailUser: string;
  mailDomain: string;
}) => {
  const clipboard = useClipboard({
    value: `${mailUser}@${mailDomain}`,
  });

  const copy = () => {
    clipboard.copy();

    toaster.create({
      title: "Email copied to clipboard",
      type: "success",
      duration: 5000,
    });
  };

  return (
    <Button
      variant="plain"
      onTouchStart={() => {
        if (clipboard.copied) return;
        copy();
      }}
      onClick={() => {
        if (clipboard.copied) return;
        copy();
      }}
      color="accent"
      alignItems="center"
      justifyContent="center"
      flexDirection="row"
      display="flex"
      gap="0"
      margin="0"
    >
      <span>{mailUser}</span>
      <Image
        src="/at.png"
        height="1.1em"
        marginBottom="-0.1em"
        marginLeft="0.1em"
        marginRight="0.1em"
      />
      <span>{mailDomain}</span>
      <Button
        as="div"
        color="accent"
        marginLeft="0.8em"
        size="xs"
        disabled={clipboard.copied}
      >
        Copy {clipboard.copied ? <LuClipboardCheck /> : <LuClipboard />}
      </Button>
    </Button>
  );
};
