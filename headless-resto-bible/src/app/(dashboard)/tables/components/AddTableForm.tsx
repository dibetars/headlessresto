'use client';

import { addTable } from '@/actions/tables';
import { useFormState } from 'react-dom';

const initialState = {
  message: '',
};

export default function AddTableForm() {
  const [state, formAction] = useFormState(addTable, initialState);

  return (
    <form action={formAction} className="p-4 mt-8 space-y-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold">Add New Table</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="table_number" className="block text-sm font-medium text-gray-700">Table Number</label>
          <input type="text" id="table_number" name="table_number" required className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
          <input type="number" id="capacity" name="capacity" required min="1" className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
      </div>
      <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Add Table</button>
      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
    </form>
  );
}
