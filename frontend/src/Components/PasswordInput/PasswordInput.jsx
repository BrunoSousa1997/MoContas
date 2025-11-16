import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
export default function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 pr-10 
               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
               focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 
               text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        onClick={() => setShow(!show)}
      >
        {show ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
      </button>
    </div>
  );
}
