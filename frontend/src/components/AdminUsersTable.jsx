import React, { useEffect, useState } from 'react';
import { listUsersRequest, updateUserRequest, deleteUserRequest, createUserRequest, resetUserPasswordRequest } from '../services/api.js';
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
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', username: '', password: '' });
  const [createErrors, setCreateErrors] = useState({});
  const [createError, setCreateError] = useState('');
  const [resetUser, setResetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [tempPassword, setTempPassword] = useState('');

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

  async function submitCreate() {
    setCreateError('');
    setCreateErrors({});
    try {
      await createUserRequest(createForm);
      showToast('User created.', 'success');
      setCreating(false);
      setCreateForm({ name: '', email: '', username: '', password: '' });
      setPage(1);
      load();
    } catch (err) {
      setCreateError(err.message);
      if (err.fieldErrors) setCreateErrors(err.fieldErrors);
    }
  }

  function openReset(user) {
    setResetUser(user);
    setResetPassword('');
    setResetError('');
    setTempPassword('');
  }

  async function submitReset() {
    setResetError('');
    try {
      const res = await resetUserPasswordRequest(resetUser.id, resetPassword.trim());
      if (res.temporaryPassword) {
        setTempPassword(res.temporaryPassword);
      } else {
        showToast(`Password updated for ${resetUser.username}.`, 'success');
        setResetUser(null);
      }
    } catch (err) {
      setResetError(err.message);
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
          <button type="button" className="btn btn-sm" style={{ marginRight: 0 }} onClick={() => setCreating(true)}>+ Add user</button>
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
                    <button className="btn-outline btn-sm" onClick={() => openReset(u)}>Reset password</button>
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

      {creating && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add user">
          <div className="modal-card">
            <h3>Add user</h3>
            {['name', 'email', 'username', 'password'].map((f) => (
              <div key={f}>
                <label>{f[0].toUpperCase() + f.slice(1)}</label>
                <input
                  type={f === 'password' ? 'password' : 'text'}
                  value={createForm[f]}
                  className={createErrors[f] ? 'invalid' : ''}
                  onChange={(e) => setCreateForm((c) => ({ ...c, [f]: e.target.value }))}
                  autoComplete={f === 'password' ? 'new-password' : 'off'}
                />
                {createErrors[f] && <p className="field-error">{createErrors[f]}</p>}
              </div>
            ))}
            {createError && !Object.keys(createErrors).length && <p className="field-error" role="alert">{createError}</p>}
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setCreating(false)}>Cancel</button>
              <button className="btn" onClick={submitCreate}>Create</button>
            </div>
          </div>
        </div>
      )}

      {resetUser && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Reset password">
          <div className="modal-card">
            <h3>Reset password</h3>
            <p className="muted">Account: <strong>{resetUser.username}</strong> ({resetUser.email}). Existing passwords can never be viewed - set a new one instead.</p>
            {!tempPassword ? (
              <>
                <label>New password (leave blank to generate a temporary one)</label>
                <input type="text" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} autoComplete="off" placeholder="min 8 characters" />
                {resetError && <p className="field-error" role="alert">{resetError}</p>}
                <div className="modal-actions">
                  <button className="btn-outline" onClick={() => setResetUser(null)}>Cancel</button>
                  <button className="btn" onClick={submitReset}>{resetPassword.trim() ? 'Set password' : 'Generate temporary password'}</button>
                </div>
              </>
            ) : (
              <>
                <p>Temporary password (shown only once - copy it now and share it securely with the user):</p>
                <input readOnly value={tempPassword} onFocus={(e) => e.target.select()} style={{ fontFamily: 'monospace', fontWeight: 700 }} />
                <p className="muted">Ask the user to log in and change it from their account settings.</p>
                <div className="modal-actions">
                  <button className="btn-outline" onClick={() => navigator.clipboard?.writeText(tempPassword).then(() => showToast('Copied.', 'success'))}>Copy</button>
                  <button className="btn" onClick={() => { setTempPassword(''); setResetUser(null); }}>Done</button>
                </div>
              </>
            )}
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
