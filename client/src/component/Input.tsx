import React from "react";

interface InputFunctionalityParameters {
  type: string,
  required: boolean,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputFunctionalityParameters> = ({type, required, onChange}) => {
  return (
  <input
    name="email"
    type={type}
    required={required}
    className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
    onChange={onChange}
  />
  )
}

export default Input;