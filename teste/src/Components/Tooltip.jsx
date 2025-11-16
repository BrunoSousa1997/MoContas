// src/components/Tooltip.jsx
import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";

export default function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <Transition
        as={Fragment}
        show={show}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div className="absolute z-10 bg-gray-800 text-white text-xs rounded px-2 py-1 bottom-full mb-1 whitespace-nowrap shadow-lg">
          {text}
        </div>
      </Transition>
    </div>
  );
}
