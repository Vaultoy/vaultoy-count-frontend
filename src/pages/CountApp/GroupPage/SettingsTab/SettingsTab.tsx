import { GroupContext } from "@/contexts/GroupContext";
import { Card, HStack, VStack, Text, Skeleton, Button } from "@chakra-ui/react";
import { useContext } from "react";
import { FaUser, FaUserSlash } from "react-icons/fa";
import { LuCrown } from "react-icons/lu";
import { EditMemberDialog } from "./EditMemberDialog";
import { AddMemberDialog } from "./AddMemberDialog";
import { MdOutlineEdit } from "react-icons/md";

export const SettingsTab = () => {
  const { group, groupError } = useContext(GroupContext);

  return (
    <VStack gap={{ base: "0.5em", md: "1em" }}>
      <AddMemberDialog />

      {group?.members.map((member) => (
        <Card.Root key={member.memberId} width="100%">
          <Card.Body padding="0">
            <HStack
              justifyContent="space-between"
              alignItems="center"
              margin="1em"
            >
              <VStack
                alignItems="flex-start"
                gap="0"
                justifyContent="center"
                height="100%"
              >
                <Text>{member.nickname}</Text>

                <HStack fontSize="0.9em" color="gray.400" gap="0.3em">
                  {member.username ? <FaUser /> : <FaUserSlash />}{" "}
                  <Text>{member.username ?? "Didn't join yet"}</Text>
                  {member.rights === "admin" && member.userId !== null && (
                    <>
                      <Text> • </Text>
                      <LuCrown />
                      <Text>Admin</Text>
                    </>
                  )}
                </HStack>
              </VStack>

              <EditMemberDialog memberId={member.memberId} />
            </HStack>
          </Card.Body>
        </Card.Root>
      ))}

      {!group &&
        !groupError &&
        Array(3)
          .fill(0)
          .map((_, i) => (
            <Card.Root key={i} width="100%">
              <Card.Body padding="0">
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  margin="1em"
                >
                  <VStack
                    alignItems="flex-start"
                    gap="0.85em"
                    justifyContent="center"
                    height="100%"
                  >
                    <Skeleton height="1.1em" width="10em" />

                    <Skeleton height="0.9em" width="6em" />
                  </VStack>

                  <Button variant="outline" size="sm" disabled>
                    <MdOutlineEdit />
                    Edit
                  </Button>
                </HStack>
              </Card.Body>
            </Card.Root>
          ))}
    </VStack>
  );
};
