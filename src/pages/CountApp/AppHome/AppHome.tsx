import { getGroupsQuery, type Group } from "@/api/group";
import {
  Card,
  Center,
  Flex,
  Heading,
  VStack,
  Text,
  Skeleton,
  HStack,
  SkeletonCircle,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { FaAnglesRight } from "react-icons/fa6";
import { NavLink } from "react-router";
import { UserContext } from "@/contexts/UserContext";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { useQueryApi } from "@/api/useQueryApi";
import { FcConferenceCall, FcFolder } from "react-icons/fc";
import { decryptGroupForAppHomePage } from "@/encryption/groupEncryption";
import { type Result } from "@/types";
import { TbFaceIdError } from "react-icons/tb";

export const AppHomePage = () => {
  const user = useContext(UserContext);

  const { body, isError } = useQueryApi({
    queryKey: ["getGroupsAll"],
    queryFn: getGroupsQuery,
  });

  const [decryptedGroups, setDecryptedGroups] = useState<
    Result<Group<false>>[] | undefined
  >(undefined);

  useEffect(() => {
    const decryptGroups = async () => {
      if (!user || !user.user || !body || !body.groups) return;

      const groups = await Promise.all(
        body.groups.map(async (group) =>
          decryptGroupForAppHomePage(group, user!.user!.userEncryptionKey),
        ),
      );

      if (!active) return;
      setDecryptedGroups(groups);
    };

    let active = true;
    decryptGroups();
    return () => {
      active = false;
    };
  }, [user, body]);

  return (
    <Center>
      <VStack marginTop="3em" width={{ base: "94%", md: "70%", lg: "60%" }}>
        <Heading
          fontSize="3xl"
          marginBottom="1em"
          display="flex"
          alignItems="center"
          gap="0.5em"
        >
          <FcFolder size="1.5em" /> Your groups
        </Heading>
        {decryptedGroups?.length === 0 && (
          <Text>🙅 You are not in any groups yet.</Text>
        )}
        {decryptedGroups?.map((group) => (
          <NavLink
            to={group.isOk ? `/app/group/${group.id}` : "#"}
            key={group.id}
            style={{
              width: "100%",
              cursor: group.isOk ? "pointer" : "not-allowed",
            }}
          >
            <Card.Root color={group.isOk ? "black" : "gray.400"}>
              <Card.Body>
                <Flex alignItems="center" justifyContent="space-between">
                  <VStack alignItems="flex-start">
                    <Heading
                      marginRight="1em"
                      display="flex"
                      alignItems="center"
                      gap="0.5em"
                    >
                      {group.isOk ? (
                        <FcConferenceCall size="1.7em" />
                      ) : (
                        <TbFaceIdError size="1.7em" />
                      )}{" "}
                      {group.name}
                    </Heading>
                    {!group.isOk && (
                      <Text fontSize="sm" color="gray.400">
                        Please contact the support for help.
                      </Text>
                    )}
                  </VStack>
                  <FaAnglesRight size="1.6em" />
                </Flex>
              </Card.Body>
            </Card.Root>
          </NavLink>
        ))}
        {!isError &&
          !decryptedGroups &&
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card.Root key={i} width="100%">
                <Card.Body>
                  <Flex alignItems="center" justifyContent="space-between">
                    <HStack>
                      <SkeletonCircle size="1.4em" marginRight="0.1em" />
                      <Skeleton height="1.5em" width="15em" marginRight="1em" />
                    </HStack>
                    <Skeleton height="1.6em" width="1.6em" />
                  </Flex>
                </Card.Body>
              </Card.Root>
            ))}
        {isError && (
          <Text>
            ❌ An unknown error occurred while loading groups. Please try again
            later.
          </Text>
        )}
        <CreateGroupDialog />
      </VStack>
    </Center>
  );
};
