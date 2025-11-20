'use client'

import { useEffect } from 'react'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const tError = useTranslations('common.error')
  const tActions = useTranslations('common.actions')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-6xl font-bold text-gray-900">{tError('title')}</h1>
        <h2 className="text-2xl font-semibold text-gray-700">{tError('heading')}</h2>
        <p className="text-gray-500">{tError('description')}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>{tError('retry')}</Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          {tActions('goHome')}
        </Button>
      </div>
    </div>
  )
}
