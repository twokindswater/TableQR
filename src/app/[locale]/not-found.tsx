import { Link } from "@/navigation"
import { Button } from "@/components/ui/button"
import { getTranslations } from "next-intl/server"

export default async function NotFound() {
  const t = await getTranslations("common.notFound")

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          {t("heading")}
        </h2>
        <p className="text-gray-500">{t("description")}</p>
      </div>
      <Button asChild>
        <Link href="/">{t("cta")}</Link>
      </Button>
    </div>
  )
}
