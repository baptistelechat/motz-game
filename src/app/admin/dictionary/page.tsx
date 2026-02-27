import { DictionaryTable } from "@/components/admin/dictionary-table";

export default function DictionaryPage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-pixel mb-6">Dictionary Management</h2>
            <DictionaryTable />
        </div>
    );
}
