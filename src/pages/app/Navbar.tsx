import { Button, Card, Center, HStack, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import { useNavigate } from "react-router";
import { FiLogIn, FiLogOut } from "react-icons/fi";

export const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <Center>
      <Card.Root width={{ base: "94%", md: "70%", lg: "60%" }} marginTop="2em">
        <Card.Body>
          <HStack justifyContent="flex-end">
            <Text marginRight="1em">{user?.username}</Text>
            {user ? (
              <Button
                onClick={() => {
                  setUser(null);
                  // TODO: Disconnect server-side session as well
                  navigate("/login");
                }}
              >
                Logout <FiLogOut />
              </Button>
            ) : (
              <Button onClick={() => navigate("/login")}>
                Login <FiLogIn />
              </Button>
            )}
          </HStack>
        </Card.Body>
      </Card.Root>
    </Center>
  );
};
