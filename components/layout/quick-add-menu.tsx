'use client'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function QuickAddMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus size={14} /> Quick Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/contacts?new=1">Add Contact</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/deals?new=1">Add Deal</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/activities?new=1">Log Activity</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
