import React, { useEffect, useState } from 'react';
import { listUsersRequest, updateUserRequest, deleteUserRequest } from '../services/api.js';
import { useToast } from '../services/toast.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { SkeletonTableRows } from './Skeleton.jsx';

export default function AdminUsersTable() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', username: '' });
  const [deletingUser, setDeletingUser] = useState(null);

  function load() {
    setLoading(true);
    listUsersRequest({ search, page })
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  function openEdit(user) {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, username: user.username });
  }

  async function saveEdit() {
    try {
      await updateUserRequest(editingUser.id, editForm);
      showToast('User updated.', 'success');
      setEditingUser(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function confirmDelete() {
    try {
      await deleteUserRequest(deletingUser.id);
      showToast('User deleted.', 'success');
      setDeletingUser(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  return (
    <div className="card">
      <div className="table-toolbar">
        <h3>User Management</h3>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input placeholder="Search name, email, username..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn-outline">Search</button>
        </form>
      </div>

      {error && <p className="field-error">{error}</p>}

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonTableRows rows={5} cols={5} />}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">No users found.</td>
              </tr>
            )}
            {!loading &&
              data?.items.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.username}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-outline btn-sm" onClick={() => openEdit(u)}>Edit</button>
                    <button className="btn-outline btn-sm btn-danger-outline" onClick={() => setDeletingUser(u)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="pagination">
          <button className="btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span className="muted">Page {data.page} of {data.totalPages}</span>
          <button className="btn-outline btn-sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Edit user">
          <div className="modal-card">
            <h3>Edit user</h3>
            <label>Name</label>
            <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
            <label>Email</label>
            <input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            <label>Username</label>
            <input value={editForm.username} onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))} />
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deletingUser)}
        title="Delete user?"
        message={`This permanently deletes ${deletingUser?.name}'s account. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
}
