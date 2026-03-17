import { HStack, Select, Text } from "@chakra-ui/react";

export const SelectItemCurrency = ({
  currency,
}: {
  currency: {
    label: string;
    value: string;
    name: string;
    symbol: string;
  };
}) => (
  <Select.Item item={currency}>
    <HStack>
      <Select.ItemText fontWeight="bold" width="3em" textAlign="center">
        {currency.value}
      </Select.ItemText>

      <Text as="span" color="gray.500" width="3em" textAlign="center">
        {currency.symbol}
      </Text>
      <Text as="span" color="gray.500" textAlign="center">
        {currency.name}
      </Text>
    </HStack>
    <Select.ItemIndicator />
  </Select.Item>
);
