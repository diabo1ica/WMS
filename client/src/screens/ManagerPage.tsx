import { backendApi } from "@/assets/backend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YourStaff from "./ManagerStaff";
import YourMenu from "./ManagerMenu";
import YourTable from "./ManagerTable";
import YourOrder from "./ManagerOrder";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import Logo from '@/assets/logo.json';
import Lottie from 'lottie-react';

import { useMediaQuery } from '@mui/material';


import { useContext } from 'react';
import { SearchContext } from '@/UseContext';

const ManagerPage = () => {
  const { currentManagerTableTabFocused, setCurrentManagerTableTabFocused } = useContext(SearchContext);

  const navigate = useNavigate();

  const mobile = useMediaQuery('(max-width:700px)');
  const bigScreen = useMediaQuery('(min-width:701px)');

  const handleTabChange = (e: string) => {
    setCurrentManagerTableTabFocused(e);
    console.log(currentManagerTableTabFocused);
  };

  const handleCredential = async () => {
    try {
      const response = await fetch(`${backendApi}/api/logout/`, {
        method: "POST",
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      })
      if (response.status === 200) {
        localStorage.removeItem('token')
        navigate('/signin');
      } else if (response.status === 401) {
        navigate('/signin');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        alert('Sorry the backend server is down at the moment.')
      }
    }
  }
  return (
    <div className="py-3 px-5 h-screen no-cursor overflow-hidden bg-[#f3f4f5]">
      <div className={`justify-between relative w-full`}>
        <Tabs 
          style={{ height: bigScreen ? 'calc(100vh - 100px)' : 'calc(100vh - 150px)' }} 
          defaultValue={currentManagerTableTabFocused} className="" 
        >
          {mobile &&
            <section className="flex my-auto justify-center place-items-center">
              <div className="text-2xl font-bold flex place-items-center">
                <Lottie className="h-[50px] my-auto" animationData={Logo} loop={true} />
                QUENIFY
              </div>
              <div className="text-2xl">
                MAGIC
              </div>
              
            </section>
            
          }
        
        {/* manager navbar */}
        <div className="mb-[10px] px-5 flex my-auto place-items-center justify-between top-0 h-[70px] w-full no-select">
          {/* name */}
          {bigScreen &&
            <section className="flex my-auto justify-center place-items-center">
              <div className="text-2xl font-bold flex place-items-center">
                <Lottie className="h-[50px] my-auto" animationData={Logo} loop={true} />
                QUENIFY
              </div>
              <div className="text-2xl">
                MAGIC
              </div>
            </section>
          }
          
          <TabsList className="bg-gray-300 rounded-[30px]">
            <TabsTrigger onClick={() => handleTabChange("Your Menu")} value="Your menu">Menu</TabsTrigger>
            <TabsTrigger onClick={() => handleTabChange("Your staff")} value="Your staff">Staff</TabsTrigger>
            <TabsTrigger onClick={() => handleTabChange("Your tables")} value="Your tables">Tables</TabsTrigger>
            <TabsTrigger onClick={() => handleTabChange("QR codes")} value="QR codes">Orders</TabsTrigger>
          </TabsList>
         <Button className="" onClick={handleCredential}>{localStorage.getItem('token') ? 'Log out' : 'Sign in'}</Button>
        </div>

        <section className="h-full pb-3 no-select outline-none overflow-x-hidden">
          <TabsContent className="h-screen" value="Your menu"><YourMenu/></TabsContent>
          <TabsContent className="" value="Your staff"><YourStaff/></TabsContent>
          <TabsContent className="h-auto overflow-hidden" value="Your tables"><YourTable /></TabsContent>
          <TabsContent className="h-full overflow-hidden" value="QR codes"><YourOrder /></TabsContent>
        </section>

        
      </Tabs> 
      </div>
      
    </div>
  )
}
export default ManagerPage;