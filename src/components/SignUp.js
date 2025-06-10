import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    fullName: "",
    eMailAddress: "",
    mobileNumber: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.userId) newErrors.userId = "User ID is required";
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!/\S+@\S+\.\S+/.test(formData.eMailAddress))
      newErrors.eMailAddress = "Valid email is required";
    if (!/^\d{10}$/.test(formData.mobileNumber))
      newErrors.mobileNumber = "10-digit number required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:9090/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Sign Up successful!");
        navigate("/signin");
      } else {
        alert("Sign Up failed.");
      }
    } catch (err) {
      alert("Server error.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <motion.div
        className="bg-slate-800 p-8 rounded-xl shadow-xl w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "User ID", name: "userId", type: "number" },
            { label: "Full Name", name: "fullName", type: "text" },
            { label: "Email Address", name: "eMailAddress", type: "email" },
            { label: "Mobile Number", name: "mobileNumber", type: "tel" },
            { label: "Password", name: "password", type: "password" },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block mb-1">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            className="w-full bg-green-600 hover:bg-green-700 transition py-2 rounded-lg font-semibold"
          >
            Sign Up
          </motion.button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="text-blue-400 hover:underline cursor-pointer"
          >
            Sign In
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
