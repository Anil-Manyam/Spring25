


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "../components/Layout";
// import UserManagement from "../components/UserManagement";

// export default function ProfilePage() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const [history, setHistory] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     document.body.className = "profile-page";
//     return () => {
//       document.body.className = "";
//     };
//   }, []);

//   useEffect(() => {
//     fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/history`)
//       .then((res) => res.json())
//       .then((data) => Array.isArray(data) ? setHistory(data) : setHistory([]));
//   }, [user.user_id]);

//   return (
//     <Layout>
//       <div className="profile-form">
//         <h2>👤 {user.username}'s Profile</h2>
//         <label>Email:</label>
//         <p>{user.email}</p>

//         <h3>📘 Borrow History</h3>

//         {(!Array.isArray(history) || history.length === 0) ? (
//           <p>You haven’t borrowed any books yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {history.map((h) => {
//               const borrowDate = new Date(h.borrow_date).toLocaleDateString();
//               const returned = h.return_date ? new Date(h.return_date).toLocaleDateString() : null;

//               return (
//                 <div key={h.history_id} className="borrowed-book-card">
//                   <h4>{h.title}</h4>
//                   <p><strong>ISBN:</strong> {h.isbn}</p>
//                   <p><strong>Borrowed On:</strong> {borrowDate}</p>
//                   {returned ? (
//                     <p>
//                       <strong>Returned On:</strong>{" "}
//                       <span className="text-green-600 font-semibold">{returned}</span>
//                     </p>
//                   ) : (
//                     <p>
//                       <strong>Status:</strong>{" "}
//                       <span className="text-red-600 font-semibold">Not Returned</span>
//                     </p>
//                   )}
//                   <p>
//                     <span className={`inline-block px-3 py-1 mt-2 text-sm rounded-full font-medium ${
//                       returned ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                     }`}>
//                       {returned ? "Returned" : "Overdue"}
//                     </span>
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Librarian controls */}
//         {user.user_type === "librarian" && (
//           <div className="mt-10">
//             <h3 className="text-2xl font-semibold mb-2">👥 Admin Panel</h3>
//             <UserManagement />
//           </div>
//         )}

//         {/* Logout Button Only */}
//         <div className="flex gap-3 mt-8">
//           <button
//             className="logout-button"
//             onClick={() => {
//               localStorage.removeItem("user");
//               navigate("/login");
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </Layout>
//   );
// }



// // src/pages/ProfilePage.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Layout from "../components/Layout";

// export default function ProfilePage() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const [history, setHistory] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     document.body.className = "profile-page";
//     return () => {
//       document.body.className = "";
//     };
//   }, []);

//   useEffect(() => {
//     fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/history`)
//       .then((res) => res.json())
//       .then((data) => Array.isArray(data) ? setHistory(data) : setHistory([]));
//   }, [user.user_id]);

//   return (
//     <Layout>
//       <div className="profile-form">
//         <h2>👤 {user.username}'s Profile</h2>
//         <label>Email:</label>
//         <p>{user.email}</p>

//         <h3>📘 Borrow History</h3>

//         {(!Array.isArray(history) || history.length === 0) ? (
//           <p>You haven’t borrowed any books yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {history.map((h) => {
//               const borrowDate = new Date(h.borrow_date).toLocaleDateString();
//               const returned = h.return_date ? new Date(h.return_date).toLocaleDateString() : null;

//               return (
//                 <div key={h.history_id} className="borrowed-book-card">
//                   <h4>{h.title}</h4>
//                   <p><strong>ISBN:</strong> {h.isbn}</p>
//                   <p><strong>Borrowed On:</strong> {borrowDate}</p>
//                   {returned ? (
//                     <p>
//                       <strong>Returned On:</strong>{" "}
//                       <span className="text-green-600 font-semibold">{returned}</span>
//                     </p>
//                   ) : (
//                     <p>
//                       <strong>Status:</strong>{" "}
//                       <span className="text-red-600 font-semibold">Not Returned</span>
//                     </p>
//                   )}
//                   <p>
//                     <span className={`inline-block px-3 py-1 mt-2 text-sm rounded-full font-medium ${
//                       returned ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                     }`}>
//                       {returned ? "Returned" : "Overdue"}
//                     </span>
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Logout Button Only */}
//         <div className="flex gap-3 mt-8">
//           <button
//             className="logout-button"
//             onClick={() => {
//               localStorage.removeItem("user");
//               navigate("/login");
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>
//     </Layout>
//   );
// }
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [history, setHistory] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = "profile-page";
    return () => {
      document.body.className = "";
    };
  }, []);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/history`)
      .then((res) => res.json())
      .then((data) => Array.isArray(data) ? setHistory(data) : setHistory([]));
  }, [user.user_id]);

  useEffect(() => {
    if (user.user_type === "librarian") {
      fetch("http://127.0.0.1:5000/api/loans/all")
        .then(res => res.json())
        .then(data => {
          const activeLoans = Array.isArray(data)
            ? data.filter(loan => !loan.return_date)
            : [];
          setBorrowers(activeLoans);
        });
    }
  }, [user.user_type]);

  const isOverdue = (dueDateStr) => {
    const today = new Date();
    const dueDate = new Date(dueDateStr);
    return today > dueDate;
  };

  return (
    <Layout>
      <div className="profile-form">
        <h2>👤 {user.username}'s Profile</h2>
        <label>Email:</label>
        <p>{user.email}</p>

        <h3 className="text-xl font-semibold mb-4 borrowers-title">📘 Borrow History</h3>

        {(!Array.isArray(history) || history.length === 0) ? (
          <p>You haven’t borrowed any books yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {history.map((h) => {
              const borrowDate = new Date(h.borrow_date).toLocaleDateString();
              const returned = h.return_date ? new Date(h.return_date).toLocaleDateString() : null;

              return (
                <div key={h.history_id} className="borrowed-book-card">
                  <h4>{h.title}</h4>
                  <p><strong>ISBN:</strong> {h.isbn}</p>
                  <p><strong>Borrowed On:</strong> {borrowDate}</p>
                  {returned ? (
                    <p>
                      <strong>Returned On:</strong>{" "}
                      <span className="text-green-600 font-semibold">{returned}</span>
                    </p>
                  ) : (
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="text-red-600 font-semibold">Not Returned</span>
                    </p>
                  )}
                  <p>
                    <span className={`inline-block px-3 py-1 mt-2 text-sm rounded-full font-medium ${
                      returned ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {returned ? "Returned" : "Overdue"}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Styled Current Borrowers Section for Librarians */}
        {user.user_type === "librarian" && borrowers.length > 0 && (
          <div className="mt-10 bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 borrowers-title">📚 Current Borrowers</h3>
            <div className="borrow-history space-y-4">
              {borrowers.map((loan, i) => {
                const borrowDate = new Date(loan.borrow_date).toLocaleDateString();
                const dueDate = new Date(loan.due_date).toLocaleDateString();
                const overdue = isOverdue(loan.due_date);

                return (
                  <div key={loan.book_id + loan.borrow_date} className="borrowed-book-card">
                    <h4 className="text-blue-700 font-semibold">{loan.title}</h4>
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
          </div>
        )}

        {/* Logout Button */}
        <div className="flex gap-3 mt-8">
          <button
            style={{
              background: "red",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer"
            }}
            onMouseOver={(e) => (e.target.style.background = "#cc0000")}
            onMouseOut={(e) => (e.target.style.background = "red")}
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
        </button>

        </div>
      </div>
    </Layout>
  );
}
