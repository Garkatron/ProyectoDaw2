import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendVerifycationCode, sendVerifycationEmail } from "../../services/email.service";
import { Modal } from "../../components/Modal";
import logo from "../../assets/logo-provisional.png";
import { useAuthStore } from "../../stores/auth.store";
import lang from "../../utils/LangManager";

export default function EmailCode() {
  const [code, setCode] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await sendVerifycationCode(code);

      if (result) {
        setModalTitle(lang("verification.success_title") || "Éxito");
        setModalMessage(lang("verification.success_message") || "Código verificado correctamente");
        setSuccess(true);
      } else {
        setModalTitle(lang("verification.error_title") || "Error");
        setModalMessage(lang("verification.error_message") || "Código inválido o expirado");
      }

      setModalOpen(true);
    } catch (err) {
      setModalTitle(lang("verification.error_title") || "Error");
      setModalMessage(err.message || "Error al verificar el código");
      setModalOpen(true);
    }
  };

  const resendCode = async () => {
    try {
      await sendVerifycationEmail(user.id, user.email);
      setModalTitle(lang("verification.resent_title") || "Código reenviado");
      setModalMessage(lang("verification.resent_message") || "Se ha enviado un nuevo código a tu correo");
      setModalOpen(true);
    } catch (err) {
      setModalTitle(lang("verification.error_title") || "Error");
      setModalMessage(err.message || "No se pudo reenviar el código");
      setModalOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl shadow-gray-200 border border-gray-300/20 space-y-6">
        <header className="flex flex-col items-center">
          <img
            src={logo}
            alt="Logo"
            className="w-32 h-32 object-contain flex-shrink-0"
          />
          <h1 className="text-2xl font-light text-gray-800">
            {lang("verification.title") || "Verifica tu email"}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {lang("verification.subtitle") || "Ingresa el código enviado a tu correo"}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {lang("verification.code") || "Código"}
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              className="w-full p-3 border border-gray-300/50 rounded-md shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400/50 transition duration-150"
              placeholder="123456"
              onChange={(e) => setCode(e.target.value)}
              value={code}
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-gray-100 text-gray-800 font-medium rounded-lg shadow-sm border border-gray-300/50 transition duration-150 hover:bg-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
          >
            {lang("verification.submit") || "Verificar"}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={resendCode}
            className="text-sm text-gray-600 hover:text-blue-800 transition duration-150"
          >
            {lang("verification.resend") || "Reenviar código"}
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (success) navigate("/panel/me");
        }}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
}
