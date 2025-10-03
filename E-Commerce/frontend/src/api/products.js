import axios from "axios";

// ---------- Axios instance ----------
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ---------- Request interceptor to add token ----------
API.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token && !config.url.startsWith("/auth")) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// ---------- Products API ----------

export async function fetchProducts() {
  try {
    const response = await API.get("/products");
    return response.data; // Expecting an array of products
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    const response = await API.delete("/products/" + id);
    return response.data;
  } catch (error) {
    console.error("Error deleting product with id " + id + ":", error);
    throw error;
  }
}

export async function updateProduct(id, formData) {
  try {
    const response = await API.put("/products/" + id, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product with id " + id + ":", error);
    throw error;
  }
}

// ---------- Users API ----------

export async function getUsers() {
  try {
    const response = await API.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function deleteUser(id) {
  try {
    const response = await API.delete("/users/" + id);
    return response.data;
  } catch (error) {
    console.error("Error deleting user with id " + id + ":", error);
    throw error;
  }
}

// ---------- Orders API ----------

export async function fetchOrders() {
  try {
    const response = await API.get("/order");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function updateOrder(id, data) {
  try {
    const response = await API.put("/order/" + id, data);
    return response.data;
  } catch (error) {
    console.error("Error updating order with id " + id + ":", error);
    throw error;
  }
}

export async function deleteOrder(id) {
  try {
    const response = await API.delete("/order/" + id);
    return response.data;
  } catch (error) {
    console.error("Error deleting order with id " + id + ":", error);
    throw error;
  }
}

// ---------- Reviews API ----------

export async function fetchReviews(productId) {
  try {
    const response = await API.get("/review/" + productId);
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews for product " + productId + ":", error);
    throw error;
  }
}

export async function addReview(reviewData) {
  try {
    const response = await API.post("/review", reviewData);
    return response.data;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
}

export async function deleteReview(id) {
  try {
    const response = await API.delete("/review/" + id);
    return response.data;
  } catch (error) {
    console.error("Error deleting review " + id + ":", error);
    throw error;
  }
}
