'use client'

import { useCallback } from 'react'
import { useRouter } from '@/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'

import { useToast } from '@/hooks/use-toast'
import { CHECKOUT_PATH } from '@/lib/checkout'

export function PricingSection() {
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()
  const t = useTranslations('pricing')
  const locale = useLocale()
  const benefits = t.raw('plan.benefits') as string[]

  const handlePlanClick = useCallback(async () => {
    if (!CHECKOUT_PATH) {
      toast({
        title: t('toasts.missingProduct.title'),
        description: t('toasts.missingProduct.description'),
        variant: 'destructive',
      })
      return
    }

    if (status === 'loading') {
      return
    }

    if (status !== 'authenticated') {
      router.push({
        pathname: '/login',
        query: { callbackUrl: CHECKOUT_PATH },
      }, { locale })
      return
    }

    try {
      const response = await fetch('/api/subscription', { cache: 'no-store' })
      if (response.status === 401) {
        router.push({
          pathname: '/login',
          query: { callbackUrl: CHECKOUT_PATH },
        }, { locale })
        return
      }

      if (response.ok) {
        const snapshot = await response.json()
        if (snapshot?.status === 'active' || snapshot?.status === 'trialing') {
          toast({
            title: t('toasts.alreadyActive.title'),
            description: t('toasts.alreadyActive.description'),
          })
          router.push('/stores', { locale })
          return
        }
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error)
    }

    window.location.href = CHECKOUT_PATH
  }, [locale, router, status, t, toast])

  return (
    <section id="pricing" className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-5xl">{t('title')}</h2>
          <p className="mt-4 text-lg text-gray-700">{t('subtitle')}</p>
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-primary bg-primary-light/30 p-8 shadow-lg shadow-primary/20">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t('plan.tier')}</p>
                <p className="text-3xl font-extrabold text-gray-900">{t('plan.price')}</p>
                <p className="mt-2 text-gray-800">{t('plan.description')}</p>
              </div>
              <button
                onClick={handlePlanClick}
                disabled={status === 'loading'}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-8 py-4 text-lg font-extrabold uppercase tracking-wide text-white shadow-xl shadow-primary/40 transition hover:from-primary-hover hover:to-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {t('plan.button')}
              </button>
            </div>
            <ul className="mt-8 space-y-3 text-base text-gray-900">
              {benefits.map((benefit) => (
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
