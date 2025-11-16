// Layout.js
import { useNavigate } from "react-router-dom";

export default function Layout({ children, lang, setLang, t, onLogout, user, darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove token e limpa usuário
    localStorage.removeItem("token");
    if (onLogout) onLogout(null);

    // Redireciona para login
    navigate("/login");
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t.appTitle}</h1>
          <div className="flex gap-2 items-center">
            {/* Linguagem */}
            <button
              onClick={() => setLang("pt")}
              className={`px-3 py-1 rounded ${
                lang === "pt"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
              }`}
            >
              PT
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded ${
                lang === "en"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"
              }`}
            >
              EN
            </button>

            {/* Botão Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {darkMode ? t.light : t.dark}
            </button>

            {/* Logout só se estiver logado */}
            {user && (
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                {t.logout || "Logout"}
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo das páginas */}
        {children}
      </div>
    </div>
  );
}
