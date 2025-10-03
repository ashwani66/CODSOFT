import { useEffect, useState } from "react";
import axios from "axios";
import "./checkoutPage.css";

const CheckoutPage = () => {
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    payment: "card",
  });

  const token = localStorage.getItem("token");

  // ---------- Get only the user ID from localStorage ----------
  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  // ---------- Fetch cart for order summary ----------
  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ---------- Handle form input ----------
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ---------- Handle form submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User not logged in!");
      return;
    }

    if (cart.products.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // Build the order payload
    const orderPayload = {
      userId, // ✅ only the ObjectId string
      products: cart.products.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      amount: cart.products.reduce(
        (acc, item) => acc + item.productId.price * item.quantity,
        0
      ),
      status: "Pending",
      shipping: {
        name: formData.name,
        address: formData.address,
      },
      paymentMethod: formData.payment,
      paymentStatus: formData.payment === "cod" ? "Pending" : "Paid",
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/order",
        orderPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Order placed:", res.data.data);
      alert("Order placed successfully!");

      // Optionally, clear cart after placing order
      setCart({ products: [] });
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  const totalPrice = cart.products.reduce(
    (acc, item) => acc + item.productId.price * item.quantity,
    0
  );

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <p className="subtitle">Review your order and complete the purchase</p>

      {loading && <p className="loading">Loading cart...</p>}
      {error && <p className="error">{error}</p>}

      {cart.products.length === 0 ? (
        <p className="empty">Your cart is empty</p>
      ) : (
        <div className="checkout-content">
          {/* ---------- Left: User Details Form ---------- */}
          <div className="checkout-form-container">
            <h2>Shipping Details</h2>
            <form className="checkout-form" onSubmit={handleSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Address:
                <input
                  type="text"
                  name="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Payment Method:
                <select
                  name="payment"
                  value={formData.payment}
                  onChange={handleChange}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </label>

              <button type="submit" className="checkout-btn">
                Place Order
              </button>
            </form>
          </div>

          {/* ---------- Right: Order Summary ---------- */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.products.map((item) => (
                <div className="summary-item" key={item.productId._id}>
                  <img
                    src={`http://localhost:5000/${item.productId.images[0]}`}
                    alt={item.productId.name}
                  />
                  <div className="summary-details">
                    <p className="name">{item.productId.name}</p>
                    <p>
                      {item.quantity} × ₹{item.productId.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Total Amount</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
