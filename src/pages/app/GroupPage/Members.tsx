import { GroupContext } from "@/contexts/GroupContext";
import { Card, HStack, VStack, Text, Button } from "@chakra-ui/react";
import { useContext } from "react";
import { FaPlus, FaUser, FaUserSlash } from "react-icons/fa";
import { LuCrown } from "react-icons/lu";
import { EditMemberDialog } from "./EditMemberDialog";

export const Members = () => {
  const { group } = useContext(GroupContext);

  return (
    <VStack>
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
      <Button marginTop="1em">
        <FaPlus />
        Add a member
      </Button>
    </VStack>
  );
};
