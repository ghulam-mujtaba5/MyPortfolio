  const { theme } = useTheme();
  const themeStyles = theme === "dark" ? darkStyles : lightStyles;
import { useState, useEffect } from "react";
import AdminLayout from "../../components/Admin/AdminLayout/AdminLayout";
import withAdminAuth from "../../lib/withAdminAuth";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import commonStyles from "./users.module.css";
import lightStyles from "./users.light.module.css";
import darkStyles from "./users.dark.module.css";
import { useTheme } from "../../context/ThemeContext";

// Edit User Modal Component
const EditUserModal = ({ user, onClose, onUserUpdate }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Edit User</h2>
        <form onSubmit={handleUpdate}>
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      const toastId = toast.loading("Deleting user...");
      try {
        const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to delete user");
        toast.success("User deleted successfully!", { id: toastId });
        fetchUsers();
      } catch (e) {
        toast.error(e.message, { id: toastId });
      }
    }
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
      <div className="container mx-auto px-4 sm:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100">
            User Management
          </h1>

          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
                  required
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Create User
              </button>
            </form>
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">All Users</h2>
            {loading && <p>Loading users...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
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
                        <td className="capitalize">{user.role}</td>
                        <td className={`${commonStyles.actions} ${themeStyles.actions}`}>
                          <button
                            onClick={() => openEditModal(user)}
                            className={`${commonStyles.actionButton} ${themeStyles.actionButton}`}
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className={`${commonStyles.deleteButton} ${themeStyles.deleteButton}`}
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
