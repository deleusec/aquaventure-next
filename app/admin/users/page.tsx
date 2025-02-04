import UserTable from "@/components/users/UserTable";
export default async function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
      </div>
      <UserTable />
    </div>
  );
}
