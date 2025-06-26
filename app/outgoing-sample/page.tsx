"use client";

import { AuthGuard } from "@/components/auth-guard";
import { OutgoingSamplePage } from "@/components/outgoing-sample-page";

export default function OutgoingSample() {
  return (
    <AuthGuard>
      <OutgoingSamplePage />
    </AuthGuard>
  );
}
