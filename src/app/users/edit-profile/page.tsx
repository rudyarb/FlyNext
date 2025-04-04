"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const EditProfile = () => {
  const router = useRouter();

  // Local state for token and form data
  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Only fetch the token from localStorage on the client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      } else {
        setMessage("You must be logged in to edit your profile.");
      }
    }
  }, []);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (PUT request to update profile)
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
      const res = await fetch("/api/users/profile", {
        method: "PUT", // Use PUT request to update profile
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Correct way to send token in Authorization header
        },
        body: JSON.stringify(formData), // Send the updated form data
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Update failed");

      setMessage("Profile updated successfully!");
      setTimeout(() => router.push("/dashboard"), 1500); // Redirect after update

    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">Edit Profile</h2>

        {message && <p className="text-center mt-2 text-red-500">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            disabled // Disable to avoid accidental changes to email
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
