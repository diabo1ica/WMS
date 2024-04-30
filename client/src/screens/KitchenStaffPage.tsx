import { backendApi } from "@/assets/backend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YourMenu from "./ManagerMenu";
import YourOrder from "./ManagerOrder";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import Logo from '@/assets/logo.json';
import Lottie from 'lottie-react';

const ManagerPage = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${backendApi}/api/logout/`, {
        method: "POST",
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      })
      if (response.status === 200) {
        localStorage.removeItem('token')
        navigate('/');
      } else if (response.status === 401) {
        alert('You are not logged in.')
        navigate('/');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        alert('Sorry the backend server is down at the moment.')
      }
    }
  }
  return (
    <div className="py-3 px-5 h-screen no-cursor">
      <div className="justify-between relative w-full">
        <Tabs 
          style={{ height: 'calc(100vh - 100px)' }} 
          defaultValue="Your menu" className="" 
        >
        
        {/* manager navbar */}
        <div className="mb-[10px] px-5 flex my-auto place-items-center justify-between top-0 h-[70px] w-full no-select">
          <section className="flex my-auto justify-center place-items-center">
            <div className="text-2xl font-bold flex place-items-center">
              <Lottie className="h-[50px] my-auto" animationData={Logo} loop={true} />
              QUENIFY
            </div>
            <div className="text-2xl">
              MAGIC
          </div>
          </section>
          
          <TabsList className="bg-gray-300 rounded-[30px]">
            <TabsTrigger value="Your menu">Menu</TabsTrigger>
            <TabsTrigger value="QR codes">Orders</TabsTrigger>
          </TabsList>
         <Button className="" onClick={handleLogout}>Logout</Button>
        </div>

        <section className="h-full pb-3 no-select outline-none">
          <TabsContent className="" value="Your menu"><YourMenu/></TabsContent>
          <TabsContent className="h-full overflow-hidden" value="QR codes"><YourOrder /></TabsContent>
        </section>

        
      </Tabs> 
      </div>
      
    </div>
  )
}
export default ManagerPage;