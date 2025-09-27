import { getGroupsQuery } from "../../../api/group";
import { Card, Center, Flex, Heading, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { FaAnglesRight } from "react-icons/fa6";
import { NavLink } from "react-router";
import { decryptEncryptionKey, decryptString } from "@/utils/encryption";
import { UserContext } from "@/contexts/UserContext";
import { CreateGroupDialog } from "./CreateGroupDialog";

export const AppHomePage = () => {
  const user = useContext(UserContext);

  const { data } = useQuery({
    queryKey: ["getGroupsAll"],
    queryFn: getGroupsQuery,
  });

  const [decryptedGroups, setDecryptedGroups] = useState<
    { id: number; name: string; encryptionKey: CryptoKey }[]
  >([]);

  useEffect(() => {
    const decryptGroups = async () => {
      if (!user || !user.user || !data || !data.groups) return;

      const groups = await Promise.all(
        data.groups.map(async (group) => {
          const groupEncryptionKey = await decryptEncryptionKey(
            group.groupEncryptionKey,
            user.user?.encryptionKey as CryptoKey
          );

          return {
            id: group.id,
            name: await decryptString(group.name, groupEncryptionKey),
            encryptionKey: groupEncryptionKey,
          };
        })
      );

      if (!active) return;
      setDecryptedGroups(groups);
    };

    let active = true;
    decryptGroups();
    return () => {
      active = false;
    };
  }, [user, data]);

  return (
    <Center>
      <VStack marginTop="3em" width={{ base: "94%", md: "70%", lg: "60%" }}>
        <Heading fontSize="3xl" marginBottom="1em">
          Your groups
        </Heading>
        {decryptedGroups.map((group) => (
          <NavLink
            to={`/app/group/${group.id}`}
            key={group.id}
            style={{ width: "100%" }}
          >
            <Card.Root>
              <Card.Body>
                <Flex alignItems="center" justifyContent="space-between">
                  <Heading marginRight="1em">{group.name}</Heading>
                  <FaAnglesRight size="1.6em" />
                </Flex>
              </Card.Body>
            </Card.Root>
          </NavLink>
        ))}
        <CreateGroupDialog />
      </VStack>
    </Center>
  );
};
