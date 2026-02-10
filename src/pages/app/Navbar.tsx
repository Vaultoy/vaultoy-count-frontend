import { Button, Card, Center, HStack, Skeleton, Text } from "@chakra-ui/react";
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import { useNavigate } from "react-router";
import { FiLogIn, FiLogOut } from "react-icons/fi";

export const Navbar = () => {
  const { user, setUser, userDataRetrievedFromLocalDB } =
    useContext(UserContext);
  const navigate = useNavigate();

  return (
    <Center>
      <Card.Root width={{ base: "94%", md: "70%", lg: "60%" }} marginTop="2em">
        <Card.Body>
          <HStack justifyContent="flex-end">
            <Text marginRight="1em">{user?.username}</Text>
            {userDataRetrievedFromLocalDB && user && (
              <Button
                onClick={() => {
                  setUser(undefined);
                  // TODO: Disconnect server-side session as well
                  navigate("/login");
                }}
              >
                Logout <FiLogOut />
              </Button>
            )}
            {userDataRetrievedFromLocalDB && !user && (
              <Button onClick={() => navigate("/login")}>
                Login <FiLogIn />
              </Button>
            )}
            {!userDataRetrievedFromLocalDB && (
              <>
                <Skeleton height="1.5em" width="6em" marginRight="1em" />
                {/* Make the text invisible but still take up same space */}
                <Button color="rgb(0, 0, 0, 0)">
                  Logout <FiLogOut />
                </Button>
              </>
            )}
          </HStack>
        </Card.Body>
      </Card.Root>
    </Center>
  );
};
