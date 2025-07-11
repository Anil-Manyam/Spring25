// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// export default function RegisterPage() {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch("http://127.0.0.1:5000/api/users/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password, confirm_password: confirmPassword, email })
//       });
//       const data = await res.json();
//       if (data.error) {
//         alert(data.error);
//       } else {
//         alert("Registration successful!");
//         navigate("/");
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   return (
//     <div className="container">
//       <h2>Register</h2>
//       <form onSubmit={handleRegister}>
//         <input
//           placeholder="Username"
//           required
//           value={username}
//           onChange={e => setUsername(e.target.value)}
//         />
//         <input
//           placeholder="Email"
//           required
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//         />
//         <input
//           placeholder="Password"
//           type="password"
//           required
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//         />
//         <input
//           placeholder="Confirm Password"
//           type="password"
//           required
//           value={confirmPassword}
//           onChange={e => setConfirmPassword(e.target.value)}
//         />
//         <button type="submit">Register</button>
//       </form>
//       <p>Already have an account? <Link to="/">Login Here</Link></p>
//     </div>
//   );
// }




import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = "register-page";
    return () => { document.body.className = ""; }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirm_password: confirmPassword, email })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert("Registration successful!");
        navigate("/login");
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}

