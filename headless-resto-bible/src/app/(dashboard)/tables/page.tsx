import { getTables } from '@/actions/tables';
import AddTableForm from './components/AddTableForm';
import TableList from './components/TableList';

export default async function TablesPage() {
  const tables = await getTables();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
      <AddTableForm />
      <TableList tables={tables} />
    </div>
  );
}
