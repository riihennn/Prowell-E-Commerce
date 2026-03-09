import React, { createContext, useState, useEffect } from "react";
import API, { setAuthToken } from "../api/api";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  // RESTORE USER FROM TOKEN
  useEffect(() => {

    const lsToken = localStorage.getItem("token");

    if (!lsToken) return;

    setToken(lsToken);
    setAuthToken(lsToken);

    const restoreUser = async () => {

      try {
        const userRes = await API.get("/auth/profile");
        setUser(userRes.data);

        // Fetch Cart separately
        try {
          const cartRes = await API.get("/cart");
          const formattedCart = (cartRes.data.items || []).map(item => ({
            ...item.product,
            quantity: item.quantity
          }));
          setCart(formattedCart);
        } catch (err) {
          console.warn("Failed to fetch cart:", err);
          setCart([]);
        }

        // Fetch Wishlist separately
        try {
          const wishlistRes = await API.get("/wishlist");
          setWishlist(wishlistRes.data.products || []);
        } catch (err) {
          console.warn("Failed to fetch wishlist:", err);
          setWishlist([]);
        }

      } catch (err) {
        // Handle failure to restore user gracefully
        setToken(null);
        setUser(null);
        setCart([]);
        setWishlist([]);

        localStorage.removeItem("token");
        setAuthToken(null);

      } finally {

        setLoading(false);

      }

    };

    restoreUser();

  }, []);




  // REGISTER
  const register = async ({ name, email, password }) => {

    const res = await API.post("/auth/register", {
      name,
      email,
      password
    });

    if (res.data.accessToken) {

      setToken(res.data.accessToken);
      setAuthToken(res.data.accessToken);

      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

    }

    if (res.data.user) setUser(res.data.user);

    return res;

  };




  // LOGIN
  const login = async ({ email, password }) => {

    const res = await API.post("/auth/login", { email, password });

    const data = res.data;
    console.log("Login full response data:", data);

    const receivedToken = data.accessToken || data.token;
    const receivedRefreshToken = data.refreshToken;

    if (receivedToken) {
      console.log("Setting tokens in state and storage. Token detected:", receivedToken.substring(0, 10) + "...");
      setToken(receivedToken);
      setAuthToken(receivedToken);

      localStorage.setItem("token", receivedToken);
      if (receivedRefreshToken) {
        localStorage.setItem("refreshToken", receivedRefreshToken);
      }
      console.log("LocalStorage after save:", {
        token: localStorage.getItem("token") ? "Present" : "Missing",
        refreshToken: localStorage.getItem("refreshToken") ? "Present" : "Missing"
      });
    } else {
      console.error("No token found in response data!");
    }

    if (data.user) setUser(data.user);

    // Fetch Cart & Wishlist gracefully
    try {
      const cartRes = await API.get("/cart");
      const formattedCart = (cartRes.data.items || []).map(item => ({
        ...item.product,
        quantity: item.quantity
      }));
      setCart(formattedCart);
    } catch (err) {
      console.warn("Login: Failed to fetch cart");
      setCart([]);
    }

    try {
      const wishlistRes = await API.get("/wishlist");
      setWishlist(wishlistRes.data.products || []);
    } catch (err) {
      console.warn("Login: Failed to fetch wishlist");
      setWishlist([]);
    }

    return res;

  };




  // LOGOUT
  const logout = async () => {

    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    }

    setUser(null);
    setToken(null);
    setCart([]);
    setWishlist([]);

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    setAuthToken(null);

  };




  // OPTIONAL WISHLIST SYNC
  const syncWishlistToServer = async (newWishlist) => {

    try {

      await API.post("/wishlist/add", {
        products: newWishlist.map(p => p._id)
      });

    } catch (err) {

      console.warn("Wishlist sync failed:", err);

    }

  };




  return (

    <UserContext.Provider
      value={{
        user,
        token,
        cart,
        setCart,
        wishlist,
        setWishlist,
        setUser,
        loading,
        setLoading,
        login,
        register,
        logout,
        syncWishlistToServer
      }}
    >

      {children}

    </UserContext.Provider>

  );

};