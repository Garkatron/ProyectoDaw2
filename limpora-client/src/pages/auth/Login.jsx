import logo from "../../assets/logo-provisional.png";
import { useAuthStore } from "../../stores/auth.store";
import { useState } from "react";
import { Modal } from "../../components/Modal";
import { Link, useNavigate } from "react-router-dom";
import LoginSchema from "../../schemas/NewSessionSchema";
import lang from "../../utils/LangManager";

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isAdmin, setAdmin] = useState(false);

  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    window.location.href = "/api/v1/auth/google-url";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = LoginSchema.safeParse({ email, password });

    if (!result.success) {
      setModalTitle(lang("login.validation_error"));
      setModalMessage(result.error.issues[0].message);
      setModalOpen(true);
      return;
    }

    try {
      const response = await login(email, password);

      if (response.success) {
        setModalTitle(lang("login.success_title"));
        setModalMessage(lang("login.success_message"));
        setSuccess(true);
        console.log(response);
        if (response.data.role === "admin") {
          setAdmin(true);
        }
      } else {
        setModalTitle(lang("login.error_title"));
        setModalMessage(response.message || lang("login.generic_error"));
      }

      setModalOpen(true);
    } catch (err) {
      setModalTitle(lang("login.error_title"));
      setModalMessage(err.message || lang("login.login_error"));
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
            <h1 className="text-2xl font-light text-gray-800">
              {lang("login.title")}
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {lang("login.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full p-3 border border-gray-300/50 rounded-md shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400/50 transition duration-150"
                placeholder="tu.correo@ejemplo.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {lang("login.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full p-3 border border-gray-300/50 rounded-md shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400/50 transition duration-150"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-gray-100 text-gray-800 font-medium rounded-lg shadow-sm border border-gray-300/50 transition duration-150 hover:bg-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            >
              {lang("login.submit")}
            </button>
            <button
              onClick={loginWithGoogle}
              className="w-full p-3 bg-gray-100 text-gray-800 font-medium rounded-lg shadow-sm border border-gray-300/50 transition duration-150 hover:bg-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
            >
              Google
            </button>
          </form>

          <div className="text-center">
            <Link
              to="/register"
              className="text-sm text-gray-600 hover:text-blue-800 transition duration-150"
            >
              {lang("login.register")}
            </Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (success) {
            if (isAdmin) {
              navigate("/panel/admin");
            } else {
              navigate("/panel/me");
            }
          }
        }}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
}
