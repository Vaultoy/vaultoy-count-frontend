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
  VStack,
  Icon,
  useBreakpointValue,
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
import { SettingsTab } from "./SettingsTab/SettingsTab";
import { TbFaceIdError } from "react-icons/tb";

const validTabs = ["transactions", "balances", "settings"] as const;

export const GroupPage = () => {
  const { groupId: groupIdString } = useParams<{ groupId: string }>();
  const groupId =
    groupIdString !== undefined && !isNaN(Number(groupIdString))
      ? Number(groupIdString)
      : undefined;

  const navigate = useNavigate();
  const { pathname: currentPath } = useLocation();

  const { body, queryError } = useQueryApi({
    queryKey: ["getGroup", groupId],
    queryFn: () =>
      groupId !== undefined ? getGroupQuery(groupId) : Promise.resolve(null),
  });

  useDecryptAndSaveGroupToContext(body, queryError);
  const { group, groupError } = useContext(GroupContext);

  const fitted = useBreakpointValue({ base: true, md: false });

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
            {!groupError && !group && <Skeleton height="2em" width="50%" />}
            {groupError && (
              <VStack>
                <Icon
                  as={TbFaceIdError}
                  height="4em"
                  width="4em"
                  color="gray.500"
                />
                <Text color="gray.600" textAlign="center">
                  {groupError.error === "MAINTENANCE" ? (
                    <>
                      To improve our service, we are currently performing a
                      maintenance. <br />
                      We will be back online as soon as possible!
                    </>
                  ) : groupError.error === "NOT_AUTHORIZED" ? (
                    <>
                      You are not authorized to view this group. <br />
                      The link you used might be invalid, or you might have been
                      kicked out of the group.
                    </>
                  ) : groupError.error === "DECRYPTION_ERROR" ? (
                    <>
                      There was an error while decrypting the group data. <br />
                      Please try to refresh the page, or contact the support for
                      help.
                    </>
                  ) : groupError.error === "NETWORK_ERROR" ? (
                    <>
                      Could not connect to the server. <br />
                      Please check your internet connection and try again.
                    </>
                  ) : groupError.error ===
                    "GROUP_NOT_FOUND_OR_USER_NOT_IN_GROUP" ? (
                    <>
                      Could not get this group.
                      <br />
                      You might not be a member of it, it might not exist, or
                      have been deleted.
                    </>
                  ) : (
                    <>
                      An unknown error occurred while loading the group data.
                      <br />
                      Please try to refresh the page, or contact the support for
                      help.
                    </>
                  )}
                </Text>
              </VStack>
            )}
          </Center>
        </Card.Header>
        <Card.Body
          display={groupError ? "none" : undefined}
          padding={{ base: "2em 1em 0 1em", md: "2em" }}
        >
          <Tabs.Root
            alignSelf="center"
            value={currentTab}
            width={{ base: "100%", md: "fit-content" }}
            minWidth={{ md: "60%" }}
            fitted={fitted}
            variant="enclosed"
            marginBottom="2em"
            onValueChange={(event) => {
              navigate(`/app/group/${groupId}/${event.value}`);
            }}
          >
            <Tabs.List
              width="100%"
              justifyContent="center"
              display={{ base: "flex", md: "grid" }}
              gridAutoFlow={{ md: "column" }}
              gridAutoColumns={{ md: "1fr" }}
            >
              <Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
              <Tabs.Trigger value="balances">Balances</Tabs.Trigger>
              <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          <Routes>
            <Route path="/" element={<TransactionsTab />} />
            <Route path="/transactions" element={<TransactionsTab />} />
            <Route path="/balances" element={<EquilibriumTab />} />
            <Route path="/settings" element={<SettingsTab />} />
          </Routes>
        </Card.Body>
        <Card.Footer />
      </Card.Root>
    </Center>
  );
};
