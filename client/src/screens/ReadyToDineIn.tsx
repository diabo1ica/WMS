import { backendApi } from "@/assets/backend";
import Input from "@/component/Input";
import CTAButton from "@/component/CTAButton";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ReadyToDineIn = () => {
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState<string|undefined>()
  const [location, setLocation] = useState<string|undefined>()
  
  const [couldntFindRestaurant, setCouldntFindRestaurant] = useState(false)
  
  /* 
    on mount check
    if (current sesssion exists && there is an order instance associated with it)
  */
  useEffect(() => {
    fetch(`${backendApi}/api/customer/`, {
      credentials: 'include',
      method: 'GET'
    })
    .then(response => {
      if (response.status === 200) {
        navigate('/customermenu')
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // check if valid response
    await fetch(`${backendApi}/api/valid-restaurant/?name=${restaurant}&location=${location}`, {
      method: 'GET'
    })
    .then(response => {
      if (response.status === 200) {
        // get the restaurant id
        return response.json()
      } else {
        throw new Error("Expected a valid restauarant")
      }
    })
    .then(data => {
      localStorage.setItem('restaurant_id', data.restaurant_id)
      navigate('/tablenumber')
    })
    .catch(() => setCouldntFindRestaurant(true))
  }
  return (
		<div className="flex flex-col justify-center items-center h-screen w-screen">
        <section className="w-auto h-auto border-slate-300 border-[1px] p-10 rounded-lg">
          <section className="flex flex-col justify-center place-items-center">
            <h1 className="font-bold text-3xl text-gray-900 leading-relaxed">Ready to dine in?</h1>
            <h2 className="font-bold text-xl text-gray-900 mb-5">Please choose a restaurant and its location</h2>
          </section>
          
          <form className="space-y-6 w-[400px]">
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Restaurant
              </label>
              <div className="mt-2">
                <Input type="text" required={true} onChange={(e) => {setRestaurant(e.target.value)}}></Input>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Location
              </label>
              <div className="mt-2">
                <Input type="text" required={true} onChange={(e) => {setLocation(e.target.value)}}></Input>
              </div>
            </div>
            {couldntFindRestaurant && <p className="text-red-500">We could not find that restaurant at that location.</p>}
            <div>
              <CTAButton type="submit" text="Submit" callback={handleSubmit}></CTAButton>
            </div>
          </form>
        </section>
				
    </div>
  )

}
export default ReadyToDineIn;