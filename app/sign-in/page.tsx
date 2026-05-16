import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { languages } from "@/i18n-config"

export default async function SignInRootPage() {
  const headersList = await headers()
  const acceptLang = headersList.get("accept-language") || "en"
  const preferred = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase() || "en"
  const locale = languages.includes(preferred as typeof languages[number]) ? preferred : "en"
  redirect(`/${locale}/sign-in`)
}
