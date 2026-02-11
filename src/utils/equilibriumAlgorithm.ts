const equilibriumAlgorithm = (equilibrium_vect: number[]) => {
  const paymentMatrix: number[][] = new Array(equilibrium_vect.length)
    .fill(0)
    .map(() => new Array(equilibrium_vect.length).fill(0));

  while (equilibrium_vect.some((balance) => balance != 0)) {
    const maxIndex = equilibrium_vect.reduce(
      (maxIdx, value, idx, arr) => (value > arr[maxIdx] ? idx : maxIdx),
      0,
    );
    const minIndex = equilibrium_vect.reduce(
      (minIdx, value, idx, arr) => (value < arr[minIdx] ? idx : minIdx),
      0,
    );

    const amountToPay = Math.min(
      equilibrium_vect[maxIndex],
      -equilibrium_vect[minIndex],
    );

    paymentMatrix[minIndex][maxIndex] += amountToPay;
    equilibrium_vect[maxIndex] -= amountToPay;
    equilibrium_vect[minIndex] += amountToPay;
  }

  return paymentMatrix;
};

export interface RepaymentsToMake {
  toUserId: number;
  amount: number;
}

/**
 * Given a mapping of userId to their balance, compute the repayments needed to reach equilibrium.
 *
 * @param membersBalances A mapping of userId to their balance (positive means they should receive money, negative means they owe money)
 * @returns A mapping of userId to a list of repayments they should make (toUserId and amount).
 */
export const computeEquilibriumRepayments = (
  membersBalances: Record<number, number>,
): Record<number, RepaymentsToMake[]> => {
  const balances = Object.values(membersBalances);

  const paymentMatrix = equilibriumAlgorithm(balances);

  const userIds = Object.keys(membersBalances).map((id) => parseInt(id));

  const repayments: Record<number, RepaymentsToMake[]> = {};

  for (let i = 0; i < paymentMatrix.length; i++) {
    for (let j = 0; j < paymentMatrix[i].length; j++) {
      if (paymentMatrix[i][j] > 0) {
        if (!repayments[userIds[i]]) {
          repayments[userIds[i]] = [];
        }
        repayments[userIds[i]].push({
          toUserId: userIds[j],
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

  for (const fromUserId in repayments) {
    const repaymentsList = repayments[fromUserId];
    for (const repayment of repaymentsList) {
      const { toUserId, amount } = repayment;
      computedBalances[fromUserId] += amount;
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
