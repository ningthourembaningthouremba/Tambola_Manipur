import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore"; // adjust path if needed

const Register = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
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

    const { name, email, password, phone } = formData;

    if (!name || !email || !password) {
      return alert("Name, Email, and Password are required.");
    }

    try {
      await signup(email, password, name, phone);
      setSuccess("Registration successful!");
      setFormData({ name: "", email: "", password: "", phone: "" });

      navigate("/login");

    } catch (err) {
      // Error already handled in store
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-slate-600 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
      {success && <p className="text-green-500 mb-2 text-center">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

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

        <div>
          <label className="block font-medium">Phone (optional)</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

      </form>
      <div className="text-center mt-4">Already registered? <Link to={"/login"} className="text-blue-600">Login here.</Link></div>
    </div>
  );
};

export default Register;
























// import { useState } from "react";
// import axios from "axios";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//   });

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleChange = (e) => {
//     setFormData({ 
//       ...formData,
//       [e.target.name]: e.target.value 
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!formData.name || !formData.email || !formData.password) {
//       setError("Name, Email, and Password are required.");
//       return;
//     }

//     try {
//       const response = await axios.post("http://localhost:5000/api/auth/register", formData);

//       if (response.data.success) {
//         setSuccess("Registration successful!");
//         setFormData({ name: "", email: "", password: "", phone: "" });
//       } else {
//         setError(response.data.message || "Registration failed.");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong.");
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 bg-slate-600 shadow-md rounded-lg p-6">
//       <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       {success && <p className="text-green-500 mb-2">{success}</p>}

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block font-medium">Name *</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             className="w-full border border-gray-300 p-2 rounded"
//             required
//           />
//         </div>

//         <div>
//           <label className="block font-medium">Email *</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full border border-gray-300 p-2 rounded"
//             required
//           />
//         </div>

//         <div>
//           <label className="block font-medium">Password *</label>
//           <input
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full border border-gray-300 p-2 rounded"
//             required
//           />
//         </div>

//         <div>
//           <label className="block font-medium">Phone (optional)</label>
//           <input
//             type="tel"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             className="w-full border border-gray-300 p-2 rounded"
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
//         >
//           Register
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Register;
