"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const EditProfile = () => {
  const router = useRouter();
  const { token, userName, role, updateProfile, login, logout } = useAuth(); // Added login and logout for better handling
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userName) {
      setFormData((prevData) => ({
        ...prevData,
        firstName: userName,
        role: role || "USER",
      }));
    }
  }, [userName, role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!token) {
      setMessage("You must be logged in to edit your profile.");
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password, // Include password updates
        role: formData.role,
      };

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Update failed.");
      }

      const responseData = await res.json();
      const updatedName = responseData?.firstName || formData.firstName;
      const updatedRole = responseData?.role || formData.role;
      const newToken = responseData?.token; // Check if the response includes an updated token

      if (newToken) {
        login(newToken, updatedName, updatedRole); // Re-login with new token and updated credentials
      } else {
        updateProfile(updatedName, updatedRole); // Update profile without token change
      }

      setMessage("Profile updated successfully!");
      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">Edit Profile</h2>
        {message && (
          <p
            className={`text-center ${
              message.includes("successfully") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />

          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone (optional)"
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New Password (leave blank to keep current)"
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Hotel Manager (Admin)</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Picture (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
