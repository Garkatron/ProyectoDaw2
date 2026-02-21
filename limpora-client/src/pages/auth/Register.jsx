import logo from "../../assets/logo-provisional.png";
import { useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { Modal } from "../../components/Modal";
import { Link, useNavigate } from "react-router-dom";
import RegisterSchema from "../../schemas/RegisterSchema";

export default function Register() {
  const register = useAuthStore((state) => state.register);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");

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
      const data = await register(
        result.data.name,
        result.data.email,
        result.data.password,
        role
      );

      if (data.success) {
        setModalTitle("Registro exitoso");
        setModalMessage("Redirigiendo a login...");
        setSuccess(true);
      } else {
        setModalTitle("Error");
        setModalMessage(data.message || "Ocurrió un error.");
      }

      setModalOpen(true);
    } catch (err) {
      setModalTitle("Error");
      setModalMessage(err.message || "Error registrando usuario.");
      setModalOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-gray-50 p-10 rounded-xl border border-gray-200 space-y-8">
        <header className="flex flex-col items-center space-y-2">
          <img
            src={logo}
            alt="Limpora Logo"
            className="w-28 h-28 object-contain"
          />
          <h1 className="text-3xl font-light text-gray-700">Registro</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              required
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
            />

            <input
              type="email"
              required
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
            />

            <input
              type="password"
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
            />

            {/* Selector de rol opcional */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
            >
              <option value="client">Cliente</option>
              <option value="provider">Proveedor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 p-3 bg-gray-100 text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-200 transition"
            >
              Confirmar
            </button>

            <Link
              to="/login"
              className="flex-1 p-3 text-center bg-gray-50 text-gray-600 font-medium rounded-md border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (success) navigate("/login");
        }}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
}