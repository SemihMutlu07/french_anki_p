"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FORCE_ONBOARDING_KEY } from "./OnboardingParamHandler";
export { FORCE_ONBOARDING_KEY } from "./OnboardingParamHandler";

export const ONBOARDING_WELCOME_KEY = "fr-has-done-welcome";
export const ONBOARDING_PLACEMENT_KEY = "fr-has-done-placement";

// Routes allowed while forced onboarding is active
const ONBOARDING_ROUTES = ["/welcome", "/test"];

export default function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem(FORCE_ONBOARDING_KEY) !== "1") return;
    if (localStorage.getItem(ONBOARDING_PLACEMENT_KEY) === "1") return;

    // Allow /welcome and anything under /test (run, result)
    const isAllowed = ONBOARDING_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    );
    if (isAllowed) return;

    if (localStorage.getItem(ONBOARDING_WELCOME_KEY) !== "1") {
      router.replace("/welcome");
    } else {
      router.replace("/test/run");
    }
  }, [pathname, router]);

  return null;
}
