import { useMediaQuery } from '@mui/material';
import { Button } from '@/components/ui/button';

import MenuIcon from '@mui/icons-material/Menu';

import Lottie from 'lottie-react';
import PandaAnimation from '@/assets/PandaAnimation.json';

import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
	const matches = useMediaQuery('(min-width:800px)');
	const navigate = useNavigate();

	return (
		<div className="bg-white-200 flex justify-between my-auto bg-transparent w-full px-10 h-[80px] overflow-x-hidden">
      {/* logo */}
      {matches ? <>
        <section className="flex gap-10">
          <Lottie onClick={() => navigate('/readytodinein')} className="button-navbar hover:cursor-pointer w-[50px] h-[50px] my-auto" animationData={PandaAnimation} loop={true} />
          <section className="flex gap-20">
            <button onClick={() => navigate('/')} className="text-black navbar-component">Home</button>
          </section>
        </section>
        
        {/* the rest */}
        <section className="flex my-auto">
          <Button className="hover:bg-white hover:text-black hover:border hover:border-black button-navbar" onClick={() => navigate('/readytodinein')}>Start Dining Here!</Button>
        </section>
      </> :
      <>
        <section className="flex gap-10">
          <Lottie className="w-[50px] h-[50px] my-auto" animationData={PandaAnimation} loop={true} />
          
        </section>
        <DropdownMenu>
          <DropdownMenuTrigger><MenuIcon className="my-auto"/></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/')}>Home</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/features')}>Features</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/about')}>About Us</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/help')}>Help and Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          
        {/* the rest */}
        
      </>}
			
			
		</div>
	)
}

export default Navbar;