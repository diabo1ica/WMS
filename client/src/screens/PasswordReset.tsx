import React, { useState } from 'react';
import pic1 from '@/assets/pic-1.jpeg';
import Input from '@/component/Input';
import CTAButton from '@/component/CTAButton';

import {passwordReset} from '@/api/ResetPasswordAjax';
import { validateEmail } from './SignUp';

import Lottie from 'lottie-react';
import PhoneAnimation from '@/assets/PhoneAnimation.json';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false); 

    const handleSendEmail = async(e: { preventDefault: () => void; }) => {
      e.preventDefault();
      setLoading(true);
      try {
        await fetchRequestReset();
      } finally {
          setLoading(false);
      }
    }
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const fetchRequestReset = async() => {
      try {
        // if email is invalid or empty
        if (email === '' || !validateEmail(email)) {
          setError(true);
          setErrorMsg('Invalid email!');
          return; 
        }
        const res = await passwordReset(email);
        console.log(email);
        if (res.ok) {
          setEmailSent(true);
          const response = await res.json();
          return response;
        } else {
          throw new Error('Failed to send email')
        }
      } catch (error) {
        setError(true);
        setErrorMsg('Please enter registered email');
        setEmailSent(false);
      }
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
          <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
            Password Recovery
          </h2>
          {emailSent ? (
            <div>
              <div className='flex flex-row justify-center mt-5'>
                <CheckCircleIcon className='text-green-600'/><p className="text-center text-green-600 ml-1 text-xl">Email sent</p>
              </div>
              <p className="text-center mt-3 text-l">Please check the link within the email and reset password there.</p>
            </div>
          ) : (
            <p className="text-center text-l">You will receive an email once submit the form.</p>
          )}
        </div>
        
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {!emailSent && (
          <form className="space-y-6" onSubmit={handleSendEmail}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <Input type="email" required={true} onChange={handleEmailChange}></Input>
              </div>
            </div>
            {error && <div className="text-red-500">{errorMsg}</div>}
            {loading ? ( <div className='flex justify-center place-items-center m-2'>LOADING...</div>
              ):(
              <div>
                <CTAButton type="submit" text="Submit" callback={handleSendEmail}></CTAButton>
              </div>
              )}
          </form>
        )}
        </div>
      </section>
      <section className="w-1/2 hidden sm:inline-block">
        <img className="h-screen w-screen" src={pic1} />
      </section>
    </div>
    )
}


export default PasswordReset;