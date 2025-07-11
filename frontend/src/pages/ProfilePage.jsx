// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function ProfilePage() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const [history, setHistory] = useState([]);
//   const [fine, setFine] = useState(0);
//   const [showPaymentForm, setShowPaymentForm] = useState(false);
//   const [payAmount, setPayAmount] = useState("");
//   const [cardNumber, setCardNumber] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     document.body.className = "profile-page";
//     return () => { document.body.className = ""; }
//   }, []);

//   useEffect(() => {
//     fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/history`)
//       .then(res => res.json())
//       .then(data => {
//         if (Array.isArray(data)) {
//           setHistory(data);
//         } else {
//           console.error("history API returned non-array", data);
//           setHistory([]);
//         }
//       });

//     fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/fine`)
//       .then(res => res.json())
//       .then(data => setFine(data.fine));
//   }, []);

//   const handleOpenPayment = () => {
//     if (fine === 0) {
//       alert("No fine to pay.");
//       return;
//     }
//     setShowPaymentForm(true);
//   };

//   const handleSubmitPayment = async () => {
//     if (!payAmount || !cardNumber) {
//       alert("Please fill all fields.");
//       return;
//     }
//     try {
//       const res = await fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/payfine`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ amount: parseFloat(payAmount) })
//       });
//       const data = await res.json();
//       if (data.error) {
//         alert(data.error);
//       } else {
//         alert(data.message);
//         window.location.reload();
//       }
//     } catch {
//       alert("Server error");
//     }
//   };

//   return (
//     <div className="container">
//       <h2>{user.username}'s Profile</h2>
//       <p>Email: {user.email}</p>
//       <p>Current fine: ${fine}</p>
//       {fine > 0 && !showPaymentForm && (
//         <button onClick={handleOpenPayment}>Pay Fine</button>
//       )}

//       {showPaymentForm && (
//         <div style={{ marginTop: "20px" }}>
//           <h4>Pay Fine</h4>
//           <input
//             type="number"
//             placeholder="Amount to pay"
//             value={payAmount}
//             onChange={e => setPayAmount(e.target.value)}
//           />
//           <input
//             type="text"
//             placeholder="Card Number"
//             value={cardNumber}
//             onChange={e => setCardNumber(e.target.value)}
//           />
//           <button onClick={handleSubmitPayment}>Submit Payment</button>
//           <button onClick={() => setShowPaymentForm(false)}>Cancel</button>
//         </div>
//       )}

//       <h3>Borrow History</h3>
//       {!Array.isArray(history) || history.length === 0 ? (
//         <p>No history yet.</p>
//       ) : (
//         history.map(h => (
//                    <div key={h.history_id}>
//                     {h.title} (ISBN: {h.isbn}), Borrowed: {new Date(h.borrow_date).toLocaleDateString()}, Returned: {new Date(h.return_date).toLocaleDateString()}
//                   </div>
//         ))
//       )}
      
//       <button style={{ marginRight: "10px" }} onClick={() => navigate("/home")}> Back to Home </button>
      
//       <button
//           className="logout-button"
//           onClick={() => {
//             localStorage.removeItem("user");
//             navigate("/login");
//           }}
//         >
//           Logout
//         </button>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [history, setHistory] = useState([]);
  const [fine, setFine] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = "profile-page";
    return () => { document.body.className = ""; }
  }, []);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/history`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          console.error("history API returned non-array", data);
          setHistory([]);
        }
      });

    fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/fine`)
      .then(res => res.json())
      .then(data => setFine(data.fine));
  }, []);

  const handleOpenPayment = () => {
    if (fine === 0) {
      alert("No fine to pay.");
      return;
    }
    setShowPaymentForm(true);
  };

  const handleSubmitPayment = async () => {
  if (!payAmount || !cardNumber) {
    alert("Please fill all fields.");
    return;
  }
  if (!/^[0-9]{12}$/.test(cardNumber)) {
    alert("Card number must be exactly 12 digits.");
    return;
  }
  if (parseFloat(payAmount) > fine) {
    alert(`You cannot pay more than your current fine of $${fine}.`);
    return;
  }
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/payfine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(payAmount) })
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      alert(data.message);
      window.location.reload();
    }
  } catch {
    alert("Server error");
  }
};


  return (
    <div className="container">
      <h2>{user.username}'s Profile</h2>
      <p>Email: {user.email}</p>
      <p>Current fine: ${fine}</p>
      {fine > 0 && !showPaymentForm && (
        <button onClick={handleOpenPayment}>Pay Fine</button>
      )}

      {showPaymentForm && (
        <div style={{ marginTop: "20px" }}>
          <h4>Pay Fine</h4>
          <input
            type="number"
            placeholder="Amount to pay"
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="12-digit Card Number"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
          />
          <button onClick={handleSubmitPayment}>Submit Payment</button>
          <button onClick={() => setShowPaymentForm(false)}>Cancel</button>
        </div>
      )}

      <h3>Borrow History</h3>
      {!Array.isArray(history) || history.length === 0 ? (
        <p>No history yet.</p>
      ) : (
        history.map(h => (
          <div
            key={h.history_id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "10px",
              margin: "10px 0",
              background: "#f1f9ff"
            }}
          >
            <strong>{h.title}</strong> (ISBN: {h.isbn})<br />
            Borrowed: {new Date(h.borrow_date).toLocaleDateString()}<br />
            Returned: {new Date(h.return_date).toLocaleDateString()}<br />
            {/* Feedback: {h.feedback || "No feedback"} */}
          </div>
        ))
      )}
      
      <button style={{ marginRight: "10px" }} onClick={() => navigate("/home")}>Back to Home</button>
      
      <button
        className="logout-button"
        onClick={() => {
          localStorage.removeItem("user");
          
          navigate("/login");
          
        }}
      >
        Logout
      </button>
    </div>
  );
}
