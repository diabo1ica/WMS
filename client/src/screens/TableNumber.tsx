import { backendApi } from "@/assets/backend";
import Input from "@/component/Input";
import CTAButton from "@/component/CTAButton";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const TableNumber = () => {
  const navigate = useNavigate()
  const [tableNumber, setTableNumber] = useState<string|undefined>()
  const [tableIsTaken, setTableIsTaken] = useState<boolean|undefined>()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTableNumber(e.target.value)
  }

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    fetch(`${backendApi}/api/customer/`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table_number: tableNumber,
        restaurant: localStorage.getItem('restaurant_id')
      })
    })
    .then(response => {
      if (response.status === 200 || response.status === 201) {
        localStorage.removeItem('restaurant_id')
        navigate('/customermenu')
      } else if (response.status === 409) {
        setTableIsTaken(true)
      } else {
        throw Error('Something went wrong.')
      }
    })
    .catch(e => {
      alert(e)
    })
  }

  return (
		<div className="flex flex-col justify-center items-center h-screen w-screen">
        <section className="border-[1px] border-slate-300 flex flex-col justify-center place-items-center p-5 rounded-lg">
          <h1 className="px-2 font-bold text-2xl text-gray-900 leading-relaxed">Please enter your table number</h1>
          <form className="px-6 w-[400px] space-y-6">
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Table Number
              </label>
              <div className="mt-2">
                <Input type="number" required={true} onChange={handleChange}></Input>
              </div>
            </div>
            {tableIsTaken && <span className="text-red-500">Sorry but that table is taken.</span>}
            <div>
              <CTAButton type="submit" text="Submit" callback={handleSubmit}></CTAButton>
            </div>
          </form>
        </section>
    </div>
  )

}
export default TableNumber;