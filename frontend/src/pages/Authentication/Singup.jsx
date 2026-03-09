import { useState, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { UserContext } from "../../Context/UserContext";

export default function Signup({ onSwitch }) {
  const { register } = useContext(UserContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.email))
      newErrors.email = "Invalid email format";

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!form.password)
      newErrors.password = "Password is required";
    else if (!passwordRegex.test(form.password))
      newErrors.password =
        "Password must be at least 8 characters, include 1 uppercase, 1 number, and 1 special character";

    if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    setIsLoading(true);

    try {

      await register({
        name: form.name,
        email: form.email,
        password: form.password
      });

      Swal.fire({
        icon: "success",
        title: "Signup Successful!",
        text: "You can now login.",
        timer: 1500,
        showConfirmButton: false
      });

      onSwitch(); // switch to login

    } catch (err) {

      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: err.response?.data?.message || "Something went wrong"
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <h2 className="text-2xl font-bold text-[#ffbe00] text-center">
        Sign Up
      </h2>

      {/* Name */}
      <div>
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#ffbe00] text-white py-2 rounded-lg font-bold hover:bg-[#e6ab00] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing Up..." : "Sign Up"}
      </button>

      <p className="text-center text-sm">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-[#ffbe00] font-semibold"
        >
          Login
        </button>
      </p>

    </form>
  );
}