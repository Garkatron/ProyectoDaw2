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
      const response = await login(result.data.email, result.data.password);

      if (response.success) {
        setModalTitle(lang("login.success_title"));
        setModalMessage(lang("login.success_message"));
        setSuccess(true);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-gray-50 p-10 rounded-xl border border-gray-200 space-y-8">
        <header className="flex flex-col items-center space-y-2">
          <img
            src={logo}
            alt="Limpora Logo"
            className="w-28 h-28 object-contain"
          />
          <h1 className="text-3xl font-light text-gray-700">{lang("login.title")}</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {lang("login.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className="w-full p-4 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {lang("login.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-300 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="w-full p-3 bg-gray-100 text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-200 transition"
            >
              {lang("login.submit")}
            </button>
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full p-3 bg-gray-100 text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-200 transition"
            >
              Google
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/register"
            className="text-sm text-gray-600 hover:text-blue-800 transition"
          >
            {lang("login.register")}
          </Link>
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