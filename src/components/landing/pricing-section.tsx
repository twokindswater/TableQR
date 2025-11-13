'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { useToast } from '@/hooks/use-toast'

const PRODUCT_ID = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID ?? "9889da63-746a-407b-9e61-69753ca1dc8c"
const CHECKOUT_PATH = PRODUCT_ID ? `/api/checkout?products=${PRODUCT_ID}` : null

const plan = {
  tier: 'TableQR Standard',
  price: '₩29,000 /월',
  description: '대부분의 매장에서 사용하는 핵심 기능을 모두 제공합니다.',
  benefits: [
    'QR 메뉴 3개까지 생성',
    '대기열 및 브라우저 푸시 알림',
    '실시간 메뉴 편집 및 바로 반영',
    '우선 지원 & 향후 기능 업데이트 포함',
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
        description: '관리자에게 Polar 상품 ID를 확인해달라고 요청해주세요.',
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
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Pricing
          </p>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            하나의 요금제로 TableQR을 시작하세요
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            로그인만 하면 결제를 진행할 수 있어요. 결제 완료 시 관리자 페이지로 이동합니다.
          </p>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-primary bg-primary-light/30 p-8 shadow-lg shadow-primary/20">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {plan.tier}
                </p>
                <p className="text-3xl font-bold text-gray-900">{plan.price}</p>
                <p className="mt-2 text-gray-700">{plan.description}</p>
              </div>
              <button
                onClick={handlePlanClick}
                disabled={status === 'loading'}
                className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/30 transition hover:bg-primary-hover disabled:opacity-60"
              >
                {status === 'authenticated' ? '결제 진행하기' : '로그인 후 시작하기'}
              </button>
            </div>
            <ul className="mt-8 space-y-3 text-sm text-gray-800">
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-2xl bg-white/70 p-4 text-sm text-gray-700">
              결제 중 뒤로 가기를 누르면 랜딩 페이지로 되돌아오며, 결제가 완료되면 자동으로 매장 관리 페이지
              <span className="ml-1 font-mono text-xs text-gray-900">/stores</span>
              로 이동합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
