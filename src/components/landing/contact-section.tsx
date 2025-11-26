"use client"

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"

import type { Locale } from "@/i18n/config"
import { supabase } from "@/lib/supabase"

type ContactCopy = {
  sectionLabel: string
  title: string
  description: string
  card: {
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    messageLabel: string
    messagePlaceholder: string
    submit: string
  }
  status: {
    sending: string
    success: string
    error: string
  }
  validation: {
    nameRequired: string
    emailRequired: string
    emailInvalid: string
    messageRequired: string
    emptyAll: string
  }
}

interface ContactSectionProps {
  copy: ContactCopy
  locale: Locale
}

const initialFormState = { name: "", email: "", message: "" }

export function ContactSection({ copy, locale }: ContactSectionProps) {
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState<Record<keyof typeof initialFormState, string>>({
    name: "",
    email: "",
    message: "",
  })
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const emailRegex = useMemo(() => /.+@.+\..+/, [])

  const handleChange = (field: keyof typeof formData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
    setStatus("idle")
    setStatusMessage(null)
  }

  const validate = () => {
    const trimmed = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
    }

    if (!trimmed.name && !trimmed.email && !trimmed.message) {
      setErrors({
        name: copy.validation.nameRequired,
        email: copy.validation.emailRequired,
        message: copy.validation.emptyAll,
      })
      return null
    }

    const newErrors = { name: "", email: "", message: "" }
    if (!trimmed.name) {
      newErrors.name = copy.validation.nameRequired
    }
    if (!trimmed.email) {
      newErrors.email = copy.validation.emailRequired
    } else if (!emailRegex.test(trimmed.email)) {
      newErrors.email = copy.validation.emailInvalid
    }
    if (!trimmed.message) {
      newErrors.message = copy.validation.messageRequired
    }

    setErrors(newErrors)
    const hasError = Object.values(newErrors).some(Boolean)
    return hasError ? null : trimmed
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validPayload = validate()
    if (!validPayload) return

    setStatus("submitting")
    setStatusMessage(copy.status.sending)

    /*
      contact_messages table structure (Supabase):
        - id: uuid primary key
        - name: text not null
        - email: text not null
        - message: text not null
        - locale: text not null
        - created_at: timestamptz default now()
    */
    const { error } = await supabase.from("contact_messages").insert([
      {
        name: validPayload.name,
        email: validPayload.email,
        message: validPayload.message,
        locale,
      },
    ])

    if (error) {
      setStatus("error")
      setStatusMessage(copy.status.error)
      return
    }

    setStatus("success")
    setStatusMessage(copy.status.success)
    setFormData(initialFormState)
  }

  const inputBaseClass =
    "w-full rounded-2xl border px-4 py-3 text-base text-gray-900 transition focus:border-primary focus:ring-2 focus:ring-primary-light"

  return (
    <section id="contact" className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{copy.sectionLabel}</p>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-lg text-gray-600 whitespace-pre-line">{copy.description}</p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{copy.card.subtitle}</p>
            <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="text-sm font-semibold text-gray-700" htmlFor="contact-name">
                  {copy.card.nameLabel}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange("name")}
                  className={`${inputBaseClass} ${errors.name ? "border-rose-400" : "border-gray-200"}`}
                  placeholder={copy.card.namePlaceholder}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name ? <p className="mt-2 text-sm text-rose-500">{errors.name}</p> : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700" htmlFor="contact-email">
                  {copy.card.emailLabel}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  className={`${inputBaseClass} ${errors.email ? "border-rose-400" : "border-gray-200"}`}
                  placeholder={copy.card.emailPlaceholder}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? <p className="mt-2 text-sm text-rose-500">{errors.email}</p> : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700" htmlFor="contact-message">
                  {copy.card.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange("message")}
                  className={`${inputBaseClass} h-40 resize-none ${errors.message ? "border-rose-400" : "border-gray-200"}`}
                  placeholder={copy.card.messagePlaceholder}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message ? <p className="mt-2 text-sm text-rose-500">{errors.message}</p> : null}
              </div>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "submitting" ? copy.status.sending : copy.card.submit}
              </button>
              {statusMessage ? (
                <p
                  className={`text-center text-sm ${
                    status === "success" ? "text-emerald-600" : status === "error" ? "text-rose-500" : "text-gray-500"
                  }`}
                >
                  {statusMessage}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
