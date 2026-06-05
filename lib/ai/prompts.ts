type DealCtx = { name?: string | null; stage?: string | null; value_sgd?: number | null; engagement_type?: string | null }
type CompanyCtx = { name?: string | null; industry?: string | null } | null
type ContactCtx = { full_name?: string | null; job_title?: string | null } | null
type ActivityCtx = { type?: string | null; subject?: string | null; outcome?: string | null; notes?: string | null }

export function buildMeetingPrepPrompt(input: { deal: DealCtx; company: CompanyCtx; contact: ContactCtx; activities: ActivityCtx[] }): string {
  const { deal, company, contact, activities } = input
  const history = activities.map((a) =>
    `- ${a.type ?? 'Activity'}${a.subject ? `: ${a.subject}` : ''}${a.outcome ? ` (${a.outcome})` : ''}${a.notes ? ` — ${a.notes}` : ''}`,
  ).join('\n') || 'No prior activity logged.'
  return `You are On3oard's AI sales assistant. Brand voice: professional, direct, no fluff. Prepare a concise meeting-prep brief.

DEAL: ${deal.name ?? 'Untitled'} | Stage: ${deal.stage ?? 'Unknown'} | Engagement: ${deal.engagement_type ?? 'n/a'} | Value: SGD ${deal.value_sgd ?? 0}
COMPANY: ${company?.name ?? 'Unknown'}${company?.industry ? ` (${company.industry})` : ''}
PRIMARY CONTACT: ${contact?.full_name ?? 'Unknown'}${contact?.job_title ? `, ${contact.job_title}` : ''}

RECENT ACTIVITY:
${history}

Produce, in this exact structure with short bullet points:
1. Company context (max 3 lines)
2. Last interaction recap
3. Open items / unresolved questions
4. 3 recommended talking points tailored to the "${deal.stage ?? ''}" stage
5. Suggested next step`
}

export function buildFollowUpEmailPrompt(input: { activity: ActivityCtx; contactName?: string | null; company?: string | null; dealStage?: string | null }): string {
  const { activity } = input
  return `You are On3oard's AI assistant writing on behalf of the team. Brand voice: professional, direct, warm, no fluff. Draft a ready-to-send follow-up email.

CONTEXT:
- Contact: ${input.contactName ?? 'there'}
- Company: ${input.company ?? 'n/a'}
- Deal stage: ${input.dealStage ?? 'n/a'}
- Last interaction: ${activity.type ?? 'note'}${activity.subject ? ` — ${activity.subject}` : ''}${activity.outcome ? ` (outcome: ${activity.outcome})` : ''}
- Notes: ${activity.notes ?? 'none'}

Write: a subject line, a greeting using the contact's first name, 2-3 tight paragraphs referencing the last interaction and proposing a clear next step, and a sign-off from the On3oard team. Do NOT use placeholders like [Name] — write it ready to send.`
}
