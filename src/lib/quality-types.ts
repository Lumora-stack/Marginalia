export type QualityTier = 'ultra' | 'high' | 'medium' | 'low'

const tierOrder: QualityTier[] = ['low', 'medium', 'high', 'ultra']

export function qualityAtLeast(tier: QualityTier, minimum: QualityTier): boolean {
  return tierOrder.indexOf(tier) >= tierOrder.indexOf(minimum)
}
