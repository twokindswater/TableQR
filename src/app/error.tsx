'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-gray-900">오류</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-500">
          일시적인 오류가 발생했습니다. 다시 시도해주세요.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>다시 시도</Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  )
}

