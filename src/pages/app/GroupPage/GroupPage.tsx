import { getGroupQuery } from "@/api/group";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { ErrorPage } from "../../ErrorPage";
import {
  Card,
  VStack,
  Text,
  Heading,
  Button,
  Center,
  HStack,
  Tabs,
  Skeleton,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { useContext } from "react";
import { ShareGroupDialog } from "./ShareGroupDialog";
import { TransactionList } from "./TransactionList";
import { Equilibrium } from "./Equilibrium";
import {
  GroupContext,
  useDecryptAndSaveGroupToContext,
} from "@/contexts/GroupContext";

export const GroupPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["getGroup", groupId],
    queryFn: () =>
      groupId && !isNaN(Number(groupId))
        ? getGroupQuery(groupId)
        : Promise.resolve(null),
  });

  useDecryptAndSaveGroupToContext(data?.group);
  const { group } = useContext(GroupContext);

  if (!groupId || isNaN(Number(groupId))) {
    return (
      <ErrorPage
        title="404 - Page Not Found"
        description="The URL you have entered is invalid."
      />
    );
  }

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
              onClick={() => navigate("/app")}
              width="fit-content"
              variant="outline"
            >
              <MdArrowBack /> Back
            </Button>
            <ShareGroupDialog />
          </HStack>
          <Center marginTop="1em">
            {group ? (
              <Heading>📔 {group.name}</Heading>
            ) : (
              <Skeleton height="2em" width="50%" />
            )}
          </Center>
        </Card.Header>
        <Card.Body>
          <VStack>
            <HStack gap="0.5em" marginBottom="3em">
              <Text>
                👥 Members:{" "}
                {group?.members.map((member) => member.username).join(", ")}
              </Text>
              {!group &&
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton
                      key={i}
                      height="1em"
                      width="5em"
                      marginLeft="0.5em"
                    />
                  ))}
            </HStack>

            <Tabs.Root
              defaultValue="transactions"
              width="100%"
              variant="enclosed"
            >
              <Tabs.List width="100%" justifyContent="center">
                <Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
                <Tabs.Trigger value="equilibrium">Equilibrium</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="transactions">
                <TransactionList />
              </Tabs.Content>
              <Tabs.Content value="equilibrium">
                <Equilibrium />
              </Tabs.Content>
            </Tabs.Root>
          </VStack>
        </Card.Body>
        <Card.Footer />
      </Card.Root>
    </Center>
  );
};
