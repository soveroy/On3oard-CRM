import { healthColor } from '@/lib/domain/health-score'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const COLOR: Record<'green' | 'amber' | 'red', string> = {
  green: 'bg-[#22c55e]', amber: 'bg-[#ff914d]', red: 'bg-[#f93f58]',
}

export function HealthDot({ score }: { score: number }) {
  const c = healthColor(score)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${COLOR[c]}`} aria-label={`Health ${score}`} data-color={c} />
        </TooltipTrigger>
        <TooltipContent>Health score: {score}/100</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
