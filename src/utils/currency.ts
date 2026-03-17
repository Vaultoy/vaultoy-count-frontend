import { floatCentsToString } from "./textGeneration";
import { createListCollection, type ListCollection } from "@chakra-ui/react";

export const DEFAULT_CURRENCY_SYMBOL = "¤";

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

interface AllCurrencyInfo {
  mostCommon: CurrencyInfo[];
  others: CurrencyInfo[];
}

interface CurrencySelectItem {
  label: string;
  value: string;
  name: string;
  symbol: string;
}

export interface AllCurrencySelectItems {
  mostCommonCurrencyItems: CurrencySelectItem[];
  otherCurrencyItems: CurrencySelectItem[];
  currencyCollection: ListCollection<CurrencySelectItem>;
}

const MOST_COMMON_CURRENCIES = [
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
];

const currencyDisplayNames = new Intl.DisplayNames(["en"], {
  type: "currency",
});

export const getCurrencyInfo = (code: string): CurrencyInfo => {
  const name = currencyDisplayNames.of(code) ?? code;
  const symbol =
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? code;

  return { code, name, symbol };
};

const getAllCurrencies = (): AllCurrencyInfo => {
  const otherCodes = Intl.supportedValuesOf("currency").filter(
    (code) => !MOST_COMMON_CURRENCIES.includes(code),
  );

  return {
    mostCommon: MOST_COMMON_CURRENCIES.map(getCurrencyInfo),
    others: otherCodes.map(getCurrencyInfo),
  };
};

let memoizedCurrenciesSelectItems: AllCurrencySelectItems | null = null;

export const getAllCurrenciesSelectItems = (): AllCurrencySelectItems => {
  if (!memoizedCurrenciesSelectItems) {
    const currencies = getAllCurrencies();

    const mostCommonCurrencyItems = currencies.mostCommon.map((currency) => ({
      label: `${currency.code}  •  ${currency.symbol}  •  ${currency.name}`,
      value: currency.code,
      name: currency.name,
      symbol: currency.symbol,
    }));
    const otherCurrencyItems = currencies.others.map((currency) => ({
      label: `${currency.code}  •  ${currency.symbol}  •  ${currency.name}`,
      value: currency.code,
      name: currency.name,
      symbol: currency.symbol,
    }));
    const currencyCollection = createListCollection({
      items: [...mostCommonCurrencyItems, ...otherCurrencyItems],
    });

    memoizedCurrenciesSelectItems = {
      mostCommonCurrencyItems,
      otherCurrencyItems,
      currencyCollection,
    };
  }

  return memoizedCurrenciesSelectItems;
};

export const EMPTY_LIST_COLLECTION = createListCollection({
  items: [] as CurrencySelectItem[],
});

export const displayAmount = (
  amount: number,
  currencyInfo: CurrencyInfo | undefined,
) => {
  const amountInCurrencyUnit = amount / 100;

  if (!currencyInfo?.code) {
    return `${floatCentsToString(amount)}\u00A0${DEFAULT_CURRENCY_SYMBOL}`;
  }

  try {
    return new Intl.NumberFormat(currencyInfo.code !== "EUR" ? "en" : "fr", {
      style: "currency",
      currency: currencyInfo.code,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amountInCurrencyUnit);
  } catch {
    const symbol = currencyInfo.symbol ?? DEFAULT_CURRENCY_SYMBOL;
    return `${floatCentsToString(amount)}\u00A0${symbol}`;
  }
};
