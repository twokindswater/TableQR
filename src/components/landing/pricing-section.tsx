'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { useToast } from '@/hooks/use-toast'
import { CHECKOUT_PATH } from '@/lib/checkout'

const plan = {
  tier: 'TableQR Standard',
  price: '월 $5',
  description: '7일 무료 체험 후 자동 전환됩니다. 언제든 취소 가능해요.',
  benefits: [
    '모든 기능 무제한 사용',
    '7일 무료 체험 → 이후 월 $5로 자동 전환',
    '언제든 취소 가능',
  ],
}

export function PricingSection() {
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()

  const handlePlanClick = useCallback(() => {
    if (!CHECKOUT_PATH) {
      toast({
        title: '결제 설정이 필요합니다',
        description: '관리자에게 상품 ID를 확인해달라고 요청해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (status === 'loading') {
      return
    }

    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(CHECKOUT_PATH)}`)
      return
    }

    window.location.href = CHECKOUT_PATH
  }, [router, status, toast])

  return (
    <section id="pricing" className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-5xl">
            7일 동안 무료로 사용해보세요.
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            지금 바로 QR 메뉴판을 만들어보고 매장의 운영을 바꿔보세요.
          </p>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-primary bg-primary-light/30 p-8 shadow-lg shadow-primary/20">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {plan.tier}
                </p>
                <p className="text-3xl font-extrabold text-gray-900">{plan.price}</p>
                <p className="mt-2 text-gray-800">{plan.description}</p>
              </div>
              <button
                onClick={handlePlanClick}
                disabled={status === 'loading'}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-8 py-4 text-lg font-extrabold uppercase tracking-wide text-white shadow-xl shadow-primary/40 transition hover:from-primary-hover hover:to-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                7일 무료 체험 시작
              </button>
            </div>
            <ul className="mt-8 space-y-3 text-base text-gray-900">
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
