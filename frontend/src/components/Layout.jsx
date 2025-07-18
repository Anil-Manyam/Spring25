// src/components/Layout.jsx
import Sidebar from "./sidebar";

export default function Layout({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex">
      <Sidebar userType={user?.user_type} />
      <div className="ml-60 p-6 w-full min-h-screen bg-gray-100">
        {children}
      </div>
    </div>
  );
}
