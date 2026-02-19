import { UserContext } from "@/contexts/UserContext";
import { Button, Card, HStack, VStack, Text, Center } from "@chakra-ui/react";
import { useContext } from "react";
import { FaArrowRight, FaGithub } from "react-icons/fa";
import { Link } from "react-router";

export const Home = () => {
  const { user } = useContext(UserContext);

  return (
    <Center>
      <VStack marginTop="1em" width={{ base: "94%", md: "70%", lg: "60%" }}>
        <Card.Root margin="1em" width="100%">
          <Card.Body>
            <Text>
              ⚠️ This is a very early prototype. Feel free to play around with
              it. However, be aware that until the project reaches a more mature
              state, I intent to <strong>regularly delete all data</strong> such
              as accounts and groups.
            </Text>
          </Card.Body>
        </Card.Root>
        <HStack>
          {!user && (
            <>
              <Link to="/login">
                <Button>Log In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </>
          )}
          {user && (
            <Link to="/app">
              <Button>
                Welcome back, {user.username} <FaArrowRight width="0.6em" />
              </Button>
            </Link>
          )}
        </HStack>
        <Card.Root margin="1em 1em 0 1em" width="100%">
          <Card.Body textAlign="center">
            <Text>The source code can be found on</Text>

            <Link to="https://github.com/Vaultoy">
              <Button marginTop="1em" variant="outline">
                <FaGithub />
                GitHub
              </Button>
            </Link>
          </Card.Body>
        </Card.Root>
        <Card.Root margin="1em" width="100%">
          <Card.Body textAlign="center">
            <Text>
              The whitepaper describes the security and cryptographic design of
              the app
            </Text>
            <Link to="/whitepaper">
              <Button marginTop="1em" variant="outline">
                Whitepaper
              </Button>
            </Link>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Center>
  );
};
