// import React, { useEffect, useState } from "react";
// import Layout from "../components/Layout";
// import BorrowButton from "../components/BorrowButton";

// /* ---------- Modal for book details and reviews ---------- */
// function BookModal({ book, reviews, onClose }) {
//   if (!book) return null;

//   return (
//     <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
//       <div className="modal-content bg-white p-6 rounded-lg w-full max-w-xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
//         <button
//           className="close-btn absolute top-2 right-3 text-gray-600 hover:text-red-600 text-2xl"
//           onClick={onClose}
//         >
//           ×
//         </button>
//         <h2 className="text-2xl font-bold mb-4">{book.title}</h2>

//         {book.imageUrl && (
//           <img
//             src={
//               book.imageUrl.startsWith("http")
//                 ? book.imageUrl
//                 : `http://127.0.0.1:5000${book.imageUrl}`
//             }
//             alt={book.title}
//             className="book-image w-full h-60 object-cover rounded mb-4"
//           />
//         )}

//         {book.description && (
//           <p className="mb-4 text-gray-700 leading-relaxed">
//             {book.description}
//           </p>
//         )}

//         <hr className="my-4" />
//         <h3 className="text-xl font-semibold mb-2">Reviews</h3>
//         {reviews.length === 0 ? (
//           <p className="text-gray-500 italic">No reviews yet.</p>
//         ) : (
//           reviews.map((r, idx) => (
//             <div key={idx} className="review-box bg-gray-100 p-2 rounded mb-2">
//               <b>{r.username}</b>: {r.feedback}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// export default function BookListPage() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const [books, setBooks] = useState([]);
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [selectedBook, setSelectedBook] = useState(null);
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     fetch("http://127.0.0.1:5000/api/books")
//       .then((res) => res.json())
//       .then((data) => setBooks(data));
//   }, []);

//   const currentUserBorrowed = user?.borrowed_books || [];

//   const handleReturn = async (bookId) => {
//     try {
//       const res = await fetch("http://127.0.0.1:5000/api/loans/return", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ user_id: user.user_id, book_id: bookId }),
//       });
//       const data = await res.json();
//       if (data.error) {
//         alert(data.error);
//       } else {
//         let msg = `Book returned.`;
//         if (data.fine > 0) msg += ` Fine due: $${data.fine}`;
//         alert(msg);

//         const fb = window.prompt("Leave feedback (optional)");
//         if (fb && fb.trim() !== "") {
//           await fetch(`http://127.0.0.1:5000/api/books/${bookId}/feedback`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               user_id: user.user_id,
//               username: user.username,
//               feedback: fb,
//             }),
//           }).catch(() => alert("Could not save feedback."));
//         }
//         window.location.reload();
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   const openDetails = async (book) => {
//     setSelectedBook(book);
//     try {
//       const res = await fetch(
//         `http://127.0.0.1:5000/api/books/${book.book_id}/feedback`
//       );
//       const data = await res.json();
//       setReviews(data.error ? [] : data);
//     } catch {
//       setReviews([]);
//     }
//   };

//   const closeDetails = () => {
//     setSelectedBook(null);
//     setReviews([]);
//   };

//   const filteredBooks = books.filter((b) => {
//     const searchMatch =
//       b.title.toLowerCase().includes(search.toLowerCase()) ||
//       b.author.toLowerCase().includes(search.toLowerCase());
//     let filterMatch = true;
//     if (filter === "available") filterMatch = b.available;
//     if (filter === "borrowed") filterMatch = !b.available;
//     return searchMatch && filterMatch;
//   });

//   return (
//     <Layout>
//       {selectedBook && (
//         <BookModal book={selectedBook} reviews={reviews} onClose={closeDetails} />
//       )}

//       <div className="profile-form">
//         <h2 className="text-3xl font-bold text-blue-900 mb-4">📚 Book Catalog</h2>

//         <div className="flex gap-4 flex-wrap my-6">
//           <input
//             type="text"
//             placeholder="Search by title or author"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="p-2 border rounded w-full max-w-xs"
//           />
//           <select
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//             className="p-2 border rounded"
//           >
//             <option value="all">All</option>
//             <option value="available">Available</option>
//             <option value="borrowed">Borrowed</option>
//           </select>
//         </div>

//         {filteredBooks.length === 0 ? (
//           <p className="text-gray-600 mt-4">No books found.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {filteredBooks.map((b) => (
//               <div key={b.book_id} className="borrowed-book-card bg-white p-4 rounded shadow-md">
//                 <h4 className="text-lg font-semibold">{b.title}</h4>
//                 <p><strong>Author:</strong> {b.author}</p>
//                 <p><strong>ISBN:</strong> {b.isbn}</p>
//                 <p>
//                   <strong>Status:</strong>{" "}
//                   <span className={b.available ? "text-green-600" : "text-red-600"}>
//                     {b.available ? "Available" : "Borrowed"}
//                   </span>
//                 </p>

//                 <div className="mt-2 flex flex-wrap gap-2">
//                   {b.available ? (
//                     <BorrowButton
//                       user={user}
//                       bookId={b.book_id}
//                       onBorrow={() => window.location.reload()}
//                     />
//                   ) : (
//                     currentUserBorrowed.includes(b.book_id) && (
//                       <button
//                         onClick={() => handleReturn(b.book_id)}
//                         className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
//                       >
//                         Return
//                       </button>
//                     )
//                   )}
//                   <button
//                     onClick={() => openDetails(b)}
//                     className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                   >
//                     Details & Reviews
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }

import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import BorrowButton from "../components/BorrowButton";

/* ---------- Modal for book details and reviews ---------- */
function BookModal({ book, reviews, onClose }) {
  if (!book) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="modal-content bg-white p-6 rounded-lg w-full max-w-xl relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          className="close-btn absolute top-2 right-3 text-gray-600 hover:text-red-600 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">{book.title}</h2>

        {book.imageUrl && (
          <img
            src={
              book.imageUrl.startsWith("http")
                ? book.imageUrl
                : `http://127.0.0.1:5000${book.imageUrl}`
            }
            alt={book.title}
            className="book-image w-full h-60 object-cover rounded mb-4"
          />
        )}

        {book.description && (
          <p className="mb-4 text-gray-700 leading-relaxed">
            {book.description}
          </p>
        )}

        <hr className="my-4" />
        <h3 className="text-xl font-semibold mb-2">Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500 italic">No reviews yet.</p>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} className="review-box bg-gray-100 p-2 rounded mb-2">
              <b>{r.username}</b>: {r.feedback}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function BookListPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
        document.body.className = "BookList-page";
        return () => {
          document.body.className = "";
        };
      }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/books")
      .then((res) => res.json())
      .then((data) => setBooks(data));
  }, []);

  const currentUserBorrowed = user?.borrowed_books || [];

  const handleReturn = async (bookId) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/loans/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, book_id: bookId }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        let msg = `Book returned.`;
        if (data.fine > 0) msg += ` Fine due: $${data.fine}`;
        alert(msg);

        const fb = window.prompt("Leave feedback (optional)");
        if (fb && fb.trim() !== "") {
          await fetch(`http://127.0.0.1:5000/api/books/${bookId}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.user_id,
              username: user.username,
              feedback: fb,
            }),
          }).catch(() => alert("Could not save feedback."));
        }
        window.location.reload();
      }
    } catch {
      alert("Server error");
    }
  };

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

  const filteredBooks = books.filter((b) => {
    const searchMatch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    let filterMatch = true;
    if (filter === "available") filterMatch = b.available;
    if (filter === "borrowed") filterMatch = !b.available;
    return searchMatch && filterMatch;
  });

  return (
    <Layout>
      {selectedBook && (
        <BookModal book={selectedBook} reviews={reviews} onClose={closeDetails} />
      )}

      <div className="profile-form">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">📚 Book Catalog</h2>

        <div className="flex gap-4 flex-wrap my-6">
          <input
            type="text"
            placeholder="Search by title or author"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded w-full max-w-xs"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
          </select>
        </div>

        {filteredBooks.length === 0 ? (
          <p className="text-gray-600 mt-4">No books found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((b) => (
              <div
                key={b.book_id}
                className="borrowed-book-card bg-white p-4 rounded shadow-md flex justify-between items-start"
              >
                {/* Book Details */}
                <div className="w-3/4">
                  <h4 className="text-lg font-semibold text-blue-800">{b.title}</h4>
                  <p><strong>Author:</strong> {b.author}</p>
                  <p><strong>ISBN:</strong> {b.isbn}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={b.available ? "text-green-600" : "text-red-600"}>
                      {b.available ? "Available" : "Borrowed"}
                    </span>
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col items-end gap-2 w-1/4">
                  {b.available ? (
                    <BorrowButton
                      user={user}
                      bookId={b.book_id}
                      onBorrow={() => window.location.reload()}
                    />
                  ) : (
                    currentUserBorrowed.includes(b.book_id) && (
                      <button
                        onClick={() => handleReturn(b.book_id)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Return
                      </button>
                    )
                  )}
                  <button
                    onClick={() => openDetails(b)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Details & Reviews
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
