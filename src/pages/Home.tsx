import { Button, Heading, HStack, VStack } from "@chakra-ui/react";
import { Link } from "react-router";

export const Home = () => {
  return (
    <VStack marginTop="5em">
      <Heading>Secure Count</Heading>
      <HStack>
        <Link to="/login">
          <Button>Log In</Button>
        </Link>
        <Link to="/signup">
          <Button variant="outline">Sign Up</Button>
        </Link>
      </HStack>
    </VStack>
  );
};
