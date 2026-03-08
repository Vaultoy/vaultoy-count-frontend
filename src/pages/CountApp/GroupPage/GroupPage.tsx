import { getGroupQuery } from "@/api/group";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { ErrorPage } from "@/pages/ErrorPage";
import {
  Card,
  Text,
  Heading,
  Button,
  Center,
  HStack,
  Tabs,
  Skeleton,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { useContext, useEffect } from "react";
import { ShareGroupDialog } from "./ShareGroupDialog";
import { TransactionsTab } from "./TransactionsTab/TransactionsTab";
import { EquilibriumTab } from "./EquilibriumTab/EquilibriumTab";
import {
  GroupContext,
  useDecryptAndSaveGroupToContext,
} from "@/contexts/GroupContext";
import { useQueryApi } from "@/api/useQueryApi";
import { FcConferenceCall } from "react-icons/fc";
import { MembersTab } from "./MembersTab/Members";

const validTabs = ["transactions", "balances", "members"] as const;

export const GroupPage = () => {
  const { groupId: groupIdString } = useParams<{ groupId: string }>();
  const groupId =
    groupIdString !== undefined && !isNaN(Number(groupIdString))
      ? Number(groupIdString)
      : undefined;

  const navigate = useNavigate();
  const { pathname: currentPath } = useLocation();

  const { body, isError: isQueryError } = useQueryApi({
    queryKey: ["getGroup", groupId],
    queryFn: () =>
      groupId !== undefined ? getGroupQuery(groupId) : Promise.resolve(null),
  });

  useDecryptAndSaveGroupToContext(body?.group, isQueryError);
  const { group, isError } = useContext(GroupContext);

  const currentTab =
    currentPath.split("/")[currentPath.split("/").length - 1] !== ""
      ? currentPath.split("/")[currentPath.split("/").length - 1]
      : currentPath.split("/")[currentPath.split("/").length - 2];

  useEffect(() => {
    if (!validTabs.includes(currentTab as (typeof validTabs)[number])) {
      navigate(`/app/group/${groupId}/transactions`, { replace: true });
    }
  }, [currentTab, groupId, navigate]);

  if (groupId === undefined) {
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
            {group && (
              <Heading
                marginRight="1em"
                display="flex"
                alignItems="center"
                gap="0.5em"
              >
                <FcConferenceCall size="1.7em" />
                {group.name}
              </Heading>
            )}{" "}
            {!isError && !group && <Skeleton height="2em" width="50%" />}
            {isError && (
              <Text marginBottom="1em">
                ❌ An unknown error occurred while loading the group. Please try
                again later.
              </Text>
            )}
          </Center>
        </Card.Header>
        <Card.Body>
          <Tabs.Root
            value={currentTab}
            width="100%"
            variant="enclosed"
            marginBottom="2em"
            onValueChange={(event) => {
              navigate(`/app/group/${groupId}/${event.value}`);
            }}
          >
            <Tabs.List width="100%" justifyContent="center">
              <Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
              <Tabs.Trigger value="balances">Balances</Tabs.Trigger>
              <Tabs.Trigger value="members">Members</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          <Routes>
            <Route path="/" element={<TransactionsTab />} />
            <Route path="/transactions" element={<TransactionsTab />} />
            <Route path="/balances" element={<EquilibriumTab />} />
            <Route path="/members" element={<MembersTab />} />
          </Routes>
        </Card.Body>
        <Card.Footer />
      </Card.Root>
    </Center>
  );
};
