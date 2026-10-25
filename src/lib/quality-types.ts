export type QualityTier = 'high' | 'medium' | 'low'

const tierOrder: QualityTier[] = ['low', 'medium', 'high']

export function qualityAtLeast(tier: QualityTier, minimum: QualityTier): boolean {
  return tierOrder.indexOf(tier) >= tierOrder.indexOf(minimum)
}
