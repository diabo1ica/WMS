import { backendApi } from '@/assets/backend';
import React, { useState } from 'react';
import pic1 from '@/assets/pic-2.jpeg';
import Input from '@/component/Input';
import CTAButton from '@/component/CTAButton';
import { MouseEventHandler } from 'react';

import { useNavigate} from 'react-router-dom';
import ErrorHandler from '@/Error';

export function validateEmail(email: string) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

export default function Example() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [restaurantName, setRestaurantName] = useState('');
  const [location, setLocation] = useState('');

  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }
  const handleRestaurantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestaurantName(e.target.value);
  }
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  }
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  }

  const handleSignUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !restaurantName || !location) {
      setError(true)
      setErrorMsg('Please fill in all the fields.')
      return;
    }
    if (!checkPassword(password, confirmPassword)) {
      setError(true);
      setErrorMsg('Passwords are not the same!');
      return;
    }
    if (!validateEmail(email)) {
      setError(true);
      setErrorMsg('Invalid email!');
      return
    }

    if (!isPasswordStrong(password)) {
      setError(true);
      setErrorMsg("Password doesn't fit the security requirements.");
      return
    }

    try {
      const response = await fetch(`${backendApi}/api/register/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'email': email,
          'password': password,
          'name': restaurantName,
          'location': location,
          'table_numbers': {},
        })
      })

      //  location, name, restaurantId, token
      if (response.status === 400) {
        setError(true)
        setErrorMsg('There was an error with your registration, please check that you are not using the same email as an existing user.')
        return;
      } else if (response.status === 201) {
        const data = await response.json()
        console.log(data);
        const token = data.token;
        localStorage.setItem('token', token)
        navigate('/manager');
      }
    } catch (error) {
      setError(true);
      ErrorHandler(error);
    }
  }

  const handleSignIn: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    navigate('/signin');
  }

  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <div 
      style={{ 
        backgroundImage: `url(${pic1})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }} 
      className="h-screen w-full flex justify-center"
    >
      <section className="bg-white w-[450px] flex flex-col justify-center px-0 py-8 my-auto rounded-xl">
        <div className="sm:mx-auto sm:w-90">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create an account
          </h2>
        </div>
        {/* actual from */}
        <div className="mt-5">
          <form className="mx-10" onSubmit={handleSignUpSubmit}>
            <div className="mt-2 mb-4">
              <div className="w-full flex justify-between">
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                
              </div>
              
              <Input type="email" required={true} onChange={handleEmailChange}/>
            </div>

            <div className="mt-2 mb-4">
              <label htmlFor="" className="block text-sm font-medium leading-6 text-gray-900">
                Restaurant Name
              </label>
              <Input type="text" required={true} onChange={handleRestaurantNameChange}/>
            </div>

            <div className="mt-2 mb-4">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Restaurant Location
              </label>
              <Input type="text" required={true} onChange={handleLocationChange}/>
            </div>

            <div className={`${showHelp ? 'inline-block' : 'hidden'} mt-2 text-xs`}>
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
              <div className="flex w-full justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <button onClick={() => setShowHelp(!showHelp)} className="bg-blue-200 text-[13px] h-[20px] rounded-[100px] px-2 mb-[1px]">?</button>
              </div>
              
              <Input type="password" required={true} onChange={handlePasswordChange}/>
            </div>

            <div className="mt-2">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Confirm Password
              </label>
              <Input type="password" required={true} onChange={handleConfirmPasswordChange}/>
            </div>
            {error && <div className="text-red-500">{errorMsg}</div>}

            <div>
              <CTAButton type="submit" text="Sign Up" callback={handleSignUpSubmit}/>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <a onClick={handleSignIn} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 cursor-pointer">
              Sign In
            </a>
          </p>
        </div>
      </section>
    
    </div>
  )
}

const checkPassword = (p1: string, p2: string) => {
  return (p1 === p2);
}

const isPasswordStrong = (password: string) => {
  // return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) 
}