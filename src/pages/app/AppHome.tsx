import { toaster } from "../../components/ui/toaster";
import { createGroupMutation, getGroupsQuery } from "../../api/group";
import {
  AbsoluteCenter,
  Button,
  Card,
  CloseButton,
  Dialog,
  Field,
  Flex,
  Heading,
  Input,
  Portal,
  VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FaAngleDoubleRight, FaPlus } from "react-icons/fa";
import { NavLink } from "react-router";

const formValuesSchema = z.object({
  name: z.string().min(3).max(100),
});

export const AppHomePage = () => {
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["getGroupsAll"],
    queryFn: getGroupsQuery,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    any,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const mutation = useMutation({
    mutationFn: createGroupMutation,
    onSuccess: async (data) => {
      if (data.status !== 200) {
        toaster.create({
          title: "An unknown error occurred",
          description: `Try to refresh your page or try again later. Status: ${data.status}.`,
          type: "error",
        });

        return;
      }

      toaster.create({
        title: "Group created successfully",
        type: "success",
      });

      setOpen(false);
    },
    onError: (error) => {
      console.error("Login failed", error);

      toaster.create({
        title: "An unknown error occurred",
        description: `Try to refresh your page or try again later.`,
        type: "error",
      });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    mutation.mutate({
      name: data.name,
    });
  });

  return (
    <>
      <AbsoluteCenter>
        <VStack>
          App Home
          {(data?.groups ?? []).map((group) => (
            <NavLink to={`/app/group/${group.id}`} key={group.id}>
              <Card.Root width="40em">
                <Card.Body>
                  <Flex alignItems="center" justifyContent="space-between">
                    <Heading>{group.name}</Heading>
                    <FaAngleDoubleRight size="2em" color="gray" />
                  </Flex>
                </Card.Body>
              </Card.Root>
            </NavLink>
          ))}
          <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
            <Dialog.Trigger asChild>
              <Button variant="outline">
                <FaPlus /> Create Group
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Create Group</Dialog.Title>
                  </Dialog.Header>
                  <form onSubmit={onSubmit}>
                    <Dialog.Body>
                      <Field.Root invalid={!!errors.name}>
                        <Field.Label>Group name</Field.Label>
                        <Input {...register("name")} />
                        <Field.ErrorText>
                          {errors.name?.message}
                        </Field.ErrorText>
                      </Field.Root>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                      </Dialog.ActionTrigger>
                      <Button type="submit">Create</Button>
                    </Dialog.Footer>
                  </form>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </VStack>
      </AbsoluteCenter>
    </>
  );
};
