
// BookList.jsx
import React, { useEffect, useState } from "react";
import BorrowButton from "./BorrowButton";

/* ---------- Modal to display book details + reviews ---------- */
function BookModal({ book, reviews, onClose }) {
  if (!book) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{book.title}</h2>

        {/* book image (optional) */}
        {book.imageUrl && (
          <img
          src={book.imageUrl.startsWith("http") ? book.imageUrl : `http://127.0.0.1:5000${book.imageUrl}`}
          alt={book.title}
          className="book-image"
          />
        )}

        {/* description (optional) */}
        {book.description && (
          <p className="description">{book.description}</p>
        )}

        <hr />
        <h3>Reviews</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} className="review-box">
              <b>{r.username}</b>: {r.feedback}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------- Main BookList component ------------------- */
export default function BookList({ user, reload }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /* modal state */
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/books")
      .then(res => res.json())
      .then(data => setBooks(data));
  }, [reload]);

  const currentUserBorrowed = user.borrowed_books || [];

  /* ------------ existing RETURN logic (unchanged) ------------- */
  const handleReturn = async (bookId) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/loans/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, book_id: bookId })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        let msg = `Book returned.`;
        if (data.fine > 0) msg += ` Fine due: $${data.fine}`;
        alert(msg);

        /* optional feedback */
        const fb = window.prompt("Leave feedback (optional)");
        if (fb && fb.trim() !== "") {
          await fetch(`http://127.0.0.1:5000/api/books/${bookId}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.user_id,
              username: user.username,
              feedback: fb
            })
          }).catch(() => alert("Could not save feedback."));
        }
        window.location.reload();
      }
    } catch {
      alert("Server error");
    }
  };

  /* ------------- new details+reviews modal logic -------------- */
  const openDetails = async (book) => {
    setSelectedBook(book);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/books/${book.book_id}/feedback`
      );
      const data = await res.json();
      setReviews(data.error ? [] : data);
    } catch {
      setReviews([]);
    }
  };

  const closeDetails = () => {
    setSelectedBook(null);
    setReviews([]);
  };

  /* ---------------- filtering (unchanged) --------------------- */
  const filteredBooks = books.filter(b => {
    const searchMatch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    let filterMatch = true;
    if (filter === "available") filterMatch = b.available;
    if (filter === "borrowed") filterMatch = !b.available;
    return searchMatch && filterMatch;
  });

  return (
    <>
      {/* Modal */}
      {selectedBook && (
        <BookModal book={selectedBook} reviews={reviews} onClose={closeDetails} />
      )}

      <h3>Book Catalog</h3>
      <input
        placeholder="Search by title or author"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: "10px" }}
      />
      <select
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ marginBottom: "20px" }}
      >
        <option value="all">All</option>
        <option value="available">Available</option>
        <option value="borrowed">Borrowed</option>
      </select>

      {filteredBooks.length === 0 ? (
        <p>No books found.</p>
      ) : (
        filteredBooks.map(b => (
          <div className="book-card" key={b.book_id}>
            <div>
              <strong>{b.title}</strong> by {b.author}<br />
              ISBN: {b.isbn}<br />
              Status: {b.available ? "Available" : "Borrowed"}
            </div>
            <div>
              {b.available ? (
                <BorrowButton
                  user={user}
                  bookId={b.book_id}
                  onBorrow={() => window.location.reload()}
                />
              ) : (
                currentUserBorrowed.includes(b.book_id) && (
                  <button onClick={() => handleReturn(b.book_id)}>Return</button>
                )
              )}
              <button
                style={{ marginLeft: "5px" }}
                onClick={() => openDetails(b)}
              >
                Details & Reviews
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}
