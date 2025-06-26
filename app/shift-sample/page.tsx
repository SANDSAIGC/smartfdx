import { ShiftSamplePage } from "@/components/shift-sample-page";
import { AuthGuard } from "@/components/auth-guard";

export default function Page() {
  return (
    <AuthGuard requireAuth={true}>
      <ShiftSamplePage />
    </AuthGuard>
  );
}
