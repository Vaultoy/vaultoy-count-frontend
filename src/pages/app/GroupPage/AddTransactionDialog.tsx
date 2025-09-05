import {
  postAddTransactionMutation,
  type GroupExtended,
} from "../../../api/group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import {
  VStack,
  Button,
  Center,
  Dialog,
  Portal,
  Field,
  CloseButton,
  Input,
  Select,
  createListCollection,
  Fieldset,
  CheckboxGroup,
  Checkbox,
} from "@chakra-ui/react";
import { toaster } from "../../../components/ui/toaster";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

const formValuesSchema = z.object({
  name: z.string().min(3).max(100),
  fromUserId: z
    .array(z.string())
    .min(1, "Select exactly one member")
    .max(1, "Select exactly one member")
    .transform((val) => Number(val[0])),
  toUserIds: z
    .array(z.string())
    .min(1, "Select at least one member")
    .transform((vals) => vals.map((val) => Number(val))),
  amount: z
    .string()
    .transform((val) => Number(val))
    .pipe(
      z
        .number({
          error: "Amount must be a number",
        })
        .min(0.01)
    ),
});

export const AddTransactionDialog = ({
  groupData,
}: {
  groupData: GroupExtended | undefined;
}) => {
  const { groupId } = useParams<{ groupId: string }>();

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    any,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const mutation = useMutation({
    mutationFn: postAddTransactionMutation,
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
        title: "Transaction added successfully",
        type: "success",
      });

      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["getGroup", groupId] });
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
    console.log(data);
    mutation.mutate({
      groupId: groupId as string,
      name: data.name,
      amount: data.amount,
      fromUserId: 1, // TODO
      toUserIds: [1], // TODO
    });
  });

  const membersSelector = createListCollection({
    items:
      groupData?.members.map((member) => ({
        label: member.username,
        value: member.userId.toString(), // For some weird reason, Select only works with strings
      })) ?? [],
  });

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild marginTop="1em">
        <Center>
          <Button variant="outline" width="fit-content">
            <FaPlus /> Add a transaction
          </Button>
        </Center>
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
                <VStack gap="1em">
                  <Field.Root invalid={!!errors.name}>
                    <Field.Label>Title</Field.Label>
                    <Input {...register("name")} />
                    <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.amount}>
                    <Field.Label>Amount</Field.Label>
                    <Input type="number" {...register("amount")} />
                    <Field.ErrorText>{errors.amount?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.fromUserId}>
                    <Field.Label>Paid by</Field.Label>
                    <Controller
                      control={control}
                      name="fromUserId"
                      render={({ field }) => (
                        <Select.Root
                          name={field.name}
                          value={field.value}
                          onValueChange={({ value }) => field.onChange(value)}
                          onInteractOutside={() => field.onBlur()}
                          collection={membersSelector}
                        >
                          <Select.HiddenSelect />
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder="Select member" />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content zIndex={2000}>
                                {membersSelector.items.map((member) => (
                                  <Select.Item item={member} key={member.value}>
                                    {member.label}
                                    <Select.ItemIndicator />
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Portal>
                        </Select.Root>
                      )}
                    />

                    <Field.ErrorText>
                      {errors.fromUserId?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Fieldset.Root invalid={!!errors.toUserIds}>
                    <Fieldset.Legend>For</Fieldset.Legend>
                    <Controller
                      control={control}
                      name="toUserIds"
                      render={({ field }) => (
                        <CheckboxGroup
                          invalid={!!errors.toUserIds}
                          value={field.value}
                          onValueChange={field.onChange}
                          name={field.name}
                        >
                          <Fieldset.Content>
                            {membersSelector.items.map((item) => (
                              <Checkbox.Root
                                key={item.value}
                                value={item.value}
                              >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label>{item.label}</Checkbox.Label>
                              </Checkbox.Root>
                            ))}
                          </Fieldset.Content>
                        </CheckboxGroup>
                      )}
                    />

                    <Fieldset.ErrorText>
                      {errors.toUserIds?.message}
                    </Fieldset.ErrorText>
                  </Fieldset.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button type="submit">Add</Button>
              </Dialog.Footer>
            </form>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
