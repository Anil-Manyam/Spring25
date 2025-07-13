// src/components/UserManagement.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:5000";
const currentUser = JSON.parse(localStorage.getItem("user"));   // ← get user_id once
const AUTH_HEADER = { "X-User-Id": currentUser.user_id };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  });

  /* -------- fetch users on mount -------- */
  useEffect(() => {
    refresh();
  }, []);

  const refresh = () =>
    fetch(`${API_BASE}/api/admin/users`, {
      headers: AUTH_HEADER
    })
      .then(r => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));

  /* -------- create user -------- */
  const createUser = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AUTH_HEADER
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          full_name: form.fullName
        })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Create failed");
      alert("User created");
      setForm({ username: "", email: "", password: "", fullName: "" });
      refresh();
    } catch {
      alert("Server error");
    }
  };

  /* -------- delete user -------- */
  const deleteUser = async id => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: AUTH_HEADER
      });
      if (res.ok) refresh();
      else {
        const data = await res.json();
        alert(data.error || "Delete failed");
      }
    } catch {
      alert("Server error");
    }
  };

  /* -------- UI -------- */
  return (
    <section style={{ marginTop: "40px" }}>
      <h3>User Management</h3>

      {/* create-user form */}
      <form onSubmit={createUser} className="user-form">
        <input
          placeholder="Username"
          required
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <input
          placeholder="Full Name"
          value={form.fullName}
          onChange={e => setForm({ ...form, fullName: e.target.value })}
        />
        <button>Create User</button>
      </form>

      {/* list all users */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Role</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.map(u => (
            <tr key={u._id} style={{ borderTop: "1px solid #ccc" }}>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.full_name}</td>
              <td>{u.user_type}</td>
              <td>
                {u.user_type !== "librarian" && (
                  <button
                    style={{ background: "red", color: "#fff" }}
                    onClick={() => deleteUser(u._id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
