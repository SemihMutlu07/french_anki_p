"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export const FORCE_ONBOARDING_KEY = "fr-force-onboarding";

export default function OnboardingParamHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const val = params.get("onboarding");
    if (val === "1") {
      localStorage.setItem(FORCE_ONBOARDING_KEY, "1");
      router.replace(pathname);
    } else if (val === "0") {
      localStorage.removeItem(FORCE_ONBOARDING_KEY);
      router.replace(pathname);
    }
  }, [params, router, pathname]);

  return null;
}
