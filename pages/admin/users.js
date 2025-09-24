import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import Modal from "../../components/Admin/Modal/Modal";
import withAdminAuth from "../../lib/withAdminAuth";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX } from "react-icons/fi";
import commonStyles from "./users.module.css";
import lightStyles from "./users.light.module.css";
import darkStyles from "./users.dark.module.css";
import utilities from "../../styles/utilities.module.css";
import { useTheme } from "../../context/ThemeContext";
import InlineSpinner from "../../components/LoadingAnimation/InlineSpinner";
import Icon from "../../components/Admin/Icon/Icon";

// Delete Confirmation Modal
const DeleteConfirmModal = ({ user, onCancel, onConfirm, isDeleting }) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const cancelRef = useRef(null);
  return (
    <Modal isOpen={true} onClose={onCancel} title="Delete User" initialFocusRef={cancelRef}>
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ marginBottom: "0.5rem" }}>
          Are you sure you want to delete <strong>{user?.name}</strong>? This action cannot be undone.
        </p>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          This will permanently remove the user and all associated data.
        </p>
      </div>
      <div className={commonStyles.actionsRow}>
        <button ref={cancelRef} type="button" onClick={onCancel} className={`${utilities.btn} ${utilities.btnSecondary}`}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={`${utilities.btn} ${utilities.btnDanger}`} disabled={isDeleting}>
          {isDeleting && <InlineSpinner sizePx={16} />}
          <span style={{ marginLeft: isDeleting ? 6 : 0 }}>{isDeleting ? "Deleting…" : "Delete"}</span>
        </button>
      </div>
    </Modal>
  );
};

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onUserUpdate }) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const nameRef = useRef(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const [saving, setSaving] = useState(false);
  const handleUpdate = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating user...");
    try {
      setSaving(true);
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      toast.success("User updated successfully!", { id: toastId });
      onUserUpdate(); // Callback to refresh the user list
      onClose(); // Close the modal
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit User" initialFocusRef={nameRef}>
      <form onSubmit={handleUpdate}>
        <div className={commonStyles.formGrid}>
          <div className={commonStyles.formGroup}>
            <label htmlFor="edit_name" className={commonStyles.formLabel}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="edit_name"
              ref={nameRef}
              className={commonStyles.formControl}
              required
            />
          </div>
          <div className={commonStyles.formGroup}>
            <label htmlFor="edit_email" className={commonStyles.formLabel}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="edit_email"
              className={commonStyles.formControl}
              required
            />
          </div>
          <div className={commonStyles.formGroup}>
            <label htmlFor="edit_role" className={commonStyles.formLabel}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              id="edit_role"
              className={commonStyles.formControl}
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className={commonStyles.actionsRow}>
          <button type="button" onClick={onClose} className={`${utilities.btn} ${utilities.btnSecondary}`}>
            Cancel
          </button>
          <button type="submit" className={`${utilities.btn} ${utilities.btnPrimary}`} disabled={saving}>
            {saving && <InlineSpinner sizePx={16} />}
            <span style={{ marginLeft: saving ? 6 : 0 }}>{saving ? "Saving…" : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

const UsersPage = () => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Create form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("editor");
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      setUsers(data);
      setFilteredUsers(data);
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating user...");
    try {
      setCreating(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      toast.success("User created successfully!", { id: toastId });
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("editor");
      fetchUsers();
    } catch (e) {
      toast.error(e.message, { id: toastId });
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const toastId = toast.loading("Deleting user...");
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/users/${userToDelete._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      toast.success("User deleted successfully!", { id: toastId });
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (e) {
      toast.error(e.message, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
  };

  return (
    <AdminLayout>
      {isEditModalOpen && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setEditModalOpen(false)}
          onUserUpdate={fetchUsers}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          user={userToDelete}
          onCancel={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      )}
      <div className={commonStyles.pageContainer}>
        <div className={commonStyles.mtLg}>
          <h1 className={commonStyles.pageTitle}>
            User Management
          </h1>
          <p className={commonStyles.pageSubtitle}>
            Manage all users, their roles, and permissions in your admin system.
          </p>

          {/* Modern Filter Bar */}
          <div className={commonStyles.filterBar}>
            <div className={commonStyles.filterGroup}>
              <label className={commonStyles.filterLabel}>
                <Icon name="search" size={16} />
                Search Users
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={commonStyles.formControl}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Icon 
                  name="search" 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} 
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    style={{ 
                      position: 'absolute', 
                      right: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <Icon name="x" size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className={commonStyles.filterGroup}>
              <label className={commonStyles.filterLabel}>
                <Icon name="user" size={16} />
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={commonStyles.formControl}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            
            <div className={commonStyles.filterActions}>
              <button
                onClick={clearFilters}
                className={`${utilities.btn} ${utilities.btnSecondary}`}
                disabled={!searchTerm && !roleFilter}
              >
                <Icon name="x" size={16} />
                Clear Filters
              </button>
            </div>
          </div>

          <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
            <h2 className={commonStyles.sectionTitle}>
              <Icon name="user-plus" size={20} />
              Create New User
            </h2>
            <form onSubmit={handleCreateUser} aria-busy={creating}>
              <div className={commonStyles.formGrid}>
                <div className={commonStyles.formGroup}>
                  <label htmlFor="create_name" className={commonStyles.formLabel}>Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    id="create_name"
                    className={commonStyles.formControl}
                    required
                  />
                </div>
                <div className={commonStyles.formGroup}>
                  <label htmlFor="create_email" className={commonStyles.formLabel}>Email</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    id="create_email"
                    className={commonStyles.formControl}
                    required
                  />
                </div>
                <div className={commonStyles.formGroup}>
                  <label htmlFor="create_password" className={commonStyles.formLabel}>Password</label>
                  <input
                    type="password"
                    placeholder="Secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    id="create_password"
                    className={commonStyles.formControl}
                    required
                  />
                </div>
                <div className={commonStyles.formGroup}>
                  <label htmlFor="create_role" className={commonStyles.formLabel}>Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    id="create_role"
                    className={commonStyles.formControl}
                  >
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className={`${utilities.btn} ${utilities.btnPrimary} ${commonStyles.mtMd}`}
                disabled={creating}
              >
                {creating && <InlineSpinner sizePx={16} />}
                <span style={{ marginLeft: creating ? 6 : 0 }}>
                  <Icon name="plus" size={16} />
                  {creating ? "Creating…" : "Create User"}
                </span>
              </button>
            </form>
          </div>

          <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard}`}>
            <h2 className={commonStyles.sectionTitle}>
              <Icon name="users" size={20} />
              All Users
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: 'normal', 
                color: 'var(--text-muted)', 
                marginLeft: '0.5rem' 
              }}>
                ({filteredUsers.length} users)
              </span>
            </h2>
            {loading && (
              <div style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <InlineSpinner sizePx={18} />
                <span>Loading users…</span>
              </div>
            )}
            {error && <p className={commonStyles.errorText}>Error: {error}</p>}
            {!loading && !error && (
              <div className={commonStyles.tableWrapper} aria-busy={loading}>
                <table className={commonStyles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          <Icon name="users" size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                          <p>No users found</p>
                          {(searchTerm || roleFilter) && (
                            <button 
                              onClick={clearFilters}
                              className={`${utilities.btn} ${utilities.btnSecondary}`}
                              style={{ marginTop: '1rem' }}
                            >
                              Clear Filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className={commonStyles.userAvatar}>
                              <div className={commonStyles.avatar}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`${commonStyles.roleBadge} ${commonStyles[user.role]}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className={commonStyles.actions}>
                            {isDeleting && userToDelete && userToDelete._id === user._id ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <InlineSpinner sizePx={14} />
                                <span>Deleting…</span>
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => openEditModal(user)}
                                  className={commonStyles.actionButton}
                                  disabled={isDeleting}
                                  title="Edit user"
                                >
                                  <FiEdit size={16} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className={`${commonStyles.actionButton} ${commonStyles.delete}`}
                                  disabled={isDeleting}
                                  title="Delete user"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(UsersPage, { requiredRole: "admin" });