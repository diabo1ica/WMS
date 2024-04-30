import { backendApi } from '@/assets/backend';
import React, { useState } from 'react';
import pic1 from '@/assets/pic-1.jpeg';
import { useNavigate } from 'react-router-dom';
import Input from '@/component/Input';
import CTAButton from '@/component/CTAButton';
import { validateEmail } from './SignUp';

import { MouseEventHandler } from 'react';
import Lottie from 'lottie-react';
import PhoneAnimation from '@/assets/PhoneAnimation.json';

import ErrorHandler from '@/Error';

export default function Example() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }

  const handleSignInSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError(true);
      setErrorMsg('Invalid email!');
      return
    } 
    if (!email || !password) {
      setError(true);
      setErrorMsg("Please fill in all the fields.");
      return;
    }
    try {
      const response = await fetch(`${backendApi}/api/login/`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'username': email,
          'password': password,
        })
      })
      if (response.status === 401) {
        setError(true)
        setErrorMsg('Invalid credentials')
        return;
      } else if (response.status === 200) {
        const data = await response.json()
        console.log(data);
        const token = data.token;
        const role = data.role;
        localStorage.setItem('token', token)

        if (role === 'manager') {
          navigate('/manager');
        } else if (role === 'Wait') {
          navigate('/waitstaff')
        } else if (role === 'Kitchen') {
          navigate('/kitchenstaff')
        } else {
          alert('Cannot identify your role')
        }
      } else {
        setError(true)
        setErrorMsg('Something went wrong')
        return;
      }
    } catch (error) {
      setError(true);
      ErrorHandler(error);
    }
  }

  const handleForgotPassword: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    navigate('/passwordreset');
  }
  
  const handleSignUp: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    navigate('/signup');
  }

  return (
    <div className="flex w-full">
      <section 
        className="sm:bg-[url(`${pic1}`)] flex w-full lg:w-1/2 first-line:flex-1 flex-col justify-center px-6 py-12 lg:px-8 h-screen sm:w-full"
      >
        <section>
          <Lottie className="my-auto h-[200px]" animationData={PhoneAnimation} loop={true} />
        </section>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSignInSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <Input type="email" required={true} onChange={handleEmailChange}></Input>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a onClick={handleForgotPassword} className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <Input type="password" required={true} onChange={handlePasswordChange}/>
              </div>
              {error && <div className="text-red-500">{errorMsg}</div>}
            </div>

            <div>
              <CTAButton type="submit" text="Sign In" callback={handleSignInSubmit}></CTAButton>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Do not have an account yet?{' '}
            <a onClick={handleSignUp} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 cursor-pointer">
              Sign Up
            </a>
          </p>
        </div>
      </section>
      <section className="w-1/2 hidden sm:inline-block">
        <img className="h-screen w-screen" src={pic1} />
      </section>
    </div>
  )
}
