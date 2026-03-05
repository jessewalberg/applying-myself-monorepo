export const authAppearance = {
  variables: {
    colorPrimary: "hsl(38 92% 50%)",
    colorText: "hsl(40 20% 95%)",
    colorTextSecondary: "hsl(20 8% 55%)",
    colorBackground: "transparent",
    colorInputBackground: "hsl(20 10% 8%)",
    colorInputText: "hsl(40 20% 95%)",
    colorDanger: "hsl(0 72% 51%)",
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
    borderRadius: "0.5rem",
    spacingUnit: "1rem",
  },
  elements: {
    // ── Strip Clerk's card chrome completely ──
    rootBox: "w-full",
    cardBox:
      "!w-full !shadow-none !bg-transparent !border-0",
    card: "!w-full !border-0 !bg-transparent !p-0 !shadow-none !rounded-none",
    main: "gap-4",

    // ── Hide Clerk's header (our layout already shows heading) ──
    headerTitle: "!hidden",
    headerSubtitle: "!hidden",
    header: "!hidden",

    // ── Social buttons ──
    socialButtonsBlockButton:
      "!h-11 !rounded-lg !border !border-[hsl(20_8%_22%)] !bg-[hsl(20_8%_10%)] !shadow-none transition-all hover:!bg-[hsl(20_8%_14%)] hover:!border-[hsl(20_8%_28%)]",
    socialButtonsBlockButtonText:
      "!font-medium !text-[hsl(40_20%_95%)] !text-sm",
    socialButtonsBlockButtonArrow: "!text-[hsl(20_8%_55%)]",
    socialButtonsProviderIcon__apple: "[filter:invert(1)]",
    socialButtonsProviderIcon__github: "[filter:invert(1)]",

    // ── Divider ──
    dividerText: "!text-[hsl(20_8%_45%)] !text-xs !uppercase tracking-wider",
    dividerLine: "!bg-[hsl(20_8%_22%)]",
    dividerRow: "!my-3",

    // ── Form fields ──
    formFieldLabel: "!text-[hsl(40_15%_80%)] !text-sm !font-medium",
    formFieldInput:
      "!h-11 !rounded-lg !border-[hsl(20_8%_22%)] !bg-[hsl(20_8%_10%)] !text-[hsl(40_20%_95%)] placeholder:!text-[hsl(20_8%_35%)] transition-all focus:!border-[hsl(38_92%_50%)] focus:!ring-1 focus:!ring-[hsl(38_92%_50%/0.3)]",
    formFieldInputShowPasswordButton:
      "!text-[hsl(20_8%_45%)] hover:!text-[hsl(40_20%_95%)]",
    formFieldErrorText: "!text-[hsl(0_72%_60%)] !text-xs",
    formFieldSuccessText: "!text-[hsl(142_72%_50%)] !text-xs",

    // ── Primary button ──
    formButtonPrimary:
      "!h-11 !rounded-lg !bg-[hsl(38_92%_50%)] !text-[hsl(20_14%_4%)] !font-semibold !shadow-none transition-all hover:!bg-[hsl(38_92%_45%)] active:!scale-[0.98]",
    formButtonReset:
      "!text-[hsl(38_92%_50%)] !font-medium hover:!text-[hsl(38_92%_60%)] transition-colors",

    // ── Footer ──
    footer:
      "!bg-transparent !border-0 !rounded-none !mt-4",
    footerAction:
      "!bg-transparent !border-0 !p-0",
    footerActionText: "!text-[hsl(20_8%_55%)] !text-sm !bg-transparent",
    footerActionLink:
      "!text-[hsl(38_92%_50%)] !font-medium hover:!text-[hsl(38_92%_60%)] transition-colors",
    footerPages: "!bg-transparent",
    footerPagesLink: "!text-[hsl(20_8%_55%)] hover:!text-[hsl(40_20%_95%)]",
    formResendCodeLink:
      "!text-[hsl(38_92%_50%)] !font-medium hover:!text-[hsl(38_92%_60%)] transition-colors",

    // ── OTP inputs ──
    otpCodeFieldInput:
      "!h-12 !w-10 !rounded-lg !border-[hsl(20_8%_22%)] !bg-[hsl(20_8%_10%)] !text-[hsl(40_20%_95%)] !text-lg !font-mono focus:!border-[hsl(38_92%_50%)] focus:!ring-1 focus:!ring-[hsl(38_92%_50%/0.3)]",

    // ── Identity preview ──
    identityPreviewEditButton:
      "!text-[hsl(38_92%_50%)] hover:!text-[hsl(38_92%_60%)]",
    identityPreviewText: "!text-[hsl(40_20%_95%)]",

    // ── Alert / error banners ──
    alert:
      "!rounded-lg !border !border-[hsl(0_72%_51%/0.3)] !bg-[hsl(0_72%_51%/0.08)]",
    alertText: "!text-sm !text-[hsl(0_72%_70%)]",

    // ── Internal links ──
    backLink:
      "!text-[hsl(20_8%_55%)] hover:!text-[hsl(40_20%_95%)] transition-colors",
  },
};
