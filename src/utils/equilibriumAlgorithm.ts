export interface RepaymentsToMake {
  toMemberId: number;
  amount: number;
}

interface MemberWithBalance {
  memberId: number;
  balance: number;
}

/**
 * Given a mapping of memberId to their balance, compute the repayments needed to reach equilibrium.
 *
 * @param membersBalances A mapping of memberId to their balance (positive means they should receive money, negative means they owe money)
 * @returns A mapping of memberId to a list of repayments they should make (toMemberId and amount).
 */
export const computeEquilibriumRepayments = (
  membersBalances: MemberWithBalance[],
): Record<number, RepaymentsToMake[]> => {
  const userIds = membersBalances.map((member) => member.memberId);
  const balances = membersBalances.map((member) => member.balance);
  const paymentMatrix: number[][] = new Array(balances.length)
    .fill(0)
    .map(() => new Array(balances.length).fill(0));

  // Compute repayments until all balances are zero
  let iterationCount = 0;
  // balance > 1 because we accept 1 cent of imbalance when there are rounding issues
  while (balances.some((balance) => balance > 1)) {
    const maxIndex = balances.reduce(
      (maxIdx, value, idx, arr) => (value > arr[maxIdx] ? idx : maxIdx),
      0,
    );
    const minIndex = balances.reduce(
      (minIdx, value, idx, arr) => (value < arr[minIdx] ? idx : minIdx),
      0,
    );

    const amountToPay = Math.min(balances[maxIndex], -balances[minIndex]);

    paymentMatrix[minIndex][maxIndex] += amountToPay;
    balances[maxIndex] -= amountToPay;
    balances[minIndex] += amountToPay;

    iterationCount++;
    if (iterationCount > balances.length) {
      console.error(
        "Equilibrium repayments algorithm is taking too long to converge, possible infinite loop. Input balances:",
        membersBalances,
        "Current balances:",
        balances,
      );
      return {};
    }
  }

  // Convert the payment matrix back to a list of repayments for each user
  const repayments: Record<number, RepaymentsToMake[]> = {};

  for (let i = 0; i < paymentMatrix.length; i++) {
    for (let j = 0; j < paymentMatrix[i].length; j++) {
      if (paymentMatrix[i][j] > 0) {
        if (!repayments[userIds[i]]) {
          repayments[userIds[i]] = [];
        }
        repayments[userIds[i]].push({
          toMemberId: userIds[j],
          amount: paymentMatrix[i][j],
        });
      }
    }
  }

  return repayments;
};

/* Example usage:

const verifyValidity = (
  balances: Record<number, number>,
  repayments: Record<number, RepaymentsToMake[]>,
) => {
  const computedBalances: Record<number, number> = {};

  for (const userId in balances) {
    computedBalances[userId] = balances[userId];
  }

  for (const fromMemberId in repayments) {
    const repaymentsList = repayments[fromMemberId];
    for (const repayment of repaymentsList) {
      const { toMemberId, amount } = repayment;
      computedBalances[fromMemberId] += amount;
      computedBalances[toUserId] -= amount;
    }
  }

  return Object.values(computedBalances).every((balance) => balance === 0);
};

const example = () => {
  const membersBalances = {
    1: -979,
    2: 2633,
    3: -1324,
    4: 0,
    5: -330,
  };

  // Verify example correctness
  let sum = 0;
  for (const balance of Object.values(membersBalances)) {
    sum += balance;
  }
  if (sum !== 0) {
    console.error(
      "Example balances do not sum to zero. Please check the input. Sum:",
      sum,
    );
    return;
  }

  const repayments = computeEquilibriumRepayments(membersBalances);

  console.info(repayments);

  if (!verifyValidity(membersBalances, repayments)) {
    console.error(
      "Computed repayments do not balance out the initial balances. Please check the algorithm implementation.",
    );
  }
};

example();
*/
