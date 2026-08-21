"use client";

import { useEffect, useRef, useState } from "react";

interface User {
  _id: string;
  userName: string;
  email: string;
  password?: string;
  role: "student" | "trainer";
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL =
  "https://crud-management-backend.onrender.com";

// =========================
// HELPERS
// =========================

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return "";

  // Already complete URL
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  // Backend stores /uploads/filename
  return `${API_URL}${
    imagePath.startsWith("/") ? "" : "/"
  }${imagePath}`;
};

const getTimeAgo = (date?: string) => {
  if (!date) return "Unknown time";

  const created = new Date(date).getTime();
  const now = Date.now();

  const difference = Math.max(0, now - created);

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  if (weeks < 5) {
    return `${weeks} week${
      weeks === 1 ? "" : "s"
    } ago`;
  }

  if (months < 12) {
    return `${months} month${
      months === 1 ? "" : "s"
    } ago`;
  }

  return `${years} year${
    years === 1 ? "" : "s"
  } ago`;
};

// =========================
// MAIN COMPONENT
// =========================

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  // =========================
  // FORM STATES
  // =========================

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] =
    useState<"student" | "trainer">("student");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [selectedImageName, setSelectedImageName] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // =========================
  // LOADING STATES
  // =========================

  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [deletingAll, setDeletingAll] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  // =========================
  // MESSAGES
  // =========================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // DELETE MODALS
  // =========================

  const [deleteUser, setDeleteUser] =
    useState<User | null>(null);

  const [showDeleteAllModal, setShowDeleteAllModal] =
    useState(false);

  // =========================
  // OPERATION STATES
  // =========================

  const isEditMode = editingId !== null;

  const isDeleteMode =
    deletingId !== null || deletingAll;

  const isBusy =
    loading ||
    uploadingImage ||
    isDeleteMode;

  // =========================
  // SUCCESS MESSAGE
  // =========================

  const showMessage = (text: string) => {
    setMessage(text);
    setError("");

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // =========================
  // ERROR MESSAGE
  // =========================

  const showError = (text: string) => {
    setError(text);
    setMessage("");

    setTimeout(() => {
      setError("");
    }, 4000);
  };

  // =========================
  // FETCH USERS
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
          result.message ||
            "Failed to fetch users"
        );
      }

      setUsers(result.data || []);
    } catch (error: any) {
      showError(
        error.message ||
          "Something went wrong"
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

    setSelectedImage(null);
    setSelectedImageName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================
  // IMAGE SELECT
  // =========================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
    ];

    if (!allowedTypes.includes(file.type)) {
      showError(
        "Only PNG and JPEG images are allowed."
      );

      e.target.value = "";
      setSelectedImage(null);
      setSelectedImageName("");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError(
        "File too large! Maximum size is 5 MB."
      );

      e.target.value = "";
      setSelectedImage(null);
      setSelectedImageName("");

      return;
    }

    setSelectedImage(file);
    setSelectedImageName(file.name);

    setMessage("");
    setError("");
  };

  // =========================
  // UPLOAD IMAGE
  // =========================

  const uploadImage = async () => {
    if (!selectedImage) {
      return "";
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();

      formData.append(
        "image",
        selectedImage
      );

      const response = await fetch(
        `${API_URL}/api/profile/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to upload image"
        );
      }

      return result.data.url;
    } catch (error: any) {
      throw new Error(
        error.message ||
          "Image upload failed"
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // =========================
  // EDIT USER
  // =========================

  const handleEdit = (user: User) => {
    if (isDeleteMode) {
      return;
    }

    setUserName(user.userName);
    setEmail(user.email);
    setRole(user.role);
    setPassword("");

    setSelectedImage(null);
    setSelectedImageName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setEditingId(user._id);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (isDeleteMode) {
      return;
    }

    setMessage("");
    setError("");

    if (
      !userName.trim() ||
      !email.trim()
    ) {
      showError(
        "Please fill all required fields."
      );
      return;
    }

    if (
      !editingId &&
      !password.trim()
    ) {
      showError(
        "Password is required for a new user."
      );
      return;
    }

    try {
      setLoading(true);

      // =========================
      // UPDATE USER
      // =========================

      if (editingId) {
        setUpdatingId(editingId);

        let profileImage:
          | string
          | undefined;

        if (selectedImage) {
          profileImage =
            await uploadImage();
        }

        const updateData: {
          userName: string;
          email: string;
          role:
            | "student"
            | "trainer";
          password?: string;
          profileImage?: string;
        } = {
          userName:
            userName.trim(),
          email:
            email.trim(),
          role,
        };

        if (password.trim()) {
          updateData.password =
            password.trim();
        }

        if (profileImage) {
          updateData.profileImage =
            profileImage;
        }

        const response = await fetch(
          `${API_URL}/user/update/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              updateData
            ),
          }
        );

        const result =
          await response.json();

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
      // CREATE USER
      // =========================

      let profileImage = "";

      if (selectedImage) {
        profileImage =
          await uploadImage();
      }

      const response = await fetch(
        `${API_URL}/user/save`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            userName:
              userName.trim(),
            email:
              email.trim(),
            password:
              password.trim(),
            role,
            profileImage,
          }),
        }
      );

      const result =
        await response.json();

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
  // DELETE USER CLICK
  // =========================

  const handleDeleteClick = (
    user: User
  ) => {
    if (isEditMode) {
      return;
    }

    if (isDeleteMode) {
      return;
    }

    setDeleteUser(user);

    setMessage("");
    setError("");
  };

  // =========================
  // CONFIRM DELETE USER
  // =========================

  const confirmDelete = async () => {
    if (!deleteUser) {
      return;
    }

    try {
      setDeletingId(
        deleteUser._id
      );

      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/user/delete/${deleteUser._id}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

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
  // DELETE ALL CLICK
  // =========================

  const handleDeleteAllClick = () => {
    if (isEditMode) {
      return;
    }

    if (
      isDeleteMode ||
      loading
    ) {
      return;
    }

    if (users.length === 0) {
      showError(
        "There are no users to delete."
      );
      return;
    }

    setShowDeleteAllModal(true);

    setMessage("");
    setError("");
  };

  // =========================
  // CONFIRM DELETE ALL
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

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete all users"
        );
      }

      setShowDeleteAllModal(
        false
      );

      resetForm();

      showMessage(
        result.message ||
          "All users deleted successfully!"
      );

      await fetchUsers();
    } catch (error: any) {
      setShowDeleteAllModal(
        false
      );

      showError(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setDeletingAll(false);
    }
  };

  // =========================
  // JSX
  // =========================

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6 sm:py-10">

      <div className="mx-auto w-full max-w-6xl">

        {/* HEADER */}

        <div className="mb-7 sm:mb-8">

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            User Management
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Manage users stored in your MongoDB database.
          </p>

        </div>

        {/* SUCCESS MESSAGE */}

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
              onClick={() =>
                setMessage("")
              }
              className="text-lg leading-none text-green-600 hover:text-green-800"
            >
              ×
            </button>

          </div>
        )}

        {/* ERROR MESSAGE */}

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
              onClick={() =>
                setError("")
              }
              className="text-lg leading-none text-red-600 hover:text-red-800"
            >
              ×
            </button>

          </div>
        )}

        {/* ADD / UPDATE */}

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
                    setUserName(
                      e.target.value
                    )
                  }
                  placeholder="Enter user name"
                  disabled={isDeleteMode}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter email"
                  disabled={isDeleteMode}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder={
                    editingId
                      ? "Leave empty to keep current password"
                      : "Enter password"
                  }
                  disabled={isDeleteMode}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                  disabled={isDeleteMode}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                >

                  <option value="student">
                    Student
                  </option>

                  <option value="trainer">
                    Trainer
                  </option>

                </select>

              </div>

              {/* PROFILE IMAGE */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Profile Image
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                  {/* FILE INPUT */}

                  <input
                    ref={fileInputRef}
                    id="profile-image"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={
                      handleImageChange
                    }
                    disabled={isDeleteMode}
                    className="hidden"
                  />

                  {/* CHOOSE FILE */}

                  <label
                    htmlFor="profile-image"
                    className={`inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 ${
                      isDeleteMode
                        ? "pointer-events-none cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    {selectedImageName
                      ? selectedImageName
                      : "Choose File"}
                  </label>

                  {/* IMAGE SELECTED */}

                  {selectedImage && (
                    <span className="break-all text-sm text-slate-500">
                      Image selected
                    </span>
                  )}

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Only PNG and JPEG files are allowed. Maximum size: 5 MB.
                </p>

              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <button
                type="submit"
                disabled={
                  isDeleteMode ||
                  loading ||
                  uploadingImage
                }
                className="w-full rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {editingId
                  ? updatingId
                    ? "Updating..."
                    : "Update User"
                  : loading ||
                      uploadingImage
                    ? uploadingImage
                      ? "Uploading..."
                      : "Saving..."
                    : "+ Add User"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      isDeleteMode ||
                      loading
                    ) {
                      return;
                    }

                    resetForm();
                    setMessage("");
                    setError("");
                  }}
                  disabled={
                    isDeleteMode ||
                    loading
                  }
                  className="w-full rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </section>

        {/* EXISTING USERS */}

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
                disabled={
                  loading ||
                  isDeleteMode ||
                  isEditMode ||
                  uploadingImage
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Refresh
              </button>

              {/* DELETE ALL */}

              <button
                onClick={
                  handleDeleteAllClick
                }
                disabled={
                  users.length === 0 ||
                  loading ||
                  deletingAll ||
                  isEditMode ||
                  isDeleteMode ||
                  uploadingImage
                }
                className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
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

          {loading &&
            users.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-500">
                Loading users...
              </div>
            )}

          {/* EMPTY */}

          {!loading &&
            users.length === 0 && (
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

              <table className="w-full min-w-[1050px]">

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
                      Profile Image
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                      Added
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {users.map((user) => {

                    const imageUrl =
                      getImageUrl(
                        user.profileImage
                      );

                    const rowIsBeingDeleted =
                      deletingId ===
                      user._id;

                    return (
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
                            ID:{" "}
                            {user._id.slice(
                              0,
                              8
                            )}
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

                        {/* PROFILE IMAGE */}

                        <td className="px-4 py-5">

                          {imageUrl ? (
                            <div className="flex items-center gap-3">

                              <img
                                src={imageUrl}
                                alt={`${user.userName} profile`}
                                className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                              />

                              {/* OPEN IMAGE */}

                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-95"
                              >
                                <span>
                                  ↗
                                </span>

                                Open Image
                              </a>

                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No image
                            </span>
                          )}

                        </td>

                        {/* TIME */}

                        <td className="px-4 py-5">

                          <span className="text-sm font-medium text-slate-600">
                            {getTimeAgo(
                              user.createdAt
                            )}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-5">

                          <div className="flex flex-wrap gap-2">

                            {/* EDIT */}

                            <button
                              onClick={() =>
                                handleEdit(
                                  user
                                )
                              }
                              disabled={
                                isEditMode ||
                                isDeleteMode ||
                                loading ||
                                uploadingImage
                              }
                              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {editingId ===
                              user._id
                                ? "Editing..."
                                : "Edit"}
                            </button>

                            {/* DELETE */}

                            <button
                              onClick={() =>
                                handleDeleteClick(
                                  user
                                )
                              }
                              disabled={
                                isEditMode ||
                                isDeleteMode ||
                                loading ||
                                uploadingImage
                              }
                              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {rowIsBeingDeleted
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

      {/* =========================
          DELETE USER MODAL
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
                  deletingId !== null
                }
                className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmDelete
                }
                disabled={
                  deletingId !== null
                }
                className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {deletingId !== null
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
                  setShowDeleteAllModal(
                    false
                  )
                }
                disabled={
                  deletingAll
                }
                className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmDeleteAll
                }
                disabled={
                  deletingAll
                }
                className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
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
