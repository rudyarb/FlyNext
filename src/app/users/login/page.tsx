"use client";  

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Import the auth context

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth(); // Access the login function from AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Invalid credentials");
        return;
      }

      const data = await response.json();
      const { accessToken } = data;

      // ✅ Store token
      localStorage.setItem("token", accessToken);

      // ✅ Extract firstName from JWT (without modifying API)
      const decodedPayload = JSON.parse(atob(accessToken.split(".")[1])); 
      const userName = decodedPayload.firstName;

      // ✅ Set the username and token in the AuthContext
      login(accessToken, userName); // Update context

      // ✅ Store userName in localStorage for persistence
      localStorage.setItem("userName", userName);

      // Redirect to home page after login
      router.push("/");
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center">
      <form onSubmit={handleLogin} className="space-y-8 mb-8 w-full sm:w-96 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Login</h2>
  
        {error && <p className="text-red-500 mb-4">{error}</p>}
  
        <div className="grid grid-cols-1 gap-8">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-black dark:text-white mb-2">Email</label>
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
            <label htmlFor="password" className="block text-sm font-semibold text-black dark:text-white mb-2">Password</label>
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
  
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md w-full hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Login
          </button>
        </div>
  
        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
          Don't have an account?{" "}
          <span
            className="text-blue-600 dark:text-blue-400 cursor-pointer"
            onClick={() => router.push("/users/signup")}
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
  
  
}
