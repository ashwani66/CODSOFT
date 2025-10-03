import { useEffect, useState } from "react";
import axios from "axios";
import "./cartPage.css";

const CartPage = () => {
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ---------- Fetch Cart ----------
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

  // ---------- Update Quantity ----------
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to update quantity");
    }
  };

  // ---------- Remove Product ----------
  const removeFromCart = async (productId) => {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/cart/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to remove product");
    }
  };

  // ---------- Total Price ----------
  const totalPrice = cart.products.reduce(
    (acc, item) => acc + item.productId.price * item.quantity,
    0
  );

  useEffect(() => {
    fetchCart();
  }, []);

  return (
<div className="cart-container">
<div className="cart-header">
  <h1>Shopping Cart</h1>
</div>
<div className="cart-page">

      {loading && <p className="loading">Loading...</p>}
      {/* {error && <p className="error">{error}</p>} */} 

      {cart.products.length === 0 ? (
        <p className="empty">Your cart is empty</p>
      ) : (
        <div className="cart-content">
          {/* ---------- Left: Cart Items ---------- */}
          <div className="cart-items">
            {cart.products.map((item) => (
              <div className="cart-item" key={item.productId._id}>
                <img
                  src={`http://localhost:5000/${item.productId.images[0]}`}
                  alt={item.productId.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{item.productId.name}</h3>
                  <p className="price">₹{item.productId.price}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId._id, item.quantity - 1)
                      }
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <p className="subtotal">
                    Subtotal: ₹{item.productId.price * item.quantity}
                  </p>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.productId._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- Right: Cart Summary ---------- */}
<div className="cart-summary">
  <h2 className="summary-title">Price Details</h2>

  <div className="summary-products">
    {cart.products.map((item) => (
      <div className="summary-item" key={item.productId._id}>
        <span className="summary-name">
          {item.productId.name} × {item.quantity}
        </span>
        <span className="summary-price">
          ₹{item.productId.price * item.quantity}
      
        </span>
        
      </div>
      
    ))}
  </div>

  <hr />

  <div className="summary-total">
    <span>Total Amount</span>
    <span>₹{totalPrice}</span>
  </div>

  <button className="checkout-btn">Proceed to Buy</button>
</div>

        </div>
      )}
    </div>
    </div>
  );
};

export default CartPage;
