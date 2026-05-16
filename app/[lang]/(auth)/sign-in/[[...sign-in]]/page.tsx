import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <SignIn
      fallbackRedirectUrl="/editor"
      appearance={{
        variables: {
          colorPrimary: "#ff6b35",
          colorForeground: "#1a1714",
          colorMutedForeground: "#4a4640",
          colorBackground: "#ffffff",
          colorInputForeground: "#1a1714",
          colorInput: "#f9f7f4",
          borderRadius: "0.75rem",
          fontFamily:
            '"Plus Jakarta Sans", system-ui, sans-serif',
          fontSize: "1rem",
        },
        elements: {
          card: "shadow-none w-full max-w-md",
          headerTitle: "text-2xl font-bold text-[#1a1714] tracking-tight",
          headerSubtitle:
            "text-base text-[#4a4640] mt-1",
          header: "pb-6",
          socialButtonsBlockButton:
            "h-11 rounded-xl border border-[#ddd9d0] bg-white text-sm font-medium text-[#1a1714] hover:bg-[#f9f7f4] transition-colors",
          socialButtonsBlockButtonArrow: "hidden",
          dividerLine: "bg-[#eae6df]",
          dividerText: "text-sm text-[#837e78]",
          formFieldLabel: "text-sm font-medium text-[#1a1714] mb-1.5",
          formFieldInput:
            "h-11 rounded-xl border border-[#ddd9d0] bg-[#f9f7f4] px-4 text-base text-[#1a1714] placeholder:text-[#b0aba4] focus:border-[#ff6b35] focus:ring-2 focus:ring-[rgba(255,107,53,0.15)] transition-all",
          formButtonPrimary:
            "h-11 rounded-xl bg-[#ff6b35] text-base font-semibold text-white hover:bg-[#e55a2b] transition-colors shadow-sm",
          footerAction: "pt-4",
          footerActionText: "text-sm text-[#4a4640]",
          footerActionLink:
            "text-sm font-semibold text-[#ff6b35] hover:underline",
          identityPreviewEditButton:
            "text-[#ff6b35] text-sm font-medium",
          identityPreviewText: "text-sm text-[#4a4640]",
          formFieldErrorText: "text-sm text-[#dc2626]",
          formFieldSuccessText: "text-sm text-[#16a34a]",
          socialButtonsIconButton:
            "h-11 w-11 rounded-xl border border-[#ddd9d0] hover:bg-[#f9f7f4] transition-colors",
          alternativeMethodsBlockButton:
            "h-11 rounded-xl border border-[#ddd9d0] text-sm text-[#1a1714] hover:bg-[#f9f7f4] transition-colors",
          alternativeMethodsBlockButtonArrow: "hidden",
        },
      }}
    />
  )
}
