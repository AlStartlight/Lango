const requiredVars = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
] as const

export function isClerkConfigured(): boolean {
  return requiredVars.every(
    (key) => {
      const val = process.env[key]
      return val && val !== `${key}_placeholder` && !val.includes("placeholder")
    }
  )
}
