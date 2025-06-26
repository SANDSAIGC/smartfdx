"use client";

import { AuthGuard } from "@/components/auth-guard";
import { FilterSamplePage } from "@/components/filter-sample-page";

export default function FilterSample() {
  return (
    <AuthGuard>
      <FilterSamplePage />
    </AuthGuard>
  );
}
