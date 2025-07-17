import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function BookManagementPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    file: null
  });
  const [editingBookId, setEditingBookId] = useState(null);

  const isLibrarian = user?.user_type === "librarian";
  useEffect(() => {
      document.body.className = "BookManagement-page";
      return () => {
        document.body.className = ""; 
      };
      }, []);

  useEffect(() => {
    if (isLibrarian) fetchBooks();
  }, [isLibrarian]);

  const fetchBooks = () => {
    fetch("http://127.0.0.1:5000/api/books")
      .then((res) => res.json())
      .then((data) => setBooks(Array.isArray(data) ? data : []));
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((prev) => ({ ...prev, file: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    const { title, author, isbn, description, file } = form;
    if (!title || !author || !isbn) {
      alert("Title, Author, and ISBN are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("isbn", isbn);
    formData.append("description", description);
    if (file) formData.append("file", file);

    const url = editingBookId
      ? `http://127.0.0.1:5000/api/books/${editingBookId}`
      : "http://127.0.0.1:5000/api/books";
    const method = editingBookId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData
      });
      const data = await res.json();

      if (data.error) alert(data.error);
      else {
        alert(editingBookId ? "Book updated." : "Book added.");
        setForm({ title: "", author: "", isbn: "", description: "", file: null });
        setEditingBookId(null);
        fetchBooks();
      }
    } catch {
      alert("Server error");
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/books/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        alert("Book deleted.");
        fetchBooks();
      }
    } catch {
      alert("Server error");
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description || "",
      file: null
    });
    setEditingBookId(book.book_id);
  };

  if (!isLibrarian) {
    return (
      <Layout>
        <div className="text-center mt-10 text-red-600 font-semibold">
          Access denied. This page is for librarians only.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="book-management-container space-y-10">
        <h2 className="text-3xl font-bold">📘 Book Management</h2>

{/* Book List */}
<div className="user-table-wrapper">
  <h3 className="text-xl font-semibold mb-4">📚 All Books</h3>
  <table className="user-table-custom">
    <thead>
      <tr>
        <th>Title</th>
        <th>Author</th>
        <th>ISBN</th>
        <th>Available</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {books.map((b) => (
        <tr key={b.book_id}>
          <td>{b.title}</td>
          <td>{b.author}</td>
          <td>{b.isbn}</td>
          <td>
            <span className={b.available ? "text-green-600" : "text-red-600"}>
              {b.available ? "Yes" : "No"}
            </span>
          </td>
          <td>
            <button
              onClick={() => handleEdit(b)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              style={{
                background: "red",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                marginLeft: "8px"
              }}
              onMouseOver={(e) => (e.target.style.background = "#cc0000")}
              onMouseOut={(e) => (e.target.style.background = "red")}
              onClick={() => handleDeleteBook(b.book_id)}
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


        {/* Add or Edit Book Form */}
        <div className="book-form-card">
          <h3 className="text-xl font-semibold mb-4 borrowers-title">
            {editingBookId ? "✏️ Edit Book" : "➕ Add New Book"}
          </h3>
          <div className="space-y-3">
            <input
              name="title"
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="author"
              type="text"
              placeholder="Author"
              value={form.author}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              name="isbn"
              type="text"
              placeholder="ISBN"
              value={form.isbn}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleInputChange}
              style={{ width: "100%" }}
              className="w-full p-2 border rounded"
              rows={3}
            />
            <input
              name="file"
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={handleInputChange}
              className="w-full"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingBookId ? "Update Book" : "Add Book"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}



// // src/pages/BookManagementPage.jsx
// import React, { useEffect, useState } from "react";
// import Layout from "../components/Layout";

// export default function BookManagementPage() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const [books, setBooks] = useState([]);
//   const [form, setForm] = useState({
//     title: "",
//     author: "",
//     isbn: "",
//     description: ""
//   });

//   const isLibrarian = user?.user_type === "librarian";

//   useEffect(() => {
//     if (!isLibrarian) return;
//     fetchBooks();
//   }, [isLibrarian]);

//   const fetchBooks = () => {
//     fetch("http://127.0.0.1:5000/api/books")
//       .then(res => res.json())
//       .then(data => setBooks(Array.isArray(data) ? data : []));
//   };

//   const handleCreateBook = async () => {
//     const { title, author, isbn } = form;
//     if (!title || !author || !isbn) {
//       alert("Title, Author, and ISBN are required.");
//       return;
//     }

//     try {
//       const res = await fetch("http://127.0.0.1:5000/api/books", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       const data = await res.json();
//       if (data.error) alert(data.error);
//       else {
//         alert("Book added.");
//         setForm({ title: "", author: "", isbn: "", description: "" });
//         fetchBooks();
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   const handleDeleteBook = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this book?")) return;

//     try {
//       const res = await fetch(`http://127.0.0.1:5000/api/books/${id}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();
//       if (data.error) alert(data.error);
//       else {
//         alert("Book deleted.");
//         fetchBooks();
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   if (!isLibrarian) {
//     return (
//       <Layout>
//         <div className="text-center mt-10 text-red-600 font-semibold">
//           Access denied. This page is for librarians only.
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="book-management-form space-y-10">
//         <h2 className="text-3xl font-bold">📘 Book Management</h2>

//         {/* Book List */}
//         <div className="bg-white p-4 rounded shadow overflow-x-auto">
//           <h3 className="text-xl font-semibold mb-4">All Books</h3>
//           <table className="min-w-full text-left border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2 border">Title</th>
//                 <th className="p-2 border">Author</th>
//                 <th className="p-2 border">ISBN</th>
//                 <th className="p-2 border">Available</th>
//                 <th className="p-2 border">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {books.map((b) => (
//                 <tr key={b.book_id} className="border-t">
//                   <td className="p-2 border">{b.title}</td>
//                   <td className="p-2 border">{b.author}</td>
//                   <td className="p-2 border">{b.isbn}</td>
//                   <td className="p-2 border">
//                     <span className={b.available ? "text-green-600" : "text-red-600"}>
//                       {b.available ? "Yes" : "No"}
//                     </span>
//                   </td>
//                   <td className="p-2 border">
//                     <button
//                       onClick={() => handleDeleteBook(b.book_id)}
//                       className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Add New Book Form */}
//         <div className="bg-white p-6 rounded shadow max-w-xl">
//           <h3 className="text-xl font-semibold mb-4">➕ Add New Book</h3>
//           <div className="space-y-3">
//             <input
//               type="text"
//               placeholder="Title"
//               value={form.title}
//               onChange={(e) => setForm({ ...form, title: e.target.value })}
//               className="w-full p-2 border rounded"
//             />
//             <input
//               type="text"
//               placeholder="Author"
//               value={form.author}
//               onChange={(e) => setForm({ ...form, author: e.target.value })}
//               className="w-full p-2 border rounded"
//             />
//             <input
//               type="text"
//               placeholder="ISBN"
//               value={form.isbn}
//               onChange={(e) => setForm({ ...form, isbn: e.target.value })}
//               className="w-full p-2 border rounded"
//             />
//             <textarea
//               placeholder="Description (optional)"
//               value={form.description}
//               onChange={(e) => setForm({ ...form, description: e.target.value })}
//               className="w-full p-2 border rounded"
//               rows={3}
//             />
//             <button
//               onClick={handleCreateBook}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//               Add Book
//             </button>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }
