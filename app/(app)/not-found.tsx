import Link from 'next/link'
import { EmptyState } from '@/components/brand/empty-state'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <EmptyState
      title="Not found"
      hint="That record doesn't exist or may have been deleted."
      action={<Button asChild><Link href="/dashboard">Back to dashboard</Link></Button>}
    />
  )
}
