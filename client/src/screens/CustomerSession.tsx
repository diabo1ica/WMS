import { backendApi } from "@/assets/backend";
import { useEffect, useState } from "react";

const CustomerSession = () => {
  
  const [msg, setMsg] = useState()
  useEffect(() => {
    console.log('after mounting effect')
    fetch(`${backendApi}/api/testing/`, {
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      setMsg(data.status)
    })
  }, [])

  return (
    <>
      <p>Here should be the message</p>
      {msg}
    </>
  )
}
export default CustomerSession;