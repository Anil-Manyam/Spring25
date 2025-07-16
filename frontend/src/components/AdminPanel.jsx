
// import React, { useEffect, useState } from "react";

// export default function AdminPanel({ onBookAdded }) {
//   const [loans, setLoans] = useState([]);
//   const [books, setBooks] = useState([]);

//   // book fields
//   const [title, setTitle] = useState("");
//   const [author, setAuthor] = useState("");
//   const [isbn, setIsbn] = useState("");
//   const [description, setDescription] = useState("");
//   const [file, setFile] = useState(null);

//   const [editBookId, setEditBookId] = useState(null);

//   /* fetch loans + books on mount */
//   useEffect(() => {
//     fetch("http://127.0.0.1:5000/api/loans/all")
//       .then(res => res.json())
//       .then(setLoans);

//     refreshBooks();
//   }, []);

//   const refreshBooks = () => {
//     fetch("http://127.0.0.1:5000/api/books")
//       .then(res => res.json())
//       .then(setBooks);
//   };

//   /* ------------------- ADD ------------------- */
//   const handleAdd = async () => {
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("author", author);
//     formData.append("isbn", isbn);
//     formData.append("description", description);
//     if (file) formData.append("file", file);

//     try {
//       const res = await fetch("http://127.0.0.1:5000/api/books", {
//         method: "POST",
//         body: formData
//       });
//       const data = await res.json();
//       if (data.error) {
//         alert(data.error);
//       } else {
//         alert("Book added!");
//         resetForm();
//         onBookAdded();
//         refreshBooks();
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   /* ------------------- DELETE ------------------- */
//   const handleDelete = async (bookId) => {
//     try {
//       const res = await fetch(`http://127.0.0.1:5000/api/books/${bookId}`, {
//         method: "DELETE"
//       });
//       const data = await res.json();
//       if (data.error) alert(data.error);
//       else {
//         alert("Book deleted!");
//         refreshBooks();
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   /* ------------------- EDIT (load fields) ------------------- */
//   const handleEdit = (book) => {
//     setEditBookId(book.book_id);
//     setTitle(book.title);
//     setAuthor(book.author);
//     setIsbn(book.isbn);
//     setDescription(book.description || "");
//     setFile(null); // user may choose new image later
//   };

//   /* ------------------- UPDATE ------------------- */
//   const handleUpdate = async () => {
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("author", author);
//     formData.append("isbn", isbn);
//     formData.append("description", description);
//     if (file) formData.append("file", file);

//     try {
//       const res = await fetch(
//         `http://127.0.0.1:5000/api/books/${editBookId}`,
//         { method: "PATCH", body: formData }
//       );
//       const data = await res.json();
//       if (data.error) {
//         alert(data.error);
//       } else {
//         alert("Book updated!");
//         resetForm();
//         refreshBooks();
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   /* reset helper */
//   const resetForm = () => {
//     setEditBookId(null);
//     setTitle("");
//     setAuthor("");
//     setIsbn("");
//     setDescription("");
//     setFile(null);
//   };

//   return (
//     <div style={{ marginTop: "20px" }}>
//       {/* ---------- Borrowers list ---------- */}
//       <h3>Current Borrowers</h3>
//       {loans.length === 0 ? (
//         <p>No books are currently borrowed.</p>
//       ) : (
//         loans.map(loan => (
//           <div key={loan.book_id + loan.borrow_date}>
//             {loan.title} (ISBN: {loan.isbn}), User: {loan.username}, Borrowed on:{" "}
//             {new Date(loan.borrow_date).toLocaleDateString()}, Due:{" "}
//             {new Date(loan.due_date).toLocaleDateString()}
//           </div>
//         ))
//       )}

//       {/* ---------- Add / Edit form ---------- */}
//       <h3 style={{ marginTop: "30px" }}>
//         {editBookId ? "Edit Book" : "Add a New Book"}
//       </h3>
//       <input
//         placeholder="Title"
//         value={title}
//         onChange={e => setTitle(e.target.value)}
//       />
//       <input
//         placeholder="Author"
//         value={author}
//         onChange={e => setAuthor(e.target.value)}
//       />
//       <input
//         placeholder="ISBN"
//         value={isbn}
//         onChange={e => setIsbn(e.target.value)}
//       />
//       <textarea
//         placeholder="Description"
//         value={description}
//         onChange={e => setDescription(e.target.value)}
//         rows={3}
//         style={{ width: "100%", margin: "5px 0" }}
//       />
//       <input
//         type="file"
//         onChange={e => setFile(e.target.files[0] || null)}
//       />

//       {editBookId ? (
//         <button onClick={handleUpdate}>Update Book</button>
//       ) : (
//         <button onClick={handleAdd}>Add Book</button>
//       )}

//       {/* ---------- Manage existing books ---------- */}
//       <h3 style={{ marginTop: "30px" }}>All Books (Manage)</h3>
//       {books.length === 0 ? (
//         <p>No books in catalog.</p>
//       ) : (
//         books.map(b => (
//           <div key={b.book_id} className="book-card">
//             <div>
//               <strong>{b.title}</strong> by {b.author} <br />
//               ISBN: {b.isbn} <br />
//               Status: {b.available ? "Available" : "Borrowed"}
//             </div>
//             <div>
//               <button
//                 style={{
//                   marginLeft: "10px",
//                   backgroundColor: "orange",
//                   color: "white",
//                   fontWeight: "bold"
//                 }}
//                 onClick={() => handleEdit(b)}
//               >
//                 Edit
//               </button>
//               <button
//                 style={{
//                   marginLeft: "10px",
//                   backgroundColor: "red",
//                   color: "white",
//                   fontWeight: "bold"
//                 }}
//                 onClick={() => handleDelete(b.book_id)}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }


// src/components/AdminPanel.jsx
import React, { useEffect, useState } from "react";

export default function AdminPanel({ onBookAdded }) {
  const [books, setBooks] = useState([]);

  /* book form fields */
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [editBookId, setEditBookId] = useState(null);

  /* -------- fetch books on mount -------- */
  useEffect(() => {
    refreshBooks();
  }, []);

  const refreshBooks = () =>
    fetch("http://127.0.0.1:5000/api/books")
      .then(res => res.json())
      .then(setBooks);

  /* -------- add book -------- */
  const handleAdd = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("isbn", isbn);
    formData.append("description", description);
    if (file) formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/books", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        alert("Book added!");
        resetForm();
        onBookAdded();
        refreshBooks();
      }
    } catch {
      alert("Server error");
    }
  };

  /* -------- delete book -------- */
  const handleDelete = async bookId => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/books/${bookId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        alert("Book deleted!");
        refreshBooks();
      }
    } catch {
      alert("Server error");
    }
  };

  /* -------- edit / update book -------- */
  const handleEdit = book => {
    setEditBookId(book.book_id);
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn);
    setDescription(book.description || "");
    setFile(null);
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("isbn", isbn);
    formData.append("description", description);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/books/${editBookId}`,
        { method: "PATCH", body: formData }
      );
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        alert("Book updated!");
        resetForm();
        refreshBooks();
      }
    } catch {
      alert("Server error");
    }
  };

  /* -------- helpers -------- */
  const resetForm = () => {
    setEditBookId(null);
    setTitle("");
    setAuthor("");
    setIsbn("");
    setDescription("");
    setFile(null);
  };

  /* -------- UI -------- */
  return (
    <div style={{ marginTop: "20px" }}>
      {/* ---------- add / edit form ---------- */}
      <h3>{editBookId ? "Edit Book" : "Add a New Book"}</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        placeholder="Author"
        value={author}
        onChange={e => setAuthor(e.target.value)}
      />
      <input
        placeholder="ISBN"
        value={isbn}
        onChange={e => setIsbn(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={3}
        style={{ width: "100%", margin: "5px 0" }}
      />
      <input
        type="file"
        onChange={e => setFile(e.target.files[0] || null)}
      />

      {editBookId ? (
        <button onClick={handleUpdate}>Update Book</button>
      ) : (
        <button onClick={handleAdd}>Add Book</button>
      )}

      {/* ---------- manage existing books ---------- */}
      <h3 style={{ marginTop: "30px" }}>All Books (Manage)</h3>
      {books.length === 0 ? (
        <p>No books in catalog.</p>
      ) : (
        books.map(b => (
          <div key={b.book_id} className="book-card">
            <div>
              <strong>{b.title}</strong> by {b.author} <br />
              ISBN: {b.isbn} <br />
              Status: {b.available ? "Available" : "Borrowed"}
            </div>
            <div>
              <button
                style={{
                  marginLeft: "10px",
                  backgroundColor: "orange",
                  color: "white",
                  fontWeight: "bold"
                }}
                onClick={() => handleEdit(b)}
              >
                Edit
              </button>
              <button
                style={{
                  marginLeft: "10px",
                  backgroundColor: "red",
                  color: "white",
                  fontWeight: "bold"
                }}
                onClick={() => handleDelete(b.book_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
