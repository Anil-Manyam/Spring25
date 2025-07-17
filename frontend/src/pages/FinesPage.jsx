import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function FinesPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [fine, setFine] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  useEffect(() => {
      document.body.className = "Fines-page";
      return () => {
        document.body.className = "";
      };
    }, []);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/fine`)
      .then((res) => res.json())
      .then((data) => setFine(data.fine));
  }, [user.user_id]);

  const handleOpenPayment = () => {
    if (fine === 0) return alert("No fine to pay.");
    setShowPaymentForm(true);
  };

  const handleSubmitPayment = async () => {
    if (!payAmount || !cardNumber)
      return alert("Please fill all fields.");
    if (!/^[0-9]{12}$/.test(cardNumber))
      return alert("Card number must be exactly 12 digits.");
    if (parseFloat(payAmount) > fine)
      return alert(`You cannot pay more than $${fine}.`);

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/users/${user.user_id}/payfine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(payAmount) }),
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        alert(data.message);
        window.location.reload();
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <Layout>
      <div className="fine-box">
        <h2 className="text-3xl font-bold mb-4">💰 Your Fines</h2>
        <p className="text-gray-700 text-lg mb-4">
          Current Fine Amount:&nbsp;
          <span className="text-red-600 font-semibold">${fine.toFixed(2)}</span>
        </p>

        {fine > 0 && !showPaymentForm && (
          <button
            onClick={handleOpenPayment}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Pay Fine
          </button>
        )}

        {showPaymentForm && (
          <div className="mt-6 space-y-4">
            <h4 className="text-xl font-semibold">Pay Your Fine</h4>
            <input
              type="number"
              placeholder="Amount to pay"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="block w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="12-digit Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="block w-full p-2 border rounded"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSubmitPayment}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Submit Payment
              </button>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
