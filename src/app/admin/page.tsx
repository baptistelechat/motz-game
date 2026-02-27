import { ReportsTable } from "@/components/admin/reports-table";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-pixel mb-6">Moderation Dashboard</h2>
      <ReportsTable />
    </div>
  );
}
