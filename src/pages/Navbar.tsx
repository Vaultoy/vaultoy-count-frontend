import {
  Button,
  Card,
  Center,
  HStack,
  Skeleton,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import { useNavigate } from "react-router";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { Logo } from "@/components/Logo";
import { Link } from "react-router";
import { useLogoutMutation } from "@/api/auth";
import { FaRegUser } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

export const Navbar = () => {
  const { user, userDataRetrievedFromLocalDB } = useContext(UserContext);
  const navigate = useNavigate();

  const logoutMutation = useLogoutMutation({
    showSuccessToast: true,
    navigateToAfterLogout: "/",
  });

  const showText = useBreakpointValue({ base: false, md: true }) ?? false;

  return (
    <Center>
      <Card.Root width={{ base: "94%", md: "70%", lg: "60%" }} marginTop="2em">
        <Card.Body>
          <HStack justifyContent="space-between" alignItems="center">
            <Link to="/">
              <Logo size="small" showText={showText} />
            </Link>
            <HStack justifyContent="flex-end" flex="1" minWidth="0">
              {userDataRetrievedFromLocalDB && user && (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/settings")}
                  minWidth="0"
                  flexShrink={1}
                >
                  <FaRegUser />
                  <Text truncate>{user?.username}</Text>
                  <FaGear />
                </Button>
              )}
              {userDataRetrievedFromLocalDB && user && (
                <Button
                  loading={logoutMutation.isPending}
                  onClick={() => {
                    logoutMutation.mutate();
                  }}
                >
                  Logout <FiLogOut />
                </Button>
              )}
              {userDataRetrievedFromLocalDB && !user && (
                <>
                  <Link to="/login">
                    <Button>
                      Login <FiLogIn />
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline">Sign Up</Button>
                  </Link>
                </>
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
          </HStack>
        </Card.Body>
      </Card.Root>
    </Center>
  );
};
