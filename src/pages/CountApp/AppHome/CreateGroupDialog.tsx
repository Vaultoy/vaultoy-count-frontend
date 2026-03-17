import { toaster } from "@/components/ui/toast-store";
import { createGroupMutation } from "@/api/group";
import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  HStack,
  Select,
  VStack,
  Center,
  Text,
  Separator,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { UserContext } from "@/contexts/UserContext";
import { UNEXPECTED_ERROR_TOAST } from "@/components/toastMessages";
import { useMutationApi } from "@/api/useMutationApi";
import { useAllCurrenciesSelectItems } from "@/utils/currency";
import { SelectItemCurrency } from "@/components/SelectItemCurrency";
import { encryptNewGroup } from "@/encryption/groupEncryption";

const formValuesSchema = z.object({
  name: z.string().min(3).max(100),
  currency: z.string().length(3),
  selfMemberNickname: z.string().min(3).max(100),
  memberNicknames: z.array(z.string().min(3).max(100)),
});

export const CreateGroupDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const user = useContext(UserContext);

  const { mostCommonCurrencyItems, otherCurrencyItems, currencyCollection } =
    useAllCurrenciesSelectItems();

  const {
    register,
    handleSubmit,
    control,

    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
    defaultValues: {
      currency: "USD",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "memberNicknames" as never,
  });

  const mutation = useMutationApi({
    mutationFn: createGroupMutation,
    onSuccess: async () => {
      toaster.create({
        title: "Group created successfully",
        type: "success",
      });

      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["getGroupsAll"] });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!user || !user.user?.userEncryptionKey) {
      toaster.create(UNEXPECTED_ERROR_TOAST);
      return;
    }

    const encryptedNewGroup = await encryptNewGroup(
      {
        name: data.name,
        currency: data.currency,
        selfMemberNickname: data.selfMemberNickname,
        memberNicknames: data.memberNicknames,
      },
      user.user.userEncryptionKey,
    );

    mutation.mutate(encryptedNewGroup);
  });

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild marginTop="1em">
        <Button variant="outline">
          <FaPlus /> Create a group
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create a group</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={onSubmit}>
              <Dialog.Body>
                <Field.Root invalid={!!errors.name}>
                  <Field.Label>Group name</Field.Label>
                  <Input {...register("name")} />
                  <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.currency} marginTop="1em">
                  <Field.Label>Currency</Field.Label>

                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <Select.Root
                        name={field.name}
                        value={field.value ? [field.value] : []}
                        onValueChange={({ value }) => field.onChange(value[0])}
                        onInteractOutside={() => field.onBlur()}
                        collection={currencyCollection}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Select currency" />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content zIndex={2000}>
                            {mostCommonCurrencyItems.map((currency) => (
                              <SelectItemCurrency
                                currency={currency}
                                key={currency.value}
                              />
                            ))}

                            <Separator margin="1em" />

                            {otherCurrencyItems.map((currency) => (
                              <SelectItemCurrency
                                currency={currency}
                                key={currency.value}
                              />
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    )}
                  />

                  <Field.ErrorText>{errors.currency?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root
                  invalid={!!errors.selfMemberNickname}
                  marginTop="1em"
                >
                  <Field.Label>Your nickname in this group</Field.Label>
                  <Input {...register("selfMemberNickname")} />
                  <Field.ErrorText>
                    {errors.selfMemberNickname?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root
                  invalid={!!errors.memberNicknames}
                  width="100%"
                  marginTop="1em"
                >
                  <Text fontWeight="bold">Other members&apos; nicknames</Text>
                  <VStack
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                  >
                    {fields.map((fieldItem, index) => (
                      <Field.Root
                        key={fieldItem.id}
                        marginBottom="0.1em"
                        invalid={!!errors.memberNicknames?.[index]}
                      >
                        <HStack gap="0.5em" alignItems="stretch" width="100%">
                          <Input
                            width="100%"
                            {...register(`memberNicknames.${index}`)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            padding="0"
                            color={"red.600"}
                            onClick={() => remove(index)}
                          >
                            <FaRegTrashAlt />
                          </Button>
                        </HStack>
                        <Field.ErrorText>
                          {errors.memberNicknames?.[index]?.message}
                        </Field.ErrorText>
                      </Field.Root>
                    ))}
                  </VStack>

                  <Field.ErrorText>
                    {errors.memberNicknames?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Center>
                  <Button
                    marginTop="1em"
                    variant="outline"
                    onClick={() => {
                      append("");
                    }}
                  >
                    <FaPlus /> Add an other member
                  </Button>
                </Center>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button type="submit" loading={mutation.isPending}>
                  <FaPlus /> Create
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
