'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/(app)/settings/actions'

interface ProfileFormProps {
  initial: {
    full_name: string
    email: string
    avatar_url: string
    role: string
  }
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initial.full_name)
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url)
  const [role, setRole] = useState(initial.role)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfile({ full_name: fullName, avatar_url: avatarUrl, role })
      if (result.ok) {
        toast.success('Profile saved')
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to save profile')
      }
    })
  }

  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised/30 p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            value={initial.email}
            readOnly
            disabled
            className="opacity-50 cursor-not-allowed"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-role">Role</Label>
          <Input
            id="profile-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Admin, Consultant"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-avatar">Avatar URL</Label>
          <Input
            id="profile-avatar"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            type="url"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white"
        >
          {isPending ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </div>
  )
}
