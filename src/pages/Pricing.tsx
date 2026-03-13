import { Card, Center, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { IoIosPricetags } from "react-icons/io";

const Pricing = () => (
  <Center>
    <Card.Root
      marginTop="2em"
      marginBottom="4em"
      width={{ base: "94%", md: "70%", lg: "60%" }}
    >
      <Card.Header>
        <Heading marginTop="1em" textAlign="center" size="2xl">
          <Icon as={IoIosPricetags} /> Pricing
        </Heading>
      </Card.Header>
      <Card.Body>
        <VStack margin={{ base: "0", md: "2em" }} alignItems="start">
          <Text textAlign="justify">
            Vaultoy Count does{" "}
            <strong>not sell your data, or show you any ads</strong>. We beleive
            that a privacy-focused product can only be sustainable if it is
            financed by its users.
            <br />
            <br />
            In the future, we will introduce a{" "}
            <strong>premium plan with new features</strong>. The core features
            of Vaultoy Count will always be free to use, so that everyone who
            wants can benefit from a privacy-focused group expense splitting
            app.
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  </Center>
);

export default Pricing;
