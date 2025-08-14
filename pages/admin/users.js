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

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onUserUpdate }) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const nameRef = useRef(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating user...");
    try {
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
    }
  };

// Delete Confirmation Modal
const DeleteConfirmModal = ({ user, onCancel, onConfirm }) => {
  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
  const cancelRef = useRef(null);
  return (
    <Modal isOpen={true} onClose={onCancel} title="Delete User" initialFocusRef={cancelRef}>
      <p>
        Are you sure you want to delete <strong>{user?.name}</strong>? This action cannot be undone.
      </p>
      <div className={commonStyles.actionsRow}>
        <button ref={cancelRef} type="button" onClick={onCancel} className={`${utilities.btn} ${utilities.btnSecondary}`}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={`${utilities.btn} ${utilities.btnDanger}`}>
          Delete
        </button>
      </div>
    </Modal>
  );
};

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit User" initialFocusRef={nameRef}>
      <form onSubmit={handleUpdate}>
        <div className={commonStyles.formGrid}>
          <label htmlFor="edit_name" className={utilities.srOnly}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="edit_name"
            ref={nameRef}
            className={`${commonStyles.input} ${themeStyles.input}`}
          />
          <label htmlFor="edit_email" className={utilities.srOnly}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="edit_email"
            className={`${commonStyles.input} ${themeStyles.input}`}
          />
          <label htmlFor="edit_role" className={utilities.srOnly}>Role</label>
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
        <div className={commonStyles.actionsRow}>
          <button type="button" onClick={onClose} className={`${utilities.btn} ${utilities.btnSecondary}`}>
            Cancel
          </button>
          <button type="submit" className={`${utilities.btn} ${utilities.btnPrimary}`}>
            Save Changes
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

  // Create form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("editor");

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
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const toastId = toast.loading("Deleting user...");
    try {
      const res = await fetch(`/api/users/${userToDelete._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      toast.success("User deleted successfully!", { id: toastId });
      setDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (e) {
      toast.error(e.message, { id: toastId });
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
        />
      )}
      <div className={commonStyles.pageContainer}>
        <div className={commonStyles.mtLg}>
          <h1 className={`${commonStyles.pageTitle} ${themeStyles.sectionTitle}`}>User Management</h1>

          <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard} ${commonStyles.mtLg}`}>
            <h2 className={`${commonStyles.sectionTitle} ${themeStyles.sectionTitle}`}>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className={commonStyles.formGrid}>
                <label htmlFor="create_name" className={utilities.srOnly}>Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  id="create_name"
                  className={`${commonStyles.input} ${themeStyles.input}`}
                  required
                />
                <label htmlFor="create_email" className={utilities.srOnly}>Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  id="create_email"
                  className={`${commonStyles.input} ${themeStyles.input}`}
                  required
                />
                <label htmlFor="create_password" className={utilities.srOnly}>Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  id="create_password"
                  className={`${commonStyles.input} ${themeStyles.input}`}
                  required
                />
                <label htmlFor="create_role" className={utilities.srOnly}>Role</label>
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
              <button
                type="submit"
                className={`${utilities.btn} ${utilities.btnPrimary} ${commonStyles.mtMd}`}
              >
                Create User
              </button>
            </form>
          </div>

          <div className={`${commonStyles.sectionCard} ${themeStyles.sectionCard} ${commonStyles.mtLg}`}>
            <h2 className={`${commonStyles.sectionTitle} ${themeStyles.sectionTitle}`}>All Users</h2>
            {loading && <p>Loading users...</p>}
            {error && <p className={`${commonStyles.errorText} ${themeStyles.errorText}`}>Error: {error}</p>}
            {!loading && !error && (
              <div className={`${commonStyles.tableWrapper} ${themeStyles.tableWrapper}`}>
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
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td className={commonStyles.capitalize}>{user.role}</td>
                        <td className={`${commonStyles.actions} ${themeStyles.actions}`}>
                          <button
                            onClick={() => openEditModal(user)}
                            className={`${utilities.btn} ${utilities.btnIcon} ${themeStyles.actionButton}`}
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className={`${utilities.btn} ${utilities.btnIcon} ${themeStyles.deleteButton}`}
                          >
                            <FiTrash2 />
                          </button>
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
