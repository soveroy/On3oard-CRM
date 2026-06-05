import { describe, it, expect } from 'vitest'
import { buildMeetingPrepPrompt, buildFollowUpEmailPrompt } from '@/lib/ai/prompts'
describe('buildMeetingPrepPrompt', () => {
  it('includes deal stage, company, contact, and asks for talking points', () => {
    const p = buildMeetingPrepPrompt({
      deal: { name: 'PNH — Full 4D', stage: 'Discovery', value_sgd: 100800, engagement_type: 'Full 4D Engagement' },
      company: { name: 'PNH Group', industry: 'Marine' },
      contact: { full_name: 'Joseph Lim', job_title: 'CEO' },
      activities: [{ type: 'Call', subject: 'Intro', outcome: 'Positive', notes: 'Keen on automation' }],
    })
    expect(p).toContain('Discovery')
    expect(p).toContain('PNH Group')
    expect(p).toContain('Joseph Lim')
    expect(p.toLowerCase()).toContain('talking points')
  })
})
describe('buildFollowUpEmailPrompt', () => {
  it('includes the contact name and last interaction', () => {
    const p = buildFollowUpEmailPrompt({
      activity: { type: 'Meeting', subject: 'Scoping', outcome: 'Positive', notes: 'Wants a proposal' },
      contactName: 'Kavitha', company: 'NUP', dealStage: 'Proposal Sent',
    })
    expect(p).toContain('Kavitha')
    expect(p).toContain('Scoping')
  })
})
