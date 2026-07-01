'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

interface AccountActionsProps {
  accountId: string
  username: string
}

export function AccountActions({ accountId, username }: AccountActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const { error } = await supabase.from('twitter_accounts').delete().eq('id', accountId)
    if (error) {
      toast.error('Failed to remove account.')
    } else {
      toast.success(`@${username} removed.`)
      router.refresh()
    }
    setDeleting(false)
  }

  return (
    <Button
      variant={confirmDelete ? 'destructive' : 'ghost'}
      size="sm"
      onClick={handleDelete}
      loading={deleting}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {confirmDelete ? 'Confirm Remove' : 'Remove'}
    </Button>
  )
}
