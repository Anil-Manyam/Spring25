// import React, { useState } from "react";

// export default function LoginForm({ onLogin }) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch(`/api/users/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password })
//       });
//       const data = await res.json();
//       if (data.error) {
//         alert(data.error);
//       } else {
//         onLogin(data);
//       }
//     } catch (err) {
//       alert("Server error");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h3>Register or Login</h3>
//       <input
//         placeholder="username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         required
//       />
//       <input
//         placeholder="password"
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />
//       <button type="submit">Submit</button>
//     </form>
//   );
// }
