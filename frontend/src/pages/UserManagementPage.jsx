// // src/pages/UserManagementPage.jsx
// import React, { useEffect, useState } from "react";
// import Layout from "../components/Layout";

// export default function UserManagementPage() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const [users, setUsers] = useState([]);
//   const [loans, setLoans] = useState([]);
//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     fullName: ""
//   });
//   useEffect(() => {
//     document.body.className = "UserManagement-page";
//     return () => {
//       document.body.className = ""; 
//     };
//     }, []);

//   const isLibrarian = user?.user_type === "librarian";
//   const AUTH_HEADER = user?.user_id ? { "X-User-Id": user.user_id } : {};

//   useEffect(() => {
//     if (!isLibrarian) return;
//     fetchUsers();
//     fetchLoans();
//   }, [isLibrarian]);

//   const fetchUsers = () =>
//     fetch("http://127.0.0.1:5000/api/admin/users", { headers: AUTH_HEADER })
//       .then((res) => res.json())
//       .then((data) => setUsers(Array.isArray(data) ? data : []))
//       .catch(() => setUsers([]));

//   const fetchLoans = () =>
//     fetch("http://127.0.0.1:5000/api/loans/all", { headers: AUTH_HEADER })
//       .then((res) => res.json())
//       .then((data) => setLoans(Array.isArray(data) ? data : []))
//       .catch(() => setLoans([]));

//   const handleCreateUser = async (e) => {
//     e.preventDefault();
//     const { username, email, password, fullName } = form;
//     if (!username || !email || !password || !fullName) {
//       alert("Please fill all fields.");
//       return;
//     }

//     try {
//       const res = await fetch("http://127.0.0.1:5000/api/admin/users", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", ...AUTH_HEADER },
//         body: JSON.stringify({ username, email, password, full_name: fullName })
//       });
//       const data = await res.json();

//       if (!res.ok) return alert(data.error || "User creation failed.");
//       alert("User created.");
//       setForm({ username: "", email: "", password: "", fullName: "" });
//       fetchUsers();
//     } catch {
//       alert("Server error.");
//     }
//   };

//   const deleteUser = async (id, userType) => {
//     if (userType === "librarian") return alert("You cannot delete a librarian.");
//     if (!window.confirm("Are you sure you want to delete this user?")) return;

//     try {
//       const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${id}`, {
//         method: "DELETE",
//         headers: AUTH_HEADER
//       });
//       const data = await res.json();
//       if (!res.ok) return alert(data.error || "Delete failed.");
//       alert("User deleted.");
//       fetchUsers();
//     } catch {
//       alert("Server error.");
//     }
//   };

//   const isOverdue = (dueDate) => {
//     const now = new Date();
//     return new Date(dueDate) < now;
//   };

//   if (!isLibrarian) return <Layout><p className="p-6">Unauthorized access.</p></Layout>;

//   return (
//     <Layout>
//       <div className="user-management-form space-y-10">
//         <h2 className="text-3xl font-bold">👥 User Management</h2>

//         {/* Create User Form */}
//         <form onSubmit={handleCreateUser} className="bg-white p-6 rounded shadow space-y-4">
//           <h3 className="text-xl font-semibold mb-2">➕ Create New User</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="p-2 border rounded" required />
//             <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="p-2 border rounded" required />
//             <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="p-2 border rounded" required />
//             <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="p-2 border rounded" />
//           </div>
//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//             Create User
//           </button>
//         </form>

//         {/* Users Table */}
//         <div className="bg-white p-4 rounded shadow overflow-x-auto">
//           <h3 className="text-xl font-semibold mb-4">📋 All Users</h3>
//           <table className="user-table w-full text-sm text-left border border-black border-collapse">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="border border-black px-3 py-2">Username</th>
//                 <th className="border border-black px-3 py-2">Email</th>
//                 <th className="border border-black px-3 py-2">Role</th>
//                 <th className="border border-black px-3 py-2">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((u) => (
//                 <tr key={u._id}>
//                   <td className="border border-black px-3 py-2">{u.username}</td>
//                   <td className="border border-black px-3 py-2">{u.email}</td>
//                   <td className="border border-black px-3 py-2 capitalize">{u.user_type}</td>
//                   <td className="border border-black px-3 py-2">
//                     {u.user_type !== "librarian" && (
//                       <button
//                         style={{ background: "red", color: "#fff", padding: "6px 12px", borderRadius: "5px", border: "none", cursor: "pointer" }}
//                         onMouseOver={(e) => (e.target.style.background = "#cc0000")}
//                         onMouseOut={(e) => (e.target.style.background = "red")}
//                         onClick={() => deleteUser(u._id, u.user_type)}
//                       >
//                         Delete
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Current Borrowers Section */}
//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="text-xl font-semibold mb-4">📚 Current Borrowers</h3>
//           {loans.length === 0 ? (
//             <p>No books are currently borrowed.</p>
//           ) : (
//             <div className="borrow-history space-y-4">
//               {loans.map((loan) => {
//                 const borrowDate = new Date(loan.borrow_date).toLocaleDateString();
//                 const dueDate = new Date(loan.due_date).toLocaleDateString();
//                 const overdue = isOverdue(loan.due_date);

//                 return (
//                   <div key={loan.book_id + loan.borrow_date} className="borrowed-book-card">
//                     <h4>{loan.title}</h4>
//                     <p><strong>ISBN:</strong> {loan.isbn}</p>
//                     <p><strong>Borrowed By:</strong> {loan.username}</p>
//                     <p><strong>Borrowed On:</strong> {borrowDate}</p>
//                     <p><strong>Due On:</strong> {dueDate}</p>
//                     <p>
//                       <span className={`inline-block px-3 py-1 mt-2 text-sm rounded-full font-medium ${
//                         overdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
//                       }`}>
//                         {overdue ? "Overdue" : "On Time"}
//                       </span>
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }






// // src/pages/UserManagementPage.jsx
// import React, { useEffect, useState } from "react";
// import Layout from "../components/Layout";

// export default function UserManagementPage() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const [users, setUsers] = useState([]);
//   const [loans, setLoans] = useState([]);
//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     password: "",
//     fullName: ""
//   });

//   const isLibrarian = user?.user_type === "librarian";
//   const AUTH_HEADER = user?.user_id ? { "X-User-Id": user.user_id } : {};

//   useEffect(() => {
//     document.body.className = "UserManagement-page";
//     return () => {
//       document.body.className = "";
//     };
//   }, []);

//   useEffect(() => {
//     if (!isLibrarian) return;
//     fetchUsers();
//     fetchLoans();
//   }, [isLibrarian]);

//   const fetchUsers = () =>
//     fetch("http://127.0.0.1:5000/api/admin/users", { headers: AUTH_HEADER })
//       .then((res) => res.json())
//       .then((data) => setUsers(Array.isArray(data) ? data : []))
//       .catch(() => setUsers([]));

//   const fetchLoans = () =>
//     fetch("http://127.0.0.1:5000/api/loans/all", { headers: AUTH_HEADER })
//       .then((res) => res.json())
//       .then((data) => setLoans(Array.isArray(data) ? data : []))
//       .catch(() => setLoans([]));

//   const handleCreateUser = async (e) => {
//     e.preventDefault();
//     const { username, email, password, fullName } = form;
//     if (!username || !email || !password || !fullName) {
//       alert("Please fill all fields.");
//       return;
//     }

//     try {
//       const res = await fetch("http://127.0.0.1:5000/api/admin/users", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", ...AUTH_HEADER },
//         body: JSON.stringify({ username, email, password, full_name: fullName })
//       });
//       const data = await res.json();

//       if (!res.ok) return alert(data.error || "User creation failed.");
//       alert("User created.");
//       setForm({ username: "", email: "", password: "", fullName: "" });
//       fetchUsers();
//     } catch {
//       alert("Server error.");
//     }
//   };

//   const deleteUser = async (id, userType) => {
//     if (userType === "librarian") return alert("You cannot delete a librarian.");
//     if (!window.confirm("Are you sure you want to delete this user?")) return;

//     try {
//       const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${id}`, {
//         method: "DELETE",
//         headers: AUTH_HEADER
//       });
//       const data = await res.json();
//       if (!res.ok) return alert(data.error || "Delete failed.");
//       alert("User deleted.");
//       fetchUsers();
//     } catch {
//       alert("Server error.");
//     }
//   };

//   const isOverdue = (dueDate) => {
//     const now = new Date();
//     return new Date(dueDate) < now;
//   };

//   if (!isLibrarian) {
//     return <Layout><p className="p-6">Unauthorized access.</p></Layout>;
//   }

//   return (
//     <Layout>
//       <div className="user-management-form space-y-10">
//         <h2 className="text-3xl font-bold">👥 User Management</h2>

//         {/* Create User Form */}
//         <form onSubmit={handleCreateUser} className="bg-white p-6 rounded shadow space-y-4">
//           <h3 className="text-xl font-semibold mb-2">➕ Create New User</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="p-2 border rounded" required />
//             <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="p-2 border rounded" required />
//             <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="p-2 border rounded" required />
//             <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="p-2 border rounded" />
//           </div>
//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//             Create User
//           </button>
//         </form>

//         {/* Users Table - Classic bordered style */}
//         <div className="bg-white px-8 py-6 rounded shadow w-full">
//           <h3 className="text-xl font-semibold mb-4">📋 All Users</h3>
//           <table className="min-w-full text-sm text-left border border-gray-300 border-collapse">
//             <thead style={{ background: "#e6f0ff" }}>
//               <tr>
//                 <th className="p-3 border-b border-gray-300">Username</th>
//                 <th className="p-3 border-b border-gray-300">Email</th>
//                 <th className="p-3 border-b border-gray-300">Role</th>
//                 <th className="p-3 border-b border-gray-300">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((u, index) => (
//                 <tr key={u._id} style={{ backgroundColor: index % 2 === 0 ? "#f0f8ff" : "#e6f0ff" }}>
//                   <td className="p-3 border-b border-gray-300">{u.username}</td>
//                   <td className="p-3 border-b border-gray-300">{u.email}</td>
//                   <td className="p-3 border-b border-gray-300">{u.user_type}</td>
//                   <td className="p-3 border-b border-gray-300">
//                     {u.user_type !== "librarian" && (
//                       <button
//                         style={{
//                           background: "red",
//                           color: "#fff",
//                           padding: "6px 12px",
//                           borderRadius: "5px",
//                           border: "none",
//                           cursor: "pointer"
//                         }}
//                         onMouseOver={(e) => (e.target.style.background = "#cc0000")}
//                         onMouseOut={(e) => (e.target.style.background = "red")}
//                         onClick={() => deleteUser(u._id, u.user_type)}
//                       >
//                         Delete
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Current Borrowers Section */}
//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="text-xl font-semibold mb-4">📚 Current Borrowers</h3>
//           {loans.length === 0 ? (
//             <p>No books are currently borrowed.</p>
//           ) : (
//             <div className="borrow-history space-y-4">
//               {loans.map((loan) => {
//                 const borrowDate = new Date(loan.borrow_date).toLocaleDateString();
//                 const dueDate = new Date(loan.due_date).toLocaleDateString();
//                 const overdue = isOverdue(loan.due_date);

//                 return (
//                   <div key={loan.book_id + loan.borrow_date} className="borrowed-book-card">
//                     <h4>{loan.title}</h4>
//                     <p><strong>ISBN:</strong> {loan.isbn}</p>
//                     <p><strong>Borrowed By:</strong> {loan.username}</p>
//                     <p><strong>Borrowed On:</strong> {borrowDate}</p>
//                     <p><strong>Due On:</strong> {dueDate}</p>
//                     <p>
//                       <span className={`inline-block px-3 py-1 mt-2 text-sm rounded-full font-medium ${
//                         overdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
//                       }`}>
//                         {overdue ? "Overdue" : "On Time"}
//                       </span>
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// }

















// src/pages/UserManagementPage.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function UserManagementPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  });

  const isLibrarian = user?.user_type === "librarian";
  const AUTH_HEADER = user?.user_id ? { "X-User-Id": user.user_id } : {};

  useEffect(() => {
    document.body.className = "UserManagement-page";
    return () => {
      document.body.className = "";
    };
  }, []);

  useEffect(() => {
    if (!isLibrarian) return;
    fetchUsers();
    fetchLoans();
  }, [isLibrarian]);

  const fetchUsers = () =>
    fetch("http://127.0.0.1:5000/api/admin/users", { headers: AUTH_HEADER })
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));

  const fetchLoans = () =>
    fetch("http://127.0.0.1:5000/api/loans/all", { headers: AUTH_HEADER })
      .then((res) => res.json())
      .then((data) => setLoans(Array.isArray(data) ? data : []))
      .catch(() => setLoans([]));

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const { username, email, password, fullName } = form;
    if (!username || !email || !password || !fullName) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADER },
        body: JSON.stringify({ username, email, password, full_name: fullName })
      });
      const data = await res.json();

      if (!res.ok) return alert(data.error || "User creation failed.");
      alert("User created.");
      setForm({ username: "", email: "", password: "", fullName: "" });
      fetchUsers();
    } catch {
      alert("Server error.");
    }
  };

  const deleteUser = async (id, userType) => {
    if (userType === "librarian") return alert("You cannot delete a librarian.");
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: AUTH_HEADER
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})); // safe JSON parse
        return alert(data.error || "Delete failed.");
      }

      alert("User deleted.");
      fetchUsers();
    } catch {
      alert("Server error.");
    }
  };


  const isOverdue = (dueDate) => {
    const now = new Date();
    return new Date(dueDate) < now;
  };

  if (!isLibrarian) {
    return <Layout><p className="p-6">Unauthorized access.</p></Layout>;
  }

  return (
    <Layout>
      <div className="user-management-form space-y-10 px-4 sm:px-10">
        <h2 className="text-3xl font-bold">👥 User Management</h2>

        {/* Create User Form */}
        <form onSubmit={handleCreateUser} className="bg-white p-6 rounded shadow space-y-4 w-full">
          <h3 className="text-xl font-semibold mb-4 borrowers-title">➕ Create New User</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="p-2 border rounded" required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="p-2 border rounded" required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="p-2 border rounded" required />
            <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="p-2 border rounded" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create User
          </button>
        </form>

        <div className="user-table-wrapper">
          <h3 className="text-xl font-semibold mb-4">📋 All Users</h3>
          <table className="user-table-custom">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.user_type}</td>
                  <td>
                    {u.user_type !== "librarian" && (
                      <button
                        style={{
                          background: "red",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "5px",
                          border: "none",
                          cursor: "pointer"
                        }}
                        onMouseOver={(e) => (e.target.style.background = "#cc0000")}
                        onMouseOut={(e) => (e.target.style.background = "red")}
                        onClick={() => deleteUser(u._id, u.user_type)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Current Borrowers Section */}
        <div className="bg-white p-4 rounded shadow w-full">
          {/* <h3 className="text-xl font-semibold mb-4 text-center">📚 Current Borrowers</h3> */}

          <h3 className="text-xl font-semibold mb-4 borrowers-title">📚 Current Borrowers</h3>

          {loans.length === 0 ? (
            <p>No books are currently borrowed.</p>
          ) : (
            <div className="borrow-history space-y-4">
              {loans.map((loan) => {
                const borrowDate = new Date(loan.borrow_date).toLocaleDateString();
                const dueDate = new Date(loan.due_date).toLocaleDateString();
                const overdue = isOverdue(loan.due_date);

                return (
                  <div key={loan.book_id + loan.borrow_date} className="borrowed-book-card">
                    <h4>{loan.title}</h4>
                    <p><strong>ISBN:</strong> {loan.isbn}</p>
                    <p><strong>Borrowed By:</strong> {loan.username}</p>
                    <p><strong>Borrowed On:</strong> {borrowDate}</p>
                    <p><strong>Due On:</strong> {dueDate}</p>
                    <p>
                      <span className={`inline-block px-3 py-1 mt-2 text-sm rounded-full font-medium ${
                        overdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>
                        {overdue ? "Overdue" : "On Time"}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
