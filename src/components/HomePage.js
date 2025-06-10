import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-900 to-slate-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold text-white tracking-wide">
          Location Tracker
        </h1>
        <div className="space-x-4">
          <Link to="/signin">
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg font-medium"
            >
              Sign In
            </motion.button>
          </Link>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="bg-green-500 hover:bg-green-600 transition-colors px-4 py-2 rounded-lg font-medium"
            >
              Sign Up
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        className="flex-grow flex flex-col justify-center items-center text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
          Real-Time Location Sharing
        </h2>
        <p className="text-lg md:text-xl max-w-xl text-gray-300 mb-10">
          Track and share live locations with ease. Secure, fast, and
          beautifully designed for seamless collaboration.
        </p>
        <Link to="/signup">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 text-lg rounded-lg font-semibold transition"
          >
            Get Started
          </motion.button>
        </Link>
      </motion.div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Location Tracker. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
