import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {useAuthStore} from "../store/authStore"; // adjust the path

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    const { email, password } = formData;

    if (!email || !password) {
      return alert("Email and Password are required.");
    }
    

    try {
      await login(email, password);
      setSuccess("Logged in successfully!");
      setFormData({ email: "", password: "" });

      // Optional: redirect to dashboard or home
      navigate("/");

    } catch (err) {
      // error already handled in store
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-slate-600 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
      {success && <p className="text-green-500 mb-2 text-center">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="text-center mt-4">Don't have an account? <Link to={"/register"} className="text-blue-600">Register here.</Link></div>
    </div>
  );
};

export default Login;
