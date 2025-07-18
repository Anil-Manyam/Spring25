import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function FeedbackPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [history, setHistory] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [selectedBookId, setSelectedBookId] = useState("");
  const [newFeedback, setNewFeedback] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/history`)
      .then((res) => res.json())
      .then((data) => {
        const returnedBooks = (data || []).filter((b) => b.return_date);
        setHistory(returnedBooks);

        // Fetch feedback for each book to detect which books already have feedback from this user
        returnedBooks.forEach((book) => {
          fetch(`http://127.0.0.1:5000/api/books/${book.book_id}/feedback`)
            .then((res) => res.json())
            .then((fb) => {
              const userFeedback = (fb || []).find((f) => f.user_id === user.user_id);
              setFeedbacks((prev) => ({
                ...prev,
                [book.book_id]: userFeedback?.feedback || null,
              }));
            });
        });
      });
  }, [user.user_id]);

  const handleSubmitFeedback = async () => {
    if (!selectedBookId || !newFeedback.trim()) {
      alert("Please select a book and write some feedback.");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/books/${selectedBookId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          username: user.username,
          feedback: newFeedback,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert("Feedback submitted successfully.");
        setFeedbacks((prev) => ({
          ...prev,
          [selectedBookId]: newFeedback,
        }));
        setSelectedBookId("");
        setNewFeedback("");
      }
    } catch {
      alert("Server error.");
    }
  };

  const booksWithoutFeedback = history.filter((b) => !feedbacks[b.book_id]);
  const booksWithFeedback = history.filter((b) => feedbacks[b.book_id]);

  return (
    <Layout>
      <div className="space-y-10 max-w-4xl mx-auto">
        {/* Feedback submission section */}
        <div>
          <h2 className="text-3xl font-bold mb-4">✍️ Leave Feedback</h2>
          {booksWithoutFeedback.length === 0 ? (
            <p className="text-gray-600">You've left feedback for all returned books.</p>
          ) : (
            <div className="bg-white p-6 rounded shadow space-y-4">
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a returned book</option>
                {booksWithoutFeedback.map((b) => (
                  <option key={b.book_id} value={b.book_id}>
                    {b.title} (ISBN: {b.isbn})
                  </option>
                ))}
              </select>

              <textarea
                rows={4}
                placeholder="Write your feedback..."
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                className="w-full p-2 border rounded"
              />

              <button
                onClick={handleSubmitFeedback}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Submit Feedback
              </button>
            </div>
          )}
        </div>

        {/* Feedback history section */}
        <div>
          <h2 className="text-3xl font-bold mb-4">📢 My Feedback</h2>
          {booksWithFeedback.length === 0 ? (
            <p className="text-gray-600">No feedback submitted yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {booksWithFeedback.map((b) => (
                <div
                  key={b.book_id}
                  className="bg-white border rounded p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-lg">{b.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">ISBN: {b.isbn}</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{feedbacks[b.book_id]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
