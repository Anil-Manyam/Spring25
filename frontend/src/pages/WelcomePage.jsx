import React from "react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="welcome-container">
      <h1>📚 MyLibrary LMS</h1>
      <p>Manage your books, loans, and members with confidence.</p>
      <div className="welcome-buttons">
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
}
