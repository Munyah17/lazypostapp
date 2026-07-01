'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Trash2, Send } from 'lucide-react'

export function PostActions({ postId, status }: { postId: string; status: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) toast.error('Failed to delete post.')
    else { toast.success('Post deleted.'); router.refresh() }
    setDeleting(false)
  }

  const handlePublishNow = async () => {
    setPublishing(true)
    try {
      const res = await fetch('/api/posts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      const data = await res.json()
      if (data.error) toast.error(data.error)
      else { toast.success('Published!'); router.refresh() }
    } catch {
      toast.error('Failed to publish.')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {(status === 'draft' || status === 'scheduled' || status === 'failed') && (
        <Button variant="ghost" size="icon-sm" onClick={handlePublishNow} loading={publishing} title="Publish now">
          <Send className="w-3.5 h-3.5 text-indigo-400" />
        </Button>
      )}
      <Button
        variant={confirmDelete ? 'destructive' : 'ghost'}
        size="icon-sm"
        onClick={handleDelete}
        loading={deleting}
        title={confirmDelete ? 'Confirm delete' : 'Delete post'}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
