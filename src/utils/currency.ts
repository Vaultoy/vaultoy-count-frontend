import { useMemo } from "react";

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

interface AllCurrencyInfo {
  mostCommon: CurrencyInfo[];
  others: CurrencyInfo[];
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

export const getCurrencyInfo = (code: string): CurrencyInfo => {
  const name =
    new Intl.DisplayNames(["en"], { type: "currency" }).of(code) ?? code;
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

export const useAllCurrencies = () => {
  return useMemo<AllCurrencyInfo>(() => {
    const otherCodes = Intl.supportedValuesOf("currency").filter(
      (code) => !MOST_COMMON_CURRENCIES.includes(code),
    );

    return {
      mostCommon: MOST_COMMON_CURRENCIES.map(getCurrencyInfo),
      others: otherCodes.map(getCurrencyInfo),
    };
  }, []);
};
