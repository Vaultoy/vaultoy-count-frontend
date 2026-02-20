import {
  Card,
  Heading,
  Button,
  Center,
  HStack,
  Grid,
  Text,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { FaGear } from "react-icons/fa6";
import { useNavigate } from "react-router";
import { UserContext } from "@/contexts/UserContext";
import { useContext } from "react";
import { InfoTip } from "@/components/ui/toggle-tip";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

export const SettingsPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <Center>
      <Card.Root
        marginTop="2em"
        marginBottom="4em"
        width={{ base: "94%", md: "70%", lg: "60%" }}
      >
        <Card.Header>
          <HStack justifyContent="space-between">
            <Button
              onClick={() => navigate(-1)}
              width="fit-content"
              variant="outline"
            >
              <MdArrowBack /> Back
            </Button>
          </HStack>
          <HStack marginTop="1em" justifyContent="center" alignItems="center">
            <FaGear />
            <Heading>Settings</Heading>
          </HStack>
        </Card.Header>
        <Card.Body marginTop="2em">
          <Grid
            templateColumns="1fr 1fr"
            gap="1em"
            justifyContent="center"
            alignItems="center"
          >
            <Text textAlign="right" fontWeight="bold">
              Username
            </Text>
            <HStack>
              <Text>{user?.username}</Text>
              <InfoTip content="The username cannot be changed" />
            </HStack>

            <Text textAlign="right" fontWeight="bold">
              Password
            </Text>
            <ChangePasswordDialog />
          </Grid>
        </Card.Body>
      </Card.Root>
    </Center>
  );
};
