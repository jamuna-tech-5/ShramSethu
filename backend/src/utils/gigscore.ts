interface GigScoreInput {
  incomeConsistency: number;    // 0-100 (30% weight)
  customerRatings: number;      // 0-5 star → normalized (20% weight)
  jobCompletionRate: number;    // 0-100 (15% weight)
  yearsExperience: number;      // raw years → normalized (15% weight)
  financialBehaviour: number;   // 0-100 (10% weight)
  digitalReputation: number;    // 0-100 (10% weight)
}

export const calculateGigScore = (input: GigScoreInput): number => {
  const weights = {
    incomeConsistency: 0.30,
    customerRatings: 0.20,
    jobCompletionRate: 0.15,
    yearsExperience: 0.15,
    financialBehaviour: 0.10,
    digitalReputation: 0.10
  };

  // Normalize customer ratings (0-5) to 0-100
  const normalizedRating = (input.customerRatings / 5) * 100;

  // Normalize years experience (cap at 10 years = 100)
  const normalizedExperience = Math.min(input.yearsExperience * 10, 100);

  const score =
    input.incomeConsistency * weights.incomeConsistency +
    normalizedRating * weights.customerRatings +
    input.jobCompletionRate * weights.jobCompletionRate +
    normalizedExperience * weights.yearsExperience +
    input.financialBehaviour * weights.financialBehaviour +
    input.digitalReputation * weights.digitalReputation;

  // Scale to 300-900 range (similar to credit score)
  return Math.round(300 + (score / 100) * 600);
};

export const getGigScoreLabel = (score: number): string => {
  if (score >= 800) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 600) return 'Fair';
  if (score >= 500) return 'Average';
  return 'Poor';
};

export const getLoanEligibility = (score: number): {
  eligible: boolean;
  maxAmount: number;
  interestRate: number;
  message: string;
} => {
  if (score >= 750) {
    return { eligible: true, maxAmount: 200000, interestRate: 12, message: 'Highly eligible for loans up to ₹2 Lakh' };
  } else if (score >= 650) {
    return { eligible: true, maxAmount: 100000, interestRate: 16, message: 'Eligible for loans up to ₹1 Lakh' };
  } else if (score >= 550) {
    return { eligible: true, maxAmount: 50000, interestRate: 20, message: 'Eligible for micro loans up to ₹50,000' };
  } else if (score >= 450) {
    return { eligible: true, maxAmount: 20000, interestRate: 24, message: 'Eligible for small loans up to ₹20,000' };
  } else {
    return { eligible: false, maxAmount: 0, interestRate: 0, message: 'Improve your GigScore to become loan eligible' };
  }
};