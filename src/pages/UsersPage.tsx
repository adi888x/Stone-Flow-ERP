import React from 'react';
import { useStoreContext } from '../App';
import { Shield, UserCheck, UserX } from 'lucide-react';

export function UsersPage() {
  const store = useStoreContext();

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    COUNTER_OPERATOR: 'bg-blue-100 text-blue-700',
    ACCOUNTANT: 'bg-green-100 text-green-700',
    MANAGER: 'bg-purple-100 text-purple-700',
  };

  const rolePermissions: Record<string, string[]> = {
    ADMIN: ['Full access to all modules', 'Edit/Delete transactions', 'Manage users & settings', 'View audit logs'],
    COUNTER_OPERATOR: ['Create sales & purchases', 'View masters', 'Print receipts', 'Cannot edit historical data'],
    ACCOUNTANT: ['Sales, Purchases, Expenses', 'Customer & Supplier payments', 'Ledgers & Reports', 'Excel/PDF export'],
    MANAGER: ['Dashboard & Reports', 'View all transactions', 'Customers & Suppliers', 'Export data'],
  };

  return (
    <div className="space-y-4">
      <div><p className="text-sm text-slate-500">Manage system users and roles</p></div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="erp-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {store.users.map(u => (
              <tr key={u.id}>
                <td className="font-medium flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium">{u.full_name.charAt(0)}</div>
                  {u.full_name}
                </td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{u.role.replace('_', ' ')}</span></td>
                <td><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>{u.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(rolePermissions).map(([role, perms]) => (
          <div key={role} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-blue-600" />
              <h3 className="font-semibold text-slate-800">{role.replace('_', ' ')}</h3>
            </div>
            <ul className="space-y-1">
              {perms.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  {p.includes('Cannot') ? <UserX size={14} className="text-red-500" /> : <UserCheck size={14} className="text-green-500" />}
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
