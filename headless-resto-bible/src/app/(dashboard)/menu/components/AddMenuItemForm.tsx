'use client';

import { useFormState } from 'react-dom';
import { addMenuItem } from '@/actions/menu';

const initialState = {
  message: '',
};

export default function AddMenuItemForm() {
  const [state, formAction] = useFormState(addMenuItem, initialState);

  return (
    <form action={formAction} className="p-4 space-y-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold">Add New Menu Item</h3>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" id="name" name="name" required className="block w-full px-3 py-2 mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" name="description" required className="block w-full px-3 py-2 mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm"></textarea>
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
        <input type="number" id="price" name="price" step="0.01" required className="block w-full px-3 py-2 mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <input type="text" id="category" name="category" required className="block w-full px-3 py-2 mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
        <input type="url" id="image_url" name="image_url" placeholder="https://example.com/image.jpg" className="block w-full px-3 py-2 mt-1 bg-gray-100 border-gray-300 rounded-md shadow-sm focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
      </div>
      <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900">Add Item</button>
      {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
    </form>
  );
}
