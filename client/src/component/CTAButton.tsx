import React from "react";

interface CTAButtonParams {
  type: 'button' | 'submit' | 'reset'
  text: string

  callback: (event: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}
const CTAButton: React.FC<CTAButtonParams> = ({type, text, callback}) => {
  return (
    <button
      type={type}
      className="mt-4 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      onClick={callback}
    >
      {text}
    </button>
  )
}

export default CTAButton;