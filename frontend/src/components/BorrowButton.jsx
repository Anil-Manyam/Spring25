import React from "react";

export default function BorrowButton({ user, bookId, onBorrow }) {
  const handleBorrow = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/loans/borrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, book_id: bookId })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);

        // update local user object
        const updatedUser = { ...user };
        updatedUser.borrowed_books.push(bookId);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        onBorrow();
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <button onClick={handleBorrow}>Borrow</button>
  );
}
