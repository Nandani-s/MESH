// pages/admin/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { 
  Search, Edit, Trash2, Mail, Phone,
  CheckCircle, XCircle, Loader2, AlertCircle, X
} from 'lucide-react';
import { usersApi } from '../../api/users';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', role: 'user', status: 'active' });

  const fetchUsers = async () => {
	setIsLoading(true);
	setLoadError('');
	try {
	  const res = await usersApi.getAll();
	  setUsers((res.data || []).filter((user) => user.role === 'user'));
	} catch (error) {
	  setLoadError(error instanceof ApiError ? error.message : 'Failed to load users.');
	} finally {
	  setIsLoading(false);
	}
  };

  useEffect(() => { Promise.resolve().then(fetchUsers); }, []);

  const getInitials = (name = '') => {
	const parts = name.trim().split(/\s+/);
	return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '??';
  };

  const handleOpenModal = (user) => {
	setFormError('');
	setEditingUser(user);
	setFormData({ name: user.name, phone: user.phone, role: user.role, status: user.status || 'active' });
	setShowModal(true);
  };

  const handleSubmit = async (e) => {
	e.preventDefault();
	setIsSubmitting(true);
	setFormError('');
	try {
	  const res = await usersApi.update(editingUser._id, formData);
	  if (res.data.role === 'user') {
		setUsers(prev => prev.map(u => u._id === editingUser._id ? res.data : u));
	  } else {
		setUsers(prev => prev.filter(u => u._id !== editingUser._id));
	  }
	  setShowModal(false);
	} catch (error) {
	  setFormError(error instanceof ApiError ? error.message : 'Failed to update user.');
	} finally {
	  setIsSubmitting(false);
	}
  };

  const handleDelete = async (id) => {
	if (id === currentUser?.id) { alert("You can't delete your own account."); return; }
	if (!window.confirm('Delete this user? This cannot be undone.')) return;
	setBusyUserId(id);
	try {
	  await usersApi.remove(id);
	  setUsers(prev => prev.filter(u => u._id !== id));
	} catch (error) {
	  alert(error instanceof ApiError ? error.message : 'Failed to delete user.');
	} finally {
	  setBusyUserId(null);
	}
  };

  const toggleStatus = async (user) => {
	const newStatus = (user.status || 'active') === 'active' ? 'inactive' : 'active';
	setBusyUserId(user._id);
	try {
	  const res = await usersApi.update(user._id, { status: newStatus });
	  setUsers(prev => prev.map(u => u._id === user._id ? res.data : u));
	} catch (error) {
	  alert(error instanceof ApiError ? error.message : 'Failed to update status.');
	} finally {
	  setBusyUserId(null);
	}
  };

  const filteredUsers = users.filter(user => {
	const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						  user.email.toLowerCase().includes(searchTerm.toLowerCase());
	return matchesSearch;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => (u.status || 'active') === 'active').length;
  const thisMonth = users.filter(u => {
	const d = new Date(u.createdAt); const n = new Date();
	return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  return (
	<div className="space-y-6">
	  <div>
		<h1 className="text-3xl font-bold text-text-primary">Customers</h1>
		<p className="text-text-muted mt-1">Manage your store customers</p>
	  </div>

	  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
		{[
		  { label: 'Total Customers', value: totalUsers },
		  { label: 'Active Customers', value: activeUsers },
		  { label: 'New This Month', value: thisMonth },
		].map((stat) => (
		  <div key={stat.label} className="bg-surface-light rounded-xl shadow-sm border border-border-light p-4">
			<p className="text-sm text-text-muted">{stat.label}</p>
			<p className="text-2xl font-bold text-text-primary">{stat.value}</p>
		  </div>
		))}
	  </div>

	  <div className="bg-surface-light rounded-xl shadow-sm border border-border-light p-4">
		<div className="flex flex-col sm:flex-row gap-4">
		  <div className="flex-1 relative">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
			<input type="text" placeholder="Search by name or email..." value={searchTerm}
			  onChange={(e) => setSearchTerm(e.target.value)}
			  className="w-full pl-10 pr-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
		  </div>
		</div>
	  </div>

	  {isLoading && <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>}

	  {!isLoading && loadError && (
		<div className="bg-danger-50 border border-danger-200 rounded-xl p-6 flex items-center justify-between">
		  <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-danger-500" /><p className="text-danger-600">{loadError}</p></div>
		  <button onClick={fetchUsers} className="px-3 py-1.5 text-sm border border-danger-300 rounded-lg hover:bg-danger-100 transition">Retry</button>
		</div>
	  )}

	  {!isLoading && !loadError && filteredUsers.length === 0 && (
		<div className="text-center py-20 text-text-muted">{users.length === 0 ? 'No users found.' : 'No users match your search.'}</div>
	  )}

	  {!isLoading && !loadError && filteredUsers.length > 0 && (
		<div className="bg-surface-light rounded-xl shadow-sm border border-border-light overflow-hidden">
		  <div className="overflow-x-auto">
			<table className="w-full">
			  <thead className="bg-background-muted">
				<tr>
				  {['Customer', 'Contact', 'Status', 'Joined', 'Actions'].map(h => (
					<th key={h} className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">{h}</th>
				  ))}
				</tr>
			  </thead>
			  <tbody className="divide-y divide-border-light">
				{filteredUsers.map((user) => (
				  <tr key={user._id} className="hover:bg-background-muted transition">
					<td className="px-6 py-4">
					  <div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
						  {getInitials(user.name)}
						</div>
						<div>
						  <p className="font-medium text-text-primary">{user.name}</p>
						  {user._id === currentUser?.id && <span className="text-xs text-primary-500">(you)</span>}
						</div>
					  </div>
					</td>
					<td className="px-6 py-4">
					  <p className="text-sm text-text-primary flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>
					  <p className="text-xs text-text-muted flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{user.phone}</p>
					</td>
					<td className="px-6 py-4">
					  <button onClick={() => toggleStatus(user)}
						disabled={busyUserId === user._id || user._id === currentUser?.id}
						className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${(user.status || 'active') === 'active' ? 'bg-success-100 text-success-800 hover:bg-success-200' : 'bg-danger-100 text-danger-700 hover:bg-danger-200'}`}>
						{(user.status || 'active') === 'active' ? <><CheckCircle className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Inactive</>}
					  </button>
					</td>
					<td className="px-6 py-4 text-sm text-text-muted">
					  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
					</td>
					<td className="px-6 py-4">
					  <div className="flex gap-2">
						<button onClick={() => handleOpenModal(user)} className="p-1.5 text-text-muted hover:text-primary-500 transition"><Edit className="w-4 h-4" /></button>
						<button onClick={() => handleDelete(user._id)} disabled={busyUserId === user._id || user._id === currentUser?.id}
						  className="p-1.5 text-text-muted hover:text-danger-500 transition disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
					  </div>
					</td>
				  </tr>
				))}
			  </tbody>
			</table>
		  </div>
		</div>
	  )}

	  {showModal && editingUser && (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
		  <div className="bg-surface-light rounded-xl shadow-xl max-w-md w-full">
			<div className="p-6 border-b border-border-light flex justify-between items-center">
			  <h2 className="text-xl font-semibold text-text-primary">Edit Customer</h2>
			  <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
			</div>
			<form onSubmit={handleSubmit} className="p-6 space-y-4">
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
				<input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
				<input type="email" value={editingUser.email} disabled
				  className="w-full px-3 py-2 border border-border-light rounded-lg bg-background-muted text-text-muted cursor-not-allowed" />
				<p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Phone Number</label>
				<input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary" />
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Role</label>
				<select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary">
				  <option value="user">Customer</option>
				  <option value="admin">Admin</option>
				</select>
			  </div>
			  <div>
				<label className="block text-sm font-medium text-text-primary mb-2">Status</label>
				<select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
				  disabled={editingUser._id === currentUser?.id}
				  className="w-full px-3 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface-light text-text-primary disabled:bg-background-muted disabled:cursor-not-allowed">
				  <option value="active">Active</option>
				  <option value="inactive">Inactive</option>
				</select>
			  </div>
			  {formError && <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg"><p className="text-sm text-danger-600">{formError}</p></div>}
			  <div className="flex gap-3 pt-4">
				<button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting}
				  className="flex-1 px-4 py-2 border border-border-light rounded-lg hover:bg-background-muted transition disabled:opacity-50">Cancel</button>
				<button type="submit" disabled={isSubmitting}
				  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
				  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
				  Save Changes
				</button>
			  </div>
			</form>
		  </div>
		</div>
	  )}
	</div>
  );
};

export default AdminUsers;
