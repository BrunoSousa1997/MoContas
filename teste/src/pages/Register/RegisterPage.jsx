// src/pages/RegisterPage.jsx
import { useContext, useState } from "react";
import { TranslationContext } from "../../Components/TranslationContext/TranslationContext";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../../Components/PasswordInput/PasswordInput";

export default function RegisterPage({ onRegister, lang = "pt", darkMode, setDarkMode }) {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { t } = useContext(TranslationContext);
    const navigate = useNavigate();
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`${process.env.REACT_APP_API_ROUTE}/User/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || t.registerError);

            localStorage.setItem("token", data.token);

            setSuccess(t.registerSuccess);
            toast.success(t.registerSuccess);

            if (onRegister) onRegister(data.user);

            // Redirect to login after short delay
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg w-full max-w-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6">
                    {t.registerTitle}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t.registerName}
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder={t.registerNamePlaceholder}
                            required
                            className="w-full border border-gray-300 dark:border-gray-600 
                     rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                     focus:outline-none"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t.registerEmail}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder={t.registerEmailPlaceholder}
                            required
                            className="w-full border border-gray-300 dark:border-gray-600 
                     rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                     focus:outline-none"
                        />
                    </div>

                    {/* Password */}
                    <PasswordInput
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder={t.passwordPlaceholder || "********"}
                    />

                    {/* Error & Success */}
                    {error && <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}
                    {success && <p className="text-green-600 dark:text-green-400 text-sm text-center">{success}</p>}

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                    >
                        {t.registerButton}
                    </button>
                </form>

                {/* Login link */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center">
                    {t.haveAccount}{" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                        {t.loginHere}
                    </a>
                </p>
            </div>
        </div>

    );
}
