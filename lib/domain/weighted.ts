import { OPEN_STAGES } from './stages'
export const weightedValue = (value: number, probability: number) => Math.round((value ?? 0) * (probability ?? 0) / 100)
type DealLike = { value_sgd: number; probability: number; stage: string }
export const totalWeighted = (deals: DealLike[]) =>
  deals.filter((d) => (OPEN_STAGES as readonly string[]).includes(d.stage))
       .reduce((sum, d) => sum + weightedValue(d.value_sgd, d.probability), 0)
