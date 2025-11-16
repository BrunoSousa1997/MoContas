// src/pages/LoginPage.jsx
import { useContext, useState } from "react";
import { TranslationContext } from "../../Components/TranslationContext/TranslationContext";
import PasswordInput from "../../Components/PasswordInput/PasswordInput";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Components/UserContext/UserContext";
export default function LoginPage({ onLogin ,darkMode, setDarkMode}) {

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { t } = useContext(TranslationContext);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate(); // Para redirecionamento
 // Pega o setUser do contexto
  const { setUser } = useContext(UserContext);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_ROUTE}/User/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t.loginError);
      }

      // Salva token
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id); // <--- salvar ID
      setUser({ token: data.token, id: data.id });

      // Atualiza estado do usuário
      if (onLogin) onLogin(data); // <-- CORRIGIDO

    } catch (err) {
      setError(err.message);
    }
  };


  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6">
          {t.loginTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.email}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder={t.emailPlaceholder}
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Password */}
          <PasswordInput
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={t.passwordPlaceholder || "********"}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          {/* Error */}
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
          >
            {t.loginButton}
          </button>
        </form>

        {/* Register link */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center">
          {t.noAccount}{" "}
          <a href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
            {t.registerHere}
          </a>
        </p>
      </div>
    </div>
  );
}
