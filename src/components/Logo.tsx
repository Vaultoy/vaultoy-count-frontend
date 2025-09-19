import { Heading, Image, HStack, Card } from "@chakra-ui/react";

export const Logo = () => {
  return (
    <Card.Root variant="outline" padding="1em">
      <HStack alignItems="center" justifyContent="center">
        <Image
          src="/secure_count_logo.svg"
          alt="Secure Count Logo"
          height="3em"
        />
        <Heading size="3xl" fontWeight="normal" ml="0.2em">
          Secure Count
        </Heading>
      </HStack>
    </Card.Root>
  );
};
