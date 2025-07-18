
// import React, { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";

// export default function LoginPage() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     document.body.className = "login-page";
//     return () => { document.body.className = ""; }
//   }, []);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch("http://127.0.0.1:5000/api/users/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password })
//       });
//       const data = await res.json();
//       if (data.error) {
//         alert(data.error);
//       } else {
//         localStorage.setItem("user", JSON.stringify(data));
//         navigate("/home");
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Login</h2>
//       <form onSubmit={handleLogin}>
//         <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
//         <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
//         <button type="submit">Login</button>
//       </form>
//       <p>Don’t have an account? <Link to="/register">Register here</Link></p>
//     </div>
//   );
// }

// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate  = useNavigate();

  /* set a distinct background for the login screen */
  useEffect(() => {
    document.body.className = "login-page";
    return () => { document.body.className = ""; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      // 🔑 Persist the authenticated user so App.jsx sees it
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      <p>
        Don’t have an account?{" "}
        <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
