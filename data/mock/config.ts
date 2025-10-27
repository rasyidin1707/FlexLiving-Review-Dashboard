export type AutoApprovalRules = {
  ratingThreshold: number; // approve if ratingOverall >= threshold
  channels: string[]; // applicable channels
};

export const autoApprovalRules: AutoApprovalRules = {
  ratingThreshold: 8,
  channels: ["Airbnb", "Booking", "Google", "Hostaway"],
};

