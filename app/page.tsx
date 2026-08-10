"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  userName: string;
  email: string;
  role: "student" | "trainer";
  createdAt?: string;
}

const API_URL = "https://crud-management-backend.onrender.com";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =
    useState<"student" | "trainer">("student");

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(
    null
  );
  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );
  const [deletingAll, setDeletingAll] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [deleteUser, setDeleteUser] = useState<User | null>(
    null
  );

  const [showDeleteAllModal, setShowDeleteAllModal] =
    useState(false);

  // =========================
  // SUCCESS MESSAGE
  // =========================

  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // =========================
  // ERROR MESSAGE
  // =========================

  const showError = (text: string) => {
    setError(text);

    setTimeout(() => {
      setError("");
    }, 4000);
  };

  // =========================
  // GET USERS
  // =========================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/users/fetch`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch users"
        );
      }

      setUsers(result.data || []);
    } catch (error: any) {
      showError(
        error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setUserName("");
    setEmail("");
    setPassword("");
    setRole("student");
    setEditingId(null);
  };

  // =========================
  // EDIT USER
  // =========================

  const handleEdit = (user: User) => {
    setUserName(user.userName);
    setEmail(user.email);
    setRole(user.role);
    setPassword("");

    setEditingId(user._id);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CREATE / UPDATE USER
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!userName.trim() || !email.trim()) {
      showError("Please fill all required fields.");
      return;
    }

    if (!editingId && !password.trim()) {
      showError(
        "Password is required for a new user."
      );
      return;
    }

    try {
      setLoading(true);

      // =========================
      // UPDATE
      // =========================

      if (editingId) {
        setUpdatingId(editingId);

        const updateData: {
          userName: string;
          email: string;
          role: "student" | "trainer";
          password?: string;
        } = {
          userName: userName.trim(),
          email: email.trim(),
          role,
        };

        if (password.trim()) {
          updateData.password = password;
        }

        const response = await fetch(
          `${API_URL}/user/update/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to update user"
          );
        }

        showMessage(
          result.message ||
            "User updated successfully!"
        );

        resetForm();

        await fetchUsers();

        return;
      }

      // =========================
      // CREATE
      // =========================

      const response = await fetch(
        `${API_URL}/user/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: userName.trim(),
            email: email.trim(),
            password,
            role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to save user"
        );
      }

      showMessage(
        result.message ||
          "User saved successfully!"
      );

      resetForm();

      await fetchUsers();
    } catch (error: any) {
      showError(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
      setUpdatingId(null);
    }
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================

  const handleDeleteClick = (user: User) => {
    setDeleteUser(user);
    setMessage("");
    setError("");
  };

  // =========================
  // DELETE ONE USER
  // =========================

  const confirmDelete = async () => {
    if (!deleteUser) return;

    try {
      setDeletingId(deleteUser._id);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/user/delete/${deleteUser._id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete user"
        );
      }

      setDeleteUser(null);

      showMessage(
        result.message ||
          "User deleted successfully!"
      );

      await fetchUsers();
    } catch (error: any) {
      setDeleteUser(null);

      showError(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // OPEN DELETE ALL MODAL
  // =========================

  const handleDeleteAllClick = () => {
    if (users.length === 0) {
      showError("There are no users to delete.");
      return;
    }

    setShowDeleteAllModal(true);
    setMessage("");
    setError("");
  };

  // =========================
  // DELETE ALL USERS
  // =========================

  const confirmDeleteAll = async () => {
    try {
      setDeletingAll(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/users/delete-all`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete all users"
        );
      }

      setShowDeleteAllModal(false);

      resetForm();

      showMessage(
        result.message ||
          "All users deleted successfully!"
      );

      await fetchUsers();
    } catch (error: any) {
      setShowDeleteAllModal(false);

      showError(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6 sm:py-10">

      <div className="mx-auto w-full max-w-6xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-7 sm:mb-8">

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage users stored in your MongoDB database.
          </p>

        </div>

        {/* =========================
            SUCCESS MESSAGE
        ========================= */}

        {message && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm font-medium text-green-700">

            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs text-white">
              ✓
            </div>

            <div className="flex-1">
              {message}
            </div>

            <button
              type="button"
              onClick={() => setMessage("")}
              className="text-lg leading-none text-green-600 hover:text-green-800"
            >
              ×
            </button>

          </div>
        )}

        {/* =========================
            ERROR MESSAGE
        ========================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">

            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs text-white">
              !
            </div>

            <div className="flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-lg leading-none text-red-600 hover:text-red-800"
            >
              ×
            </button>

          </div>
        )}

        {/* =========================
            ADD / UPDATE USER
        ========================= */}

        <section className="mb-7 rounded-2xl bg-white p-4 shadow-sm sm:mb-8 sm:p-6">

          <div className="mb-6">

            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {editingId
                ? "Update User"
                : "Add New User"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingId
                ? "Update the selected user's information."
                : "Enter user information to save a new user."}
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">

              {/* USER NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  User Name
                </label>

                <input
                  type="text"
                  value={userName}
                  onChange={(e) =>
                    setUserName(e.target.value)
                  }
                  placeholder="Enter user name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">

                  Password

                  {editingId && (
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      Optional
                    </span>
                  )}

                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder={
                    editingId
                      ? "Leave empty to keep current password"
                      : "Enter password"
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                />

              </div>

              {/* ROLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value as
                        | "student"
                        | "trainer"
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                >

                  <option value="student">
                    Student
                  </option>

                  <option value="trainer">
                    Trainer
                  </option>

                </select>

              </div>

            </div>

            {/* BUTTONS */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {editingId
                  ? updatingId
                    ? "Updating..."
                    : "Update User"
                  : loading
                    ? "Saving..."
                    : "+ Add User"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMessage("");
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* =========================
            EXISTING USERS
        ========================= */}

        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Existing Users
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Users currently stored in MongoDB.
              </p>

            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

              {/* REFRESH */}

              <button
                onClick={fetchUsers}
                disabled={loading || deletingAll}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
              >
                Refresh
              </button>

              {/* DELETE ALL */}

              <button
                onClick={handleDeleteAllClick}
                disabled={
                  users.length === 0 ||
                  loading ||
                  deletingAll
                }
                className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {deletingAll
                  ? "Deleting All..."
                  : "Delete All"}
              </button>

            </div>

          </div>

          {/* USER COUNT */}

          {users.length > 0 && (
            <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">

              Total Users:{" "}

              <span className="font-bold text-slate-900">
                {users.length}
              </span>

            </div>
          )}

          {/* LOADING */}

          {loading && users.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading users...
            </div>
          )}

          {/* EMPTY */}

          {!loading && users.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">

              <p className="font-semibold text-slate-700">
                No users found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add a user using the form above.
              </p>

            </div>
          )}

          {/* TABLE */}

          {users.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">

              <table className="w-full min-w-[850px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50 text-left">

                    <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                      User
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                      Email
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                      Role
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {users.map((user) => (

                    <tr
                      key={user._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >

                      {/* USER */}

                      <td className="px-4 py-5">

                        <div className="font-semibold text-slate-900">
                          {user.userName}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          ID: {user._id.slice(0, 8)}
                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-4 py-5 text-sm text-slate-600">
                        {user.email}
                      </td>

                      {/* ROLE */}

                      <td className="px-4 py-5">

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                          {user.role}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-4 py-5">

                        <div className="flex flex-wrap gap-2">

                          <button
                            onClick={() =>
                              handleEdit(user)
                            }
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteClick(user)
                            }
                            disabled={
                              deletingId ===
                              user._id
                            }
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            user._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

      {/* =========================
          DELETE ONE MODAL
      ========================= */}

      {deleteUser && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
              !
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Delete User?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete
              this user? This action cannot be
              undone.
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">

              <p className="font-semibold text-slate-900">
                {deleteUser.userName}
              </p>

              <p className="mt-1 break-all text-sm text-slate-500">
                {deleteUser.email}
              </p>

              <p className="mt-1 text-xs capitalize text-slate-400">
                {deleteUser.role}
              </p>

            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setDeleteUser(null)
                }
                disabled={
                  deletingId ===
                  deleteUser._id
                }
                className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={
                  deletingId ===
                  deleteUser._id
                }
                className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {deletingId ===
                deleteUser._id
                  ? "Deleting..."
                  : "Yes, Delete User"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          DELETE ALL MODAL
      ========================= */}

      {showDeleteAllModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
              !
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Delete All Users?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently delete all{" "}
              <span className="font-bold text-red-600">
                {users.length}
              </span>{" "}
              users from the database.
            </p>

            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">

              <p className="text-sm font-semibold text-red-700">
                ⚠ This action cannot be undone.
              </p>

              <p className="mt-1 text-xs text-red-600">
                All user records will be permanently
                removed.
              </p>

            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setShowDeleteAllModal(false)
                }
                disabled={deletingAll}
                className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteAll}
                disabled={deletingAll}
                className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {deletingAll
                  ? "Deleting All..."
                  : "Yes, Delete All"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}
