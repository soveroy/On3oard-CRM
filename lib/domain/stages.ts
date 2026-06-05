export const DEFAULT_STAGES = ['Lead','Qualified','Discovery','Proposal Sent','Negotiation','Won','Lost'] as const
export type Stage = (typeof DEFAULT_STAGES)[number]
export const OPEN_STAGES = ['Lead','Qualified','Discovery','Proposal Sent','Negotiation'] as const satisfies readonly Stage[]
