import { backendApi } from "@/assets/backend";

export const passwordReset = (email:string) => {
  const formData = new URLSearchParams();
  formData.append('email', email.toString()); 

    return fetch(`${backendApi}/api/password_reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })
};

export const invalidToken = (token:string) => {
  return fetch(`${backendApi}/api/invalid_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'token': token
      })
    })
}