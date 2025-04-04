"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("password", password);
    formData.append("role", role);
    if (phone) formData.append("phone", phone);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    try {
      const response = await fetch("/api/users/signup", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Signup failed.");
        return;
      }

      router.push("/users/login");
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-5 max-w-7xl flex items-center justify-center overflow-hidden">
      <form onSubmit={handleSignUp} className="space-y-6 w-full sm:w-96 bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Sign Up</h2>
        {error && <p className="text-red-500">{error}</p>}
        
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
        <input type="text" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-md" />
        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-4 py-2 border rounded-md" />
        
        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</button>
      </form>
    </div>
  );
}
