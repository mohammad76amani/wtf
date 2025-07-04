"use client";

import { useState } from "react";

export default function ThemeAdmin() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
    
      setName("");
      setDescription("");
   
    }
  };

  return (
    <div>
      <h1>Theme Management</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
       
      </form>
   
    </div>
  );
}