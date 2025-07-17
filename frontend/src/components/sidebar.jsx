
// // src/components/Sidebar.jsx
// import { Link, useLocation } from "react-router-dom";
// import {
//   Home,
//   Book,
//   User,
//   DollarSign,
//   MessageSquare,
//   Users,
//   Menu,
// } from "lucide-react";
// import { useState } from "react";

// export default function Sidebar({ userType }) {
//   const { pathname } = useLocation();
//   const [collapsed, setCollapsed] = useState(false);

//   const navItem = (to, label, Icon) => (
//     <Link
//       to={to}
//       className={`nav-item ${pathname === to ? "active" : ""} ${
//         collapsed ? "collapsed" : ""
//       }`}
//       title={collapsed ? label : ""}
//     >
//       <Icon size={20} />
//       {!collapsed && <span>{label}</span>}
//     </Link>
//   );

//   return (
//     <div className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
//       <button
//         onClick={() => setCollapsed((prev) => !prev)}
//         className="collapse-toggle"
//         title="Toggle sidebar"
//       >
//         <Menu size={22} />
//       </button>

//       {!collapsed && <h2>📚 LMS Panel</h2>}
//       {navItem("/profile", "Profile", Home)}
//       {navItem("/books", "Browse Books", Book)}
//       {navItem("/fines", "Fines", DollarSign)}


//       {userType === "librarian" && (
//         <>
//           {navItem("/admin/users", "User Management", Users)}
//           {navItem("/admin/books", "Book Management", Book)}
//         </>
//       )}
//     </div>
//   );
// }




// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Book,
  User,
  DollarSign,
  Users,
  Menu,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({ userType }) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItem = (to, label, Icon, extraClass = "") => (
    <Link
      to={to}
      className={`nav-item ${pathname === to ? "active" : ""} ${
        collapsed ? "collapsed" : ""
      } ${extraClass}`}
      title={collapsed ? label : ""}
    >
      <Icon size={20} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  const logoutItem = () => (
    <div
      onClick={() => {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }}
      className={`nav-item logout-link ${collapsed ? "collapsed" : ""}`}
      title={collapsed ? "Logout" : ""}
      style={{ cursor: "pointer" }}
    >
      <User size={20} />
      {!collapsed && <span>Logout</span>}
    </div>
  );

  return (
    <div className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="collapse-toggle"
        title="Toggle sidebar"
      >
        <Menu size={22} />
      </button>

      {!collapsed && <h2>📚 LMS Panel</h2>}
      {navItem("/profile", "Profile", Home)}
      {navItem("/books", "Browse Books", Book)}
      {navItem("/fines", "Fines", DollarSign)}

      {userType === "librarian" && (
        <>
          {navItem("/admin/users", "User Management", Users)}
          {navItem("/admin/books", "Book Management", Book)}
        </>
      )}

      {/* 🔴 Logout at bottom */}
      {logoutItem()}
    </div>
  );
}
