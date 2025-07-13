// // src/components/UserManagement.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API_BASE = "http://127.0.0.1:5000";

// export default function UserManagement() {
//   /* -------- auth helper -------- */
//   const navigate = useNavigate();
//   const stored = localStorage.getItem("user");
//   const currentUser = stored ? JSON.parse(stored) : null;
//   const user_id = currentUser?.user_id;
//   const isLibrarian = currentUser?.user_type === "librarian";

//   /* if not authorised, bail out (or redirect) */
//   useEffect(() => {
//     if (!isLibrarian) {
//       navigate("/login");              // <-- you can change this target
//     }
//   }, []);

//   /* headers used on every request when authorised */
//   const AUTH_HEADER = user_id ? { "X-User-Id": user_id } : {};

//   /* ---------------------------------- state ---------------------------------- */
//   const [users, setUsers] = useState([]);
//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     fullName: ""
//   });

//   /* ---------------- fetch users on mount ---------------- */
//   useEffect(() => {
//     if (isLibrarian) refresh();
//   }, [isLibrarian]);          // run only when authorised

//   const refresh = () =>
//     fetch(`${API_BASE}/api/admin/users`, { headers: AUTH_HEADER })
//       .then(r => r.json())
//       .then(setUsers)
//       .catch(() => setUsers([]));

//   /* ---------------- create user ---------------- */
//   const createUser = async e => {
//     e.preventDefault();
//     if (!isLibrarian) return;

//     try {
//       const res = await fetch(`${API_BASE}/api/admin/users`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", ...AUTH_HEADER },
//         body: JSON.stringify({
//           username: form.username,
//           email: form.email,
//           password: form.password,
//           full_name: form.fullName
//         })
//       });
//       const data = await res.json();
//       if (!res.ok) return alert(data.error || "Create failed");
//       alert("User created");
//       setForm({ username: "", email: "", password: "", fullName: "" });
//       refresh();
//     } catch {
//       alert("Server error");
//     }
//   };

//   /* ---------------- delete user ---------------- */
//   const deleteUser = async id => {
//     if (!window.confirm("Delete this user?") || !isLibrarian) return;
//     try {
//       const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
//         method: "DELETE",
//         headers: AUTH_HEADER
//       });
//       if (res.ok) refresh();
//       else {
//         const data = await res.json();
//         alert(data.error || "Delete failed");
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   /* ---------------- UI ---------------- */
//   if (!isLibrarian) return null;           // nothing to render for non-admins

//   return (
//     <section style={{ marginTop: "40px" }}>
//       <h3>User Management</h3>

//       {/* create-user form */}
//       <form onSubmit={createUser} className="user-form">
//         <input
//           placeholder="Username"
//           required
//           value={form.username}
//           onChange={e => setForm({ ...form, username: e.target.value })}
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           required
//           value={form.email}
//           onChange={e => setForm({ ...form, email: e.target.value })}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           required
//           value={form.password}
//           onChange={e => setForm({ ...form, password: e.target.value })}
//         />
//         <input
//           placeholder="Full Name"
//           value={form.fullName}
//           onChange={e => setForm({ ...form, fullName: e.target.value })}
//         />
//         <button>Create User</button>
//       </form>

//       {/* list all users */}
//       <table className="user-table">
//         <thead>
//           <tr>
//             <th>Username</th>
//             <th>Email</th>
//             <th>Full Name</th>
//             <th>Role</th>
//             <th />
//           </tr>
//         </thead>
//         <tbody>
//           {Array.isArray(users) && users.map(u => (
//             <tr key={u._id} style={{ borderTop: "1px solid #ccc" }}>
//               <td>{u.username}</td>
//               <td>{u.email}</td>
//               <td>{u.full_name}</td>
//               <td>{u.user_type}</td>
//               <td>
//                 {u.user_type !== "librarian" && (
//                   <button
//                     style={{ background: "red", color: "#fff" }}
//                     onClick={() => deleteUser(u._id)}
//                   >
//                     Delete
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </section>
//   );
// }

// src/components/UserManagement.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000";

export default function UserManagement() {
  /* ---------- auth helper ---------- */
  const navigate = useNavigate();
  const stored = localStorage.getItem("user");
  const currentUser = stored ? JSON.parse(stored) : null;
  const user_id = currentUser?.user_id;
  const isLibrarian = currentUser?.user_type === "librarian";

  /* redirect non-librarians */
  useEffect(() => {
    if (!isLibrarian) navigate("/login");
  }, []);

  /* request header */
  const AUTH_HEADER = user_id ? { "X-User-Id": user_id } : {};

  /* ---------- state ---------- */
  const [users, setUsers]   = useState([]);
  const [loans, setLoans]   = useState([]);        // NEW
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  });

  /* ---------- data fetch helpers ---------- */
  const fetchUsers = () =>
    fetch(`${API_BASE}/api/admin/users`, { headers: AUTH_HEADER })
      .then(r => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));

  const fetchLoans = () =>                     // NEW
    fetch(`${API_BASE}/api/loans/all`, { headers: AUTH_HEADER })
      .then(r => r.json())
      .then(setLoans)
      .catch(() => setLoans([]));

  /* fetch on mount */
  useEffect(() => {
    if (isLibrarian) {
      fetchUsers();
      fetchLoans();                             // NEW
    }
  }, [isLibrarian]);

  /* ---------- create user ---------- */
  const createUser = async e => {
    e.preventDefault();
    if (!isLibrarian) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify({
          username: form.username,
          email:    form.email,
          password: form.password,
          full_name: form.fullName
        })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Create failed");
      alert("User created");
      setForm({ username: "", email: "", password: "", fullName: "" });
      fetchUsers();
    } catch {
      alert("Server error");
    }
  };

  /* ---------- delete user ---------- */
  const deleteUser = async id => {
    if (!window.confirm("Delete this user?") || !isLibrarian) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: AUTH_HEADER
      });
      if (res.ok) fetchUsers();
      else {
        const data = await res.json();
        alert(data.error || "Delete failed");
      }
    } catch {
      alert("Server error");
    }
  };

  /* ---------- UI ---------- */
  if (!isLibrarian) return null;

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

      {/* users table */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th><th>Email</th><th>Full Name</th><th>Role</th><th />
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
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

      {/* ---------- current borrowers ---------- */}
      <h4 style={{ marginTop: "35px" }}>Current Borrowers</h4>
      {loans.length === 0 ? (
        <p>No books are currently borrowed.</p>
      ) : (
        loans.map(l => (
          <div key={l.book_id + l.borrow_date}>
            {l.title} (ISBN {l.isbn}) — User: {l.username} — Borrowed:&nbsp;
            {new Date(l.borrow_date).toLocaleDateString()} — Due:&nbsp;
            {new Date(l.due_date).toLocaleDateString()}
          </div>
        ))
      )}
    </section>
  );
}
