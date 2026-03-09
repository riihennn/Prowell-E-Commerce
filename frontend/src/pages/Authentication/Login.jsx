import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";
import { setAuthToken } from "../../api/api";
import Swal from "sweetalert2";

export default function Login({ onSwitch }) {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await login({
        email: form.email,
        password: form.password
      });

      const { user } = res.data;

      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: `Hello, ${user.name}!`,
        timer: 1500,
        showConfirmButton: false
      });

      navigate("/");

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          err.response?.data?.message ||
          "Invalid email or password"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-[#ffbe00] text-center">
        Login
      </h2>

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full border p-2 rounded-lg"
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="w-full border p-2 rounded-lg"
        required
      />

      <button 
        disabled={isLoading}
        className="w-full bg-[#ffbe00] text-white py-2 rounded-lg font-bold disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      <p className="text-center text-sm">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#ffbe00] font-semibold"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}