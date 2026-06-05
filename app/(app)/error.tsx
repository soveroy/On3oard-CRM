'use client'
import { useEffect } from 'react'
import { ErrorState } from '@/components/brand/error-state'
import { Button } from '@/components/ui/button'

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <ErrorState
      title="Something went wrong"
      hint="An unexpected error occurred. Try again, or head back to the dashboard."
      action={<Button onClick={reset}>Try again</Button>}
    />
  )
}
