import {
  EXPENSE,
  postAddTransactionMutation,
  REPAYMENT,
  REVENUE,
  TRANSACTION_TYPES,
} from "@/api/group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { toaster } from "@/components/ui/toast-store";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { encryptNumber, encryptString } from "@/encryption/encryption";
import {
  UNKNOWN_ERROR_TOAST,
  unknownErrorToastWithStatus,
} from "@/components/toastMessages";
import {
  CURRENCY_SYMBOL,
  floatCentsToString,
  getForText,
  getPaidByText,
} from "@/utils/textGeneration";
import { checkResponseError } from "@/utils/checkResponseError";
import { checkResponseJson } from "@/utils/checkResponseJson";
import { GroupContext } from "@/contexts/GroupContext";
import { LuPencilLine } from "react-icons/lu";

const formValuesSchema = z
  .object({
    // size enforced in the refine
    name: z.string(),
    fromMemberId: z
      .array(z.string())
      .min(1, "Select exactly one member")
      .max(1, "Select exactly one member")
      .transform((val) => Number(val[0])),
    toMembers: z
      .array(z.object({ id: z.string(), share: z.number() }))
      .min(1, "Select at least one member")
      .transform((vals) =>
        vals.map((val) => ({
          id: Number(val.id),
          share: val.share,
        })),
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
    transactionType: z.enum(TRANSACTION_TYPES),
  })
  .refine(
    (data): boolean => {
      switch (data.transactionType) {
        case EXPENSE:
          return true;
        case REPAYMENT:
          return data.toMembers.length === 1;
        case REVENUE:
          return true;
      }
    },
    {
      message:
        "Please select only one member to repay, or create an expense or revenue instead",
      path: ["toMembers"],
    },
  )
  .refine(
    (data): boolean => {
      switch (data.transactionType) {
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

const defaultValuesDefault: z.input<typeof formValuesSchema> = {
  name: "",
  fromMemberId: [],
  toMembers: [],
  amount: "",
  transactionType: EXPENSE,
};

/**
 * If editTransactionId is provided, the dialog will call the edit transaction API instead of the add transaction API.
 */
export const AddEditTransactionDialog = ({
  defaultValues = defaultValuesDefault,
  editTransactionId,
}: {
  defaultValues?: z.input<typeof formValuesSchema>;
  editTransactionId?: number;
}) => {
  const { group } = useContext(GroupContext);

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
    defaultValues: defaultValues,
  });

  const transactionType = watch("transactionType");
  const totalShares = (watch("toMembers") ?? []).reduce(
    (acc, curr) => acc + curr.share,
    0,
  );
  const amount = watch("amount");

  const addMutation = useMutation({
    mutationFn: postAddTransactionMutation,
    onSuccess: async (data) => {
      const responseData = await checkResponseJson(data);
      if (await checkResponseError(data.status, responseData)) {
        return;
      }

      if (data.status !== 200) {
        toaster.create(unknownErrorToastWithStatus(data.status));
        return;
      }

      toaster.create({
        title: "Transaction added successfully",
        type: "success",
      });

      setOpen(false);
      // Also reset errors
      reset(defaultValues, { keepErrors: false });
      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id],
      });
    },
    onError: (error) => {
      console.error("Login failed", error);
      toaster.create(UNKNOWN_ERROR_TOAST);
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!group) {
      console.error("Group data is undefined");
      toaster.create(UNKNOWN_ERROR_TOAST);
      return;
    }

    const amountSign = transactionType === REVENUE ? -1 : 1;

    if (editTransactionId !== undefined) {
      toaster.create({
        title: "Editing transactions is not implemented yet",
        type: "warning",
      });
      return;
    }

    addMutation.mutate({
      groupId: group.id,
      transactionData: {
        name: await encryptString(
          data.transactionType === REPAYMENT ? "Repayment" : data.name,
          group.groupEncryptionKey,
          "group transaction name",
        ),
        amount: await encryptNumber(
          Math.round(amountSign * data.amount * 100),
          group.groupEncryptionKey,
          "group transaction amount",
        ),
        fromMemberId: await encryptNumber(
          data.fromMemberId,
          group.groupEncryptionKey,
          "group transaction from member id",
        ),
        toMembers: await Promise.all(
          data.toMembers.map(async (toMember) => ({
            memberId: await encryptNumber(
              toMember.id,
              group.groupEncryptionKey,
              "group transaction to member id",
            ),
            share: await encryptNumber(
              toMember.share,
              group.groupEncryptionKey,
              "group transaction to member share",
            ),
          })),
        ),

        transactionType: await encryptString(
          data.transactionType,
          group.groupEncryptionKey,
          "group transaction type",
        ),
        date: await encryptNumber(
          Date.now(),
          group.groupEncryptionKey,
          "group transaction date",
        ),
      },
    });
  });

  const membersSelector = createListCollection({
    items:
      group?.members.map((member) => ({
        label: member.nickname,
        value: member.memberId.toString(), // For some weird reason, Select only works with strings
      })) ?? [],
  });

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>
        {editTransactionId === undefined ? (
          <Button variant="outline" disabled={!group}>
            <FaPlus /> Add a transaction
          </Button>
        ) : (
          <Button variant="outline" disabled={!group}>
            <LuPencilLine /> Edit
          </Button>
        )}
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {editTransactionId === undefined
                  ? "Add a transaction"
                  : "Edit transaction"}
              </Dialog.Title>
            </Dialog.Header>
            <form onSubmit={onSubmit}>
              <Dialog.Body>
                <VStack gap="1em">
                  <Center>
                    <Controller
                      control={control}
                      name="transactionType"
                      render={({ field }) => (
                        <Field.Root invalid={!!errors.transactionType}>
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

                  {transactionType !== REPAYMENT && (
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

                  <Field.Root invalid={!!errors.fromMemberId}>
                    <Field.Label>{getPaidByText(transactionType)}</Field.Label>
                    <Controller
                      control={control}
                      name="fromMemberId"
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
                      {errors.fromMemberId?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Fieldset.Root invalid={!!errors.toMembers}>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text>{getForText(transactionType, 42)}</Text>

                      {transactionType !== REPAYMENT && <Text>Shares</Text>}
                    </HStack>

                    <Controller
                      control={control}
                      name="toMembers"
                      render={({ field }) => {
                        if (
                          transactionType === EXPENSE ||
                          transactionType === REVENUE
                        ) {
                          return (
                            <CheckboxGroup
                              invalid={!!errors.toMembers}
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
                                          )}
                                          &nbsp;
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
                      {errors.toMembers?.message}
                    </Fieldset.ErrorText>
                  </Fieldset.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button type="submit" loading={addMutation.isPending}>
                  {editTransactionId === undefined ? "Add" : "Edit"}
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
