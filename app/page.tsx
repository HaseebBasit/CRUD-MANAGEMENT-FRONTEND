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
  const [role, setRole] = useState<"student" | "trainer">("student");

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // GET USERS
  // =========================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/users/fetch`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch users");
      }

      setUsers(result.data || []);
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Page load par users fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // POST USER
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!userName || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/user/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
          email,
          password,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save user");
      }

      setMessage(result.message || "User saved successfully!");

      // Form clear
      setUserName("");
      setEmail("");
      setPassword("");
      setRole("student");

      // Updated users fetch
      await fetchUsers();
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE USER
  // =========================
  const handleDelete = async (uid: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(uid);
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/user/delete/${uid}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete user");
      }

      setMessage(result.message || "User deleted successfully!");

      await fetchUsers();
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            User Management
          </h1>

          <p className="mt-2 text-slate-500">
            Manage users stored in your MongoDB database.
          </p>
        </div>

        {/* ================= MESSAGES ================= */}

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ================= ADD USER ================= */}

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Add New User
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter user information to save a new user.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid gap-5 md:grid-cols-2">

              {/* USER NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  User Name
                </label>

                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter user name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
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
                    setRole(e.target.value as "student" | "trainer")
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="student">Student</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "+ Add User"}
            </button>

          </form>
        </section>

        {/* ================= USERS ================= */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Existing Users
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Users currently stored in MongoDB.
              </p>
            </div>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Refresh
            </button>

          </div>

          {/* LOADING */}

          {loading && users.length === 0 && (
            <div className="py-12 text-center text-slate-500">
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

          {/* USER TABLE */}

          {users.length > 0 && (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>
                  <tr className="border-b border-slate-200 text-left">

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
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-100 last:border-0"
                    >

                      {/* USER */}
                      <td className="px-4 py-5">

                        <div className="font-semibold text-slate-900">
                          {user.userName}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          ID: {user._id}
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

                      {/* DELETE */}
                      <td className="px-4 py-5">

                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={deletingId === user._id}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === user._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}