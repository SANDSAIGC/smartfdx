import { LabPage } from "@/components/lab-page";
import { AuthGuard } from "@/components/auth-guard";

export default function Page() {
  return (
    <AuthGuard requireAuth={true}>
      <LabPage />
    </AuthGuard>
  );
}
