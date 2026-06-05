'use client';
import { useEffect, useState } from 'react';
import { getCustomers } from '@/lib/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => { getCustomers().then(r => setCustomers(r.data)); }, []);

  return (
    <div>
      <h1 className="section-title mb-8">Customers</h1>
      <div className="bg-white border border-gray-200 overflow-auto">
        <table className="classic-table">
          <thead>
            <tr>
              {['Name', 'Email', 'Role', 'Joined'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id}>
                <td className="font-medium text-gray-800">{c.name}</td>
                <td className="text-gray-500">{c.email}</td>
                <td><span className={c.role === 'admin' ? 'badge-blue' : 'badge-green'}>{c.role}</span></td>
                <td className="text-gray-400 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">No customers yet</p>
        )}
      </div>
    </div>
  );
}
