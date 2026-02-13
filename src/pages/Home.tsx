import { Logo } from "@/components/Logo";
import { UserContext } from "@/contexts/UserContext";
import { Button, Card, HStack, VStack, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { FaArrowRight } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { Link } from "react-router";

export const Home = () => {
  const { user, setUser } = useContext(UserContext);

  return (
    <VStack marginTop="5em">
      <Card.Root variant="outline" padding="1em">
        <Logo size="large" />
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
          <>
            <Link to="/app">
              <Button>
                Welcome back, {user.username} <FaArrowRight width="0.6em" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setUser(undefined);
                // TODO: Disconnect server-side session as well
              }}
            >
              Logout <FiLogOut />
            </Button>
          </>
        )}
      </HStack>

      <Card.Root margin="2em 1em 1em 1em">
        <Card.Body>
          <Text>
            ⚠️ This is a very early prototype. Feel free to play around with it.
            However, be aware that until the project reaches a more mature
            state, I intent to <strong>regularly delete all data</strong> such
            as accounts and groups.
          </Text>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};
