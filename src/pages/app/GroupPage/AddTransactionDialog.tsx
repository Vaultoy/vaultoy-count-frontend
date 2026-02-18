import {
  EXPENSE,
  postAddTransactionMutation,
  REPAYMENT,
  REVENUE,
  TRANSACTION_TYPES,
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
  SegmentGroup,
  HStack,
  Text,
  IconButton,
  InputGroup,
} from "@chakra-ui/react";
import { toaster } from "../../../components/ui/toast-store";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { encryptNumber, encryptString } from "@/utils/encryption";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import {
  CURRENCY_SYMBOL,
  floatCentsToString,
  getForText,
  getPaidByText,
} from "../../../utils/textGeneration";

const formValuesSchema = z
  .object({
    // size enforced in the refine
    name: z.string(),
    fromUserId: z
      .array(z.string())
      .min(1, "Select exactly one member")
      .max(1, "Select exactly one member")
      .transform((val) => Number(val[0])),
    toUsers: z
      .array(z.object({ id: z.string(), share: z.number() }))
      .min(1, "Select at least one member")
      .transform((vals) =>
        vals.map((val) => ({ id: Number(val.id), share: val.share })),
      ),
    amount: z
      .string()
      .transform((val) => Number(val))
      .pipe(
        z
          .number({
            error: "Amount must be a number",
          })
          .min(0.01),
      ),
    transaction_type: z.enum(TRANSACTION_TYPES),
  })
  .refine(
    (data): boolean => {
      switch (data.transaction_type) {
        case EXPENSE:
          return true;
        case REPAYMENT:
          return data.toUsers.length === 1;
        case REVENUE:
          return true;
      }
    },
    {
      message:
        "Please select only one member to repay, or create an expense or revenue instead",
      path: ["toUsers"],
    },
  )
  .refine(
    (data): boolean => {
      switch (data.transaction_type) {
        case EXPENSE:
          return data.name.length >= 3 && data.name.length <= 100;
        case REPAYMENT:
          return true;
        case REVENUE:
          return data.name.length >= 3 && data.name.length <= 100;
      }
    },
    {
      message: "The title must be between 3 and 100 characters long",
    },
  );

export const AddTransactionDialog = ({
  groupData,
}: {
  groupData: GroupExtended<false> | undefined;
}) => {
  const { groupId } = useParams<{ groupId: string }>();

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
    defaultValues: {
      name: "",
      fromUserId: undefined,
      toUsers: [],
      amount: "",
      transaction_type: EXPENSE,
    },
  });

  const transaction_type = watch("transaction_type");
  const totalShares = watch("toUsers").reduce(
    (acc, curr) => acc + curr.share,
    0,
  );
  const amount = watch("amount");

  const mutation = useMutation({
    mutationFn: postAddTransactionMutation,
    onSuccess: async (data) => {
      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));
        return;
      }

      toaster.create({
        title: "Transaction added successfully",
        type: "success",
      });

      setOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["getGroup", groupId] });
    },
    onError: (error) => {
      console.error("Login failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!groupData) {
      console.error("Group data is undefined");
      toaster.create(UNKNOWN_ERROR_TOAST);
      return;
    }

    const amountSign = transaction_type === REVENUE ? -1 : 1;

    mutation.mutate({
      groupId: groupId as string,
      transactionData: {
        name: await encryptString(
          data.transaction_type === REPAYMENT ? "Repayment" : data.name,
          groupData.groupEncryptionKey,
          "group transaction name",
        ),
        amount: await encryptNumber(
          Math.round(amountSign * data.amount * 100),
          groupData.groupEncryptionKey,
          "group transaction amount",
        ),
        fromUserId: await encryptNumber(
          data.fromUserId,
          groupData.groupEncryptionKey,
          "group transaction from user id",
        ),
        toUsers: await Promise.all(
          data.toUsers.map(async (toUser) => ({
            id: await encryptNumber(
              toUser.id,
              groupData.groupEncryptionKey,
              "group transaction to user id",
            ),
            share: await encryptNumber(
              toUser.share,
              groupData.groupEncryptionKey,
              "group transaction to user share",
            ),
          })),
        ),

        transactionType: await encryptString(
          data.transaction_type,
          groupData.groupEncryptionKey,
          "group transaction type",
        ),
        date: await encryptNumber(
          Date.now(),
          groupData.groupEncryptionKey,
          "group transaction date",
        ),
      },
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
          <Button variant="outline" width="fit-content" disabled={!groupData}>
            <FaPlus /> Add a transaction
          </Button>
        </Center>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Add a transaction</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={onSubmit}>
              <Dialog.Body>
                <VStack gap="1em">
                  <Center>
                    <Controller
                      control={control}
                      name="transaction_type"
                      render={({ field }) => (
                        <Field.Root invalid={!!errors.transaction_type}>
                          <SegmentGroup.Root
                            onBlur={field.onBlur}
                            name={field.name}
                            value={field.value}
                            onValueChange={({ value }) => field.onChange(value)}
                          >
                            <SegmentGroup.Indicator backgroundColor="white" />
                            <SegmentGroup.Items
                              items={TRANSACTION_TYPES.map((option) => ({
                                label:
                                  option.charAt(0).toUpperCase() +
                                  option.slice(1),
                                value: option,
                              }))}
                            />
                          </SegmentGroup.Root>
                        </Field.Root>
                      )}
                    />
                  </Center>

                  {transaction_type !== REPAYMENT && (
                    <Field.Root invalid={!!errors.name}>
                      <Field.Label>Title</Field.Label>

                      <Input {...register("name")} />
                      <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                    </Field.Root>
                  )}

                  <Field.Root invalid={!!errors.amount}>
                    <Field.Label>Amount</Field.Label>
                    <InputGroup endAddon={CURRENCY_SYMBOL}>
                      <Input
                        type="number"
                        step="0.01"
                        {...register("amount")}
                      />
                    </InputGroup>
                    <Field.ErrorText>{errors.amount?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.fromUserId}>
                    <Field.Label>{getPaidByText(transaction_type)}</Field.Label>
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

                  <Fieldset.Root invalid={!!errors.toUsers}>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text>{getForText(transaction_type)}</Text>

                      {transaction_type !== REPAYMENT && <Text>Shares</Text>}
                    </HStack>

                    <Controller
                      control={control}
                      name="toUsers"
                      render={({ field }) => {
                        if (
                          transaction_type === EXPENSE ||
                          transaction_type === REVENUE
                        ) {
                          return (
                            <CheckboxGroup
                              invalid={!!errors.toUsers}
                              value={field.value.map((val) => val.id)}
                              onValueChange={(value) =>
                                field.onChange(
                                  value.map((val) => {
                                    const existing = field.value.find(
                                      (v) => v.id === val,
                                    );
                                    return {
                                      id: val,
                                      share: existing ? existing.share : 1,
                                    };
                                  }),
                                )
                              }
                              name={field.name}
                              marginTop="0.5em"
                            >
                              <Fieldset.Content>
                                {membersSelector.items.map((item) => (
                                  <HStack
                                    key={item.value}
                                    justifyContent="space-between"
                                  >
                                    <Checkbox.Root value={item.value}>
                                      <Checkbox.HiddenInput />
                                      <Checkbox.Control />
                                      <Checkbox.Label>
                                        {item.label}
                                      </Checkbox.Label>
                                    </Checkbox.Root>
                                    <HStack gap="0.2em">
                                      <VStack
                                        gap="0"
                                        marginRight="0.5em"
                                        alignItems="flex-end"
                                      >
                                        <Text
                                          fontSize="sm"
                                          marginBottom="-0.2em"
                                        >
                                          {field.value.find(
                                            (v) => v.id === item.value,
                                          )?.share ?? 0}
                                          x
                                        </Text>
                                        <Text
                                          fontSize="sm"
                                          color="gray.500"
                                          marginTop="-0.2em"
                                        >
                                          {floatCentsToString(
                                            totalShares === 0
                                              ? 0
                                              : ((field.value.find(
                                                  (v) => v.id === item.value,
                                                )?.share ?? 0) /
                                                  totalShares) *
                                                  100 *
                                                  Number(amount),
                                          )}{" "}
                                          {CURRENCY_SYMBOL}
                                        </Text>
                                      </VStack>
                                      <IconButton
                                        size="xs"
                                        type="button"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const existing = field.value.find(
                                            (v) => v.id === item.value,
                                          );
                                          if (!existing) {
                                            field.onChange([
                                              ...field.value,
                                              {
                                                id: item.value,
                                                share: 1,
                                              },
                                            ]);
                                            return;
                                          }
                                          const newShare = existing.share + 1;
                                          field.onChange(
                                            field.value.map((v) =>
                                              v.id === item.value
                                                ? { ...v, share: newShare }
                                                : v,
                                            ),
                                          );
                                        }}
                                      >
                                        <FaPlus />
                                      </IconButton>
                                      <IconButton
                                        size="xs"
                                        type="button"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const existing = field.value.find(
                                            (v) => v.id === item.value,
                                          );
                                          if (!existing) return;
                                          const newShare = existing.share - 1;
                                          if (newShare <= 0) {
                                            field.onChange(
                                              field.value.filter(
                                                (v) => v.id !== item.value,
                                              ),
                                            );
                                          } else {
                                            field.onChange(
                                              field.value.map((v) =>
                                                v.id === item.value
                                                  ? { ...v, share: newShare }
                                                  : v,
                                              ),
                                            );
                                          }
                                        }}
                                      >
                                        <FaMinus />
                                      </IconButton>
                                    </HStack>
                                  </HStack>
                                ))}
                              </Fieldset.Content>
                            </CheckboxGroup>
                          );
                        } else {
                          return (
                            <Select.Root
                              name={field.name}
                              value={field.value.map((val) => val.id)}
                              onValueChange={({ value }) =>
                                field.onChange(
                                  value.map((val) => {
                                    const existing = field.value.find(
                                      (v) => v.id === val,
                                    );
                                    return {
                                      id: val,
                                      share: existing ? existing.share : 1,
                                    };
                                  }),
                                )
                              }
                              onInteractOutside={() => field.onBlur()}
                              collection={membersSelector}
                              marginTop="0.5em"
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
                                      <Select.Item
                                        item={member}
                                        key={member.value}
                                      >
                                        {member.label}
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select.Positioner>
                              </Portal>
                            </Select.Root>
                          );
                        }
                      }}
                    />

                    <Fieldset.ErrorText>
                      {errors.toUsers?.message}
                    </Fieldset.ErrorText>
                  </Fieldset.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button type="submit" loading={mutation.isPending}>
                  Add
                </Button>
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
