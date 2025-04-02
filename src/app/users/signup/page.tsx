"use client";  // Client component needed for useState & useRouter

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER"); // Default to USER
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, password, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Signup failed.");
        return;
      }

      // Redirect to login page after successful signup
      router.push("/users/login");
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-5 max-w-7xl flex items-center justify-center overflow-hidden">
      <form onSubmit={handleSignUp} className="space-y-6 mb-0 w-full sm:w-96 bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Sign Up</h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-black dark:text-white mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
  
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-black dark:text-white mb-1">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
            />
          </div>
  
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-black dark:text-white mb-1">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
            />
          </div>
  
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-black dark:text-white mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
  
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-black dark:text-white mb-1">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
  
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md w-full hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Sign Up
          </button>
        </div>
        
        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
          Already have an account? {" "}
          <span
            className="text-blue-600 dark:text-blue-400 cursor-pointer"
            onClick={() => router.push("/users/login")}
          >
            Log in
          </span>
        </p>
      </form>
    </div>
  );
}
