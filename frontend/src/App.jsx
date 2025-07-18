import React from "react"; 
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import WelcomePage from "./pages/WelcomePage";
import FinesPage from "./pages/FinesPage";
import FeedbackPage from "./pages/FeedbackPage";
import UserManagementPage from "./pages/UserManagementPage";
import BookManagementPage from "./pages/BookManagementPage";
import BookListPage from "./pages/BookListPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/books" element={<BookListPage />} />
        <Route path="/fines" element={<FinesPage />} />
        {/* <Route path="/feedback" element={<FeedbackPage />} /> */}
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/books" element={<BookManagementPage />} />
      </Routes>
    </BrowserRouter>
  );
}
