import { Heading, Image, HStack } from "@chakra-ui/react";

export const Logo = ({
  size,
  showText,
}: {
  size: "small" | "large";
  showText: boolean;
}) => {
  return (
    <HStack alignItems="center" justifyContent="center">
      <Image
        src="/vaultoy_count_logo.svg"
        alt="Vaultoy Count Logo"
        height={size === "small" ? "2.2em" : "3em"}
      />
      {showText && (
        <Heading
          size={size === "small" ? "xl" : "3xl"}
          fontWeight="normal"
          ml="0.2em"
        >
          Vaultoy Count
        </Heading>
      )}
    </HStack>
  );
};
