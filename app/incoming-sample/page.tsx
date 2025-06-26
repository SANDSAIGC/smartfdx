"use client";

import { AuthGuard } from "@/components/auth-guard";
import { IncomingSamplePage } from "@/components/incoming-sample-page";

export default function IncomingSample() {
  return (
    <AuthGuard>
      <IncomingSamplePage />
    </AuthGuard>
  );
}
