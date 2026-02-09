import logo from "../../assets/logo-provisional.png";
import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../../stores/auth.store";
import { useState } from "react";
import { Modal } from "../../components/Modal";
import { Link, useNavigate } from "react-router-dom";
import RegisterSchema from "../../schemas/RegisterSchema";

export default function Rergister({}) {
  const register = useAuthStore((state) => state.register);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [success, setSuccess] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = RegisterSchema.safeParse({ name, email, password });

    if (!result.success) {
      setModalTitle("Validation Error");
      setModalMessage(result.error.issues[0].message);
      setModalOpen(true);
      return;
    }

    try {
      const data = await register(result.data.name, result.data.email, result.data.password, "admin");;
      
      if (data.success) {
        setModalTitle("Registration Successful");
        setModalMessage("Redirecting to login...");
        setSuccess(true);
      } else {
        setModalTitle("Error");
        setModalMessage(data.message || "An error occurred.");
      }

      setModalOpen(true);
    } catch (err) {
      setModalTitle("Error");
      setModalMessage(err.message || "Error registering user.");
      setModalOpen(true);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl shadow-gray-200 border border-gray-300/20 space-y-6">
          <header className="flex flex-col items-center">
            <img
              src={logo}
              alt="Limpora Logo"
              className="w-32 h-32 object-contain flex-shrink-0"
            />

            <h1 className="text-2xl font-light text-gray-800">Registro</h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Nombre completo"
                className="w-full p-4 bg-gray-100/50 border border-gray-300/50 rounded-lg shadow-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition duration-150"
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
              />
            </div>

            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Correo Electrónico"
                className="w-full p-4 bg-gray-100/50 border border-gray-300/50 rounded-lg shadow-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition duration-150"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Contraseña"
                className="w-full p-4 bg-gray-100/50 border border-gray-300/50 rounded-lg shadow-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition duration-150"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                value={password}
              />
            </div>

            <div className="flex justify-between pt-2 space-x-4">

              
              <button
                type="submit"
                className="w-1/2 p-3 bg-gray-100 text-gray-800 font-medium rounded-lg shadow-sm border border-gray-300/50 transition duration-150 hover:bg-gray-200/70 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
              >
                Confirmar
              </button>

              <Link
                to="/login"
                className="w-1/2 p-3 text-center bg-gray-50 text-gray-600 font-medium rounded-lg shadow-sm border border-gray-300/50 transition duration-150 hover:bg-gray-100/70 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (success) {
            navigate("/login");
          }
        }}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
}

// https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/