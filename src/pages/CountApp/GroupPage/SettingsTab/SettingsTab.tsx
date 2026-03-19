import { GroupContext } from "@/contexts/GroupContext";
import {
  Card,
  HStack,
  VStack,
  Text,
  Skeleton,
  Button,
  Field,
  Editable,
  Select,
  Portal,
  Separator,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { FaUser, FaUserSlash } from "react-icons/fa";
import { LuCheck, LuCrown, LuPencilLine, LuX } from "react-icons/lu";
import { EditMemberDialog } from "./EditMemberDialog";
import { AddMemberDialog } from "./AddMemberDialog";
import { MdOutlineEdit } from "react-icons/md";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toaster } from "@/components/ui/toast-store";
import { Controller, useForm } from "react-hook-form";
import { useMutationApi } from "@/api/useMutationApi";
import { useQueryClient } from "@tanstack/react-query";
import { patchEditGroupCurrency, patchEditGroupName } from "@/api/group";
import { encryptString } from "@/encryption/encryption";
import {
  EMPTY_LIST_COLLECTION,
  getAllCurrenciesSelectItems,
  type AllCurrencySelectItems,
} from "@/utils/currency";
import { SelectItemCurrency } from "@/components/SelectItemCurrency";
import { DeleteGroupDialog } from "./DeleteGroupDialog";

const formValuesSchema = z.object({
  groupName: z.string().min(3).max(100),
});

export const SettingsTab = () => {
  const { group, groupError, selfMember } = useContext(GroupContext);
  const queryClient = useQueryClient();
  const [newCurrency, setNewCurrency] = useState("");
  const [currencySelectItems, setCurrencySelectItems] =
    useState<AllCurrencySelectItems>({
      mostCommonCurrencyItems: [],
      otherCurrencyItems: [],
      currencyCollection: EMPTY_LIST_COLLECTION,
    });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof formValuesSchema>,
    unknown,
    z.output<typeof formValuesSchema>
  >({
    resolver: zodResolver(formValuesSchema),
  });

  const editGroupNameMutation = useMutationApi({
    mutationFn: patchEditGroupName,
    onSuccess: async () => {
      toaster.create({
        title: "Group name edited successfully",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id],
      });
    },
  });

  const editGroupCurrencyMutation = useMutationApi({
    mutationFn: patchEditGroupCurrency,
    onSuccess: async () => {
      toaster.create({
        title: "Currency edited successfully",
        type: "success",
      });

      queryClient.invalidateQueries({
        queryKey: ["getGroup", group?.id],
      });
    },
  });

  const submitGroupCurrency = async () => {
    if (!group || !newCurrency) return;
    if (newCurrency === group.currency) return;

    editGroupCurrencyMutation.mutate({
      groupId: group.id,
      newGroupCurrency: await encryptString(
        newCurrency,
        group.groupEncryptionKey,
        "new group currency",
      ),
    });
  };

  const submitGroupName = () => {
    handleSubmit(async (data) => {
      if (!group) return;

      editGroupNameMutation.mutate({
        groupId: group.id,
        newGroupName: await encryptString(
          data.groupName,
          group.groupEncryptionKey,
          "new group name",
        ),
      });
    })();
  };

  useEffect(() => {
    if (group) {
      setValue("groupName", group.name);
      setNewCurrency(group.currency);
    }
  }, [group, setValue]);

  useEffect(() => {
    const loadCurrencies = () => {
      setCurrencySelectItems(getAllCurrenciesSelectItems());
    };

    // Defer setting the currency select items
    // to avoid making the initial render too heavy
    // (150 components to render)
    const timeoutId = window.setTimeout(loadCurrencies, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <VStack gap={{ base: "0.5em", md: "1em" }}>
      <Field.Root invalid={!!errors.groupName}>
        <Field.Label>Group name</Field.Label>
        {selfMember && selfMember?.rights !== "admin" && (
          <Text fontSize="0.9em" color="gray.500">
            Only admins can edit the group name
          </Text>
        )}

        <Controller
          name="groupName"
          control={control}
          render={({ field }) => (
            <Editable.Root
              value={field.value}
              onValueChange={(e) => field.onChange(e.value)}
              onValueCommit={submitGroupName}
              disabled={selfMember?.rights !== "admin"}
              width={{ base: "90%", md: "fit-content" }}
              selectOnFocus={false}
              activationMode="click"
              submitMode="none"
              defaultEdit={false}
              marginLeft="1em"
            >
              {!group && !groupError && (
                <Skeleton height="1.1em" width="10em" />
              )}

              <Editable.Preview />
              <Editable.Input />

              <Editable.Control>
                <Editable.EditTrigger asChild>
                  <Button variant="ghost" size="xs">
                    <LuPencilLine /> Edit
                  </Button>
                </Editable.EditTrigger>
                <Editable.SubmitTrigger asChild>
                  <Button size="xs" loading={editGroupNameMutation.isPending}>
                    <LuCheck /> Save
                  </Button>
                </Editable.SubmitTrigger>
                <Editable.CancelTrigger asChild>
                  <Button variant="outline" size="xs">
                    <LuX />
                  </Button>
                </Editable.CancelTrigger>
              </Editable.Control>
            </Editable.Root>
          )}
        />

        <Field.ErrorText>{errors.groupName?.message}</Field.ErrorText>
      </Field.Root>

      <VStack width="100%" alignItems="flex-start">
        <Text fontWeight="bold" fontSize="sm" width="100%" marginTop="1em">
          Currency
        </Text>
        {selfMember && selfMember.rights !== "admin" && (
          <Text fontSize="0.9em" color="gray.500">
            Only admins can edit the currency
          </Text>
        )}
        {(!selfMember || selfMember.rights === "admin") && (
          <Text fontSize="0.9em" color="gray.500">
            This setting only changes the currency symbol. No existing amounts
            will be converted.
          </Text>
        )}

        {!group && !groupError && (
          <Skeleton
            height="2em"
            width="12em"
            marginLeft="1em"
            marginTop="0.5em"
          />
        )}

        {group && (
          <HStack
            width={{ base: "90%", md: "fit-content" }}
            marginTop="0.5em"
            marginLeft="1em"
            justifyContent="center"
          >
            <Select.Root
              value={newCurrency ? [newCurrency] : []}
              onValueChange={({ value }) => setNewCurrency(value[0] ?? "")}
              collection={currencySelectItems.currencyCollection}
              disabled={selfMember?.rights !== "admin"}
              positioning={{ strategy: "fixed", hideWhenDetached: true }}
            >
              <Select.HiddenSelect />
              <Select.Control minWidth={{ base: "14em", md: "22em" }}>
                <Select.Trigger>
                  <Select.ValueText placeholder="" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content zIndex={2000}>
                    {currencySelectItems.mostCommonCurrencyItems.map(
                      (currency) => (
                        <SelectItemCurrency
                          currency={currency}
                          key={currency.value}
                        />
                      ),
                    )}

                    <Separator margin="1em" />

                    {currencySelectItems.otherCurrencyItems.map((currency) => (
                      <SelectItemCurrency
                        currency={currency}
                        key={currency.value}
                      />
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            {newCurrency !== group.currency && (
              <>
                <Button
                  size="xs"
                  onClick={submitGroupCurrency}
                  loading={editGroupCurrencyMutation.isPending}
                  disabled={!newCurrency || newCurrency === group.currency}
                >
                  <LuCheck /> Save
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setNewCurrency(group.currency);
                  }}
                >
                  <LuX />
                </Button>
              </>
            )}
          </HStack>
        )}
      </VStack>

      <Text
        fontWeight="bold"
        fontSize="sm"
        width="100%"
        marginTop="1em"
        marginBottom="0.5em"
      >
        Members
      </Text>

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

      <Separator margin="1em" width="100%" />

      <DeleteGroupDialog />
    </VStack>
  );
};
