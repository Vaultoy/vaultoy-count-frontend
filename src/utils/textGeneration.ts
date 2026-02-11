import { type TransactionType, EXPENSE, REPAYMENT, REVENUE } from "@/api/group";

export const getPaidByText = (transactionType: TransactionType): string => {
  switch (transactionType) {
    case EXPENSE:
      return "Paid by";
    case REPAYMENT:
      return "Repaid by";
    case REVENUE:
      return "Received by";
  }
};

export const getForText = (transactionType: TransactionType): string => {
  switch (transactionType) {
    case EXPENSE:
      return "For";
    case REPAYMENT:
      return "To";
    case REVENUE:
      return "Split among";
  }
};

export const floatCentsToString = (amount: number): string => {
  if (isNaN(amount)) {
    return "0";
  }

  if (!isFinite(amount)) {
    return amount > 0 ? "∞" : "-∞";
  }

  if ((amount / 100) % 1 === 0) {
    return (amount / 100).toFixed(0);
  } else {
    return (amount / 100).toFixed(2);
  }
};

// TODO: Make this user configurable
export const CURRENCY_SYMBOL = "€";
