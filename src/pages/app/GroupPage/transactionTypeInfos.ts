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
