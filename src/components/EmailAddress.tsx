import { HStack, Image } from "@chakra-ui/react";

/**
 * A component that displays an email address.
 *
 * Protects the email address from bots by splitting it into user and domain parts and displaying an "@" image in between.
 */
export const EmailAddress = ({
  mailUser,
  mailDomain,
}: {
  mailUser: string;
  mailDomain: string;
}) => {
  return (
    <HStack
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
        height="0.9em"
        marginBottom="-0.1em"
        marginLeft="0.1em"
        marginRight="0.05em"
      />
      <span>{mailDomain}</span>
    </HStack>
  );
};
