import { backendApi } from "@/assets/backend";
import { ChangeEvent, FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import staff from '@/assets/staff.jpeg';
import CTAButton from "@/component/CTAButton";

const AddStaff: React.FC = () => {
  const navigate = useNavigate()
  const { state } = useLocation()

  const [email, setEmail] = useState<undefined|string>();
  const [password, setPassword] = useState<undefined|string>();
  const [passwordConfirm, setPasswordConfirm] = useState<undefined|string>();

  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<undefined|string>();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }
  const handlePasswordConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(e.target.value)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('submit')
    if (!email || !password || !passwordConfirm) {
      setError(true)
      setErrorMsg('Please fill in all the fields.')
      return;
    }
    if (!validateEmail(email)) {
      setError(true);
      setErrorMsg('Invalid email!');
      return
    }
    if (!checkPassword(password, passwordConfirm)) {
      setError(true);
      setErrorMsg('Passwords are not the same!');
      return;
    }

    if (!isPasswordStrong(password)) {
      setError(true);
      setErrorMsg("Password doesn't fit the security requirements.");
      return
    }

    fetch(`${backendApi}/api/staffregister/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        user_role: state.role
      })
    })
    .then(response => {
      if (response.status === 400 || response.status === 401) {
        alert("You are not a manager")
      } else if (response.status === 200) {
        navigate(-1)
      }
    })
  }

  return (
    <div 
      style={{ 
        backgroundImage: `url(${staff})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }} 
      className="h-screen w-full flex justify-center"
    >
      <section className="bg-white w-[450px] flex flex-col justify-center px-0 py-8 my-auto rounded-xl">
        <div className="sm:mx-auto sm:w-90">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create a {state.role} account
          </h2>
        </div>
        {/* actual from */}
        <div className="mt-5">
          <form className="mx-10" onSubmit={handleSubmit}>
            <div className="mt-2 mb-4">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <Input type="email" required={true} onChange={handleEmailChange}/>
            </div>

            <div className='mt-2 text-xs'>
              <p>Please ensure your password is:</p>
              <div className='columns-2'>
                <ul className='list-disc ml-5'>
                  <li>at least 8 characters</li>
                  <li>has one lower case letter</li>
                </ul>
                <ul className='list-disc ml-5'>
                  <li>has one upper case letter</li>
                  <li>has one digit</li>
                  <li>has one special character</li>
                </ul>
              </div>
            </div>

            <div className="mt-2 mb-4">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <Input type="password" required={true} onChange={handlePasswordChange}/>
            </div>

            <div className="mt-2">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Confirm Password
              </label>
              <Input type="password" required={true} onChange={handlePasswordConfirmChange}/>
            </div>
            {error && <div className="text-red-500">{errorMsg}</div>}

            <div>
              <CTAButton type="submit" text="Sign Up" callback={handleSubmit}/>
            </div>
          </form>
        </div>
      </section>
    
    </div>
  )
}

const checkPassword = (p1: string, p2: string) => {
  return (p1 === p2);
}

const isPasswordStrong = (password: string) => {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) 
}

export function validateEmail(email: string) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export default AddStaff;