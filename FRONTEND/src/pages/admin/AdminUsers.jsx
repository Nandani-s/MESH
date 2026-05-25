import React from 'react';

const AdminUsers = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">1</td>
              <td className="px-6 py-4 whitespace-nowrap">Admin User</td>
              <td className="px-6 py-4 whitespace-nowrap">admin@example.com</td>
              <td className="px-6 py-4 whitespace-nowrap">Admin</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;