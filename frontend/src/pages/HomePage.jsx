// import React, { useState } from "react";
// import BookList from "../components/BookList";
// import AdminPanel from "../components/AdminPanel";
// import FineIndicator from "../components/FineIndicator";
// import { useNavigate } from "react-router-dom";

// export default function HomePage() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const navigate = useNavigate();
//   const [reload, setReload] = useState(0);

//   if (!user) {
//     navigate("/");
//     return null;
//   }

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     navigate("/");
//   };

//   const triggerReload = () => setReload(reload + 1);

//   return (
//     <div className="container">
//       <FineIndicator user={user} />
//       <button onClick={() => navigate("/profile")}>My Profile</button>
//       <h2>Welcome, {user.username}</h2>
//       {user.user_type === "librarian" && <AdminPanel onBookAdded={triggerReload} />}
//       <BookList user={user} reload={reload} />
//       <button onClick={handleLogout}>Logout</button>
//     </div>
//   );
// }

import BookList from "../components/BookList";
import AdminPanel from "../components/AdminPanel";
import FineIndicator from "../components/FineIndicator";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    document.body.className = "home-page";
    return () => {
      document.body.className = "";
    };
  }, []);

  // fetch user fresh from backend
  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("user"));
    if (!local) {
      navigate("/login");
      return;
    }
    fetch(`http://127.0.0.1:5000/api/users/${local.user_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          navigate("/login");
        } else {
          setUser(data);
        }
      });
  }, [reload]);

  if (!user) {
    return <p>Loading...</p>;
  }

  const triggerReload = () => setReload(reload + 1);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <FineIndicator user={user} />
      <div className="container" style={{ position: "relative" }}>
        {/* profile circle inside the container */}
        <button
          className="profile-button"
          style={{ position: "absolute", top: 20, right: 20 }}
          onClick={() => navigate("/profile")}
          title="My Profile"
        >
          {user.username[0].toUpperCase()}
        </button>

        <h1>Welcome, {user.username}</h1>

        {user.user_type === "librarian" && (
          <AdminPanel onBookAdded={triggerReload} />
        )}

        <BookList user={user} reload={reload} />

        {/* <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          Logout
        </button> */}
      </div>
    </div>
  );
}
