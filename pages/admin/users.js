import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import Modal from "../../components/Admin/Modal/Modal";
import withAdminAuth from "../../lib/withAdminAuth";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import commonStyles from "./users.module.css";
import lightStyles from "./users.light.module.css";
import darkStyles from "./users.dark.module.css";
import utilities from "../../styles/utilities.module.css";
import { useTheme } from "../../context/ThemeContext";
import InlineSpinner from "../../components/LoadingAnimation/InlineSpinner";

// Delete Confirmation Modal (top-level so UsersPage can reference it)
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
          <div>
            <label htmlFor="edit_name" className={commonStyles.label}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              id="edit_name"
              ref={nameRef}
              className={`${commonStyles.input} ${themeStyles.input}`}
              required
            />
          </div>
          <div>
            <label htmlFor="edit_email" className={commonStyles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="edit_email"
              className={`${commonStyles.input} ${themeStyles.input}`}
              required
            />
          </div>
          <div>
            <label htmlFor="edit_role" className={commonStyles.label}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              id="edit_role"
              className={`${commonStyles.select} ${themeStyles.select}`}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
          <h1 className={`${commonStyles.pageTitle} ${themeStyles.sectionTitle}`}>
            User Management
          </h1>
          <p className={commonStyles.pageSubtitle}>
            Manage all users, their roles, and permissions in your admin system.
          </p>

          <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard} ${commonStyles.mtLg}`}>
            <h2 className={`${commonStyles.sectionTitle} ${themeStyles.sectionTitle}`}>
              <span>Create New User</span>
            </h2>
            <form onSubmit={handleCreateUser} aria-busy={creating}>
              <div className={commonStyles.formGrid}>
                <div>
                  <label htmlFor="create_name" className={commonStyles.label}>Name</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    id="create_name"
                    className={`${commonStyles.input} ${themeStyles.input}`}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="create_email" className={commonStyles.label}>Email</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    id="create_email"
                    className={`${commonStyles.input} ${themeStyles.input}`}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="create_password" className={commonStyles.label}>Password</label>
                  <input
                    type="password"
                    placeholder="Secure password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    id="create_password"
                    className={`${commonStyles.input} ${themeStyles.input}`}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="create_role" className={commonStyles.label}>Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    id="create_role"
                    className={`${commonStyles.select} ${themeStyles.select}`}
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
                <span style={{ marginLeft: creating ? 6 : 0 }}>{creating ? "Creating…" : "Create User"}</span>
              </button>
            </form>
          </div>

          <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard} ${commonStyles.mtLg}`}>
            <h2 className={`${commonStyles.sectionTitle} ${themeStyles.sectionTitle}`}>
              <span>All Users</span>
            </h2>
            {loading && (
              <div style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <InlineSpinner sizePx={18} />
                <span className={commonStyles.muted || undefined}>Loading users…</span>
              </div>
            )}
            {error && <p className={`${commonStyles.errorText} ${themeStyles.errorText}`}>Error: {error}</p>}
            {!loading && !error && (
              <div className={`${commonStyles.tableWrapper} ${themeStyles.tableWrapper}`} aria-busy={loading}>
                <table className={`${commonStyles.table} ${themeStyles.table}`}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "600",
                                fontSize: "0.875rem",
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td className={commonStyles.capitalize}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              backgroundColor: user.role === "admin" 
                                ? "rgba(59, 130, 246, 0.1)" 
                                : "rgba(16, 185, 129, 0.1)",
                              color: user.role === "admin" 
                                ? "var(--primary)" 
                                : "var(--success)",
                              border: `1px solid ${user.role === "admin" 
                                ? "rgba(59, 130, 246, 0.2)" 
                                : "rgba(16, 185, 129, 0.2)"}`
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className={`${commonStyles.actions} ${themeStyles.actions}`}>
                          {isDeleting && userToDelete && userToDelete._id === user._id ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <InlineSpinner sizePx={14} />
                              <span className={commonStyles.muted || undefined}>Deleting…</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => openEditModal(user)}
                                className={`${utilities.btn} ${utilities.btnIcon} ${themeStyles.actionButton}`}
                                disabled={isDeleting}
                                title="Edit user"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => openDeleteModal(user)}
                                className={`${utilities.btn} ${utilities.btnIcon} ${themeStyles.deleteButton}`}
                                disabled={isDeleting}
                                title="Delete user"
                              >
                                <FiTrash2 />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
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
