// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "./Components/Layout/Layout";
import HomePage from './pages/HomePage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import { translations } from "./translations";
import { UserContext } from "./Components/UserContext/UserContext";
import { TranslationContext } from './Components/TranslationContext/TranslationContext';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    return token && userId ? { token, id: userId } : null;
  });
    const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  function handleLogin(newUser) {
    localStorage.setItem("token", newUser.token);
    localStorage.setItem("userId", newUser.id);
    setUser(newUser);
  }
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  }
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      setUser({ token, id: userId });
    }
  }, []);
    useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);
  const [lang, setLang] = useState("pt");
  const t = translations[lang];

  return (
    <Router>
      <TranslationContext.Provider value={{ lang, t: translations[lang], setLang }}>
        <UserContext.Provider value={{ user, setUser }}>
          <Layout lang={lang} setLang={setLang} t={t} onLogout={handleLogout} user={user} darkMode={darkMode} setDarkMode={setDarkMode}>
            <Routes>
              {/* Página principal do usuário: só acessível se logado */}
              <Route
                path="/"
                element={user ? <HomePage lang={lang} setLang={setLang} t={t} darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />}
              />

              {/* Login: redireciona para dashboard se já logado */}
              <Route
                path="/login"
                element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} lang={lang} />}
              />

              {/* Registro: redireciona para dashboard se já logado */}
              <Route
                path="/register"
                element={user ? <Navigate to="/" /> : <RegisterPage onRegister={setUser} lang={lang} />}
              />

              {/* Qualquer outra rota vai para "/" */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </UserContext.Provider>
      </TranslationContext.Provider>
    </Router>
  );
}

export default App;
