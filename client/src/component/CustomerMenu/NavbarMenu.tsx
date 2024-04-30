import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, useMediaQuery } from '@mui/material';
import { Button } from '@/components/ui/button';

import CartItemComponent from '@/component/CustomerMenu/CartItemComponent';
import OrderItemComponent from '@/component/CustomerMenu/OrderItemComponent';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Lottie from 'lottie-react';
import PandaAnimation from '@/assets/PandaAnimation.json';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const Navbar = () => {
	const matches = useMediaQuery('(min-width:800px)');
	const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);
  const [cartOpen, setCartOpen] = useState<boolean>(false);

	return (
		<Box 
      className="bg-transparent flex justify-between my-auto w-full px-10 h-[80px] top-0 z-50"
    >
      {/* logo */}
      <section className="flex gap-10">
          {/* Resto icon */}
          <Lottie onClick={() => navigate('/readytodinein')} className="hover:cursor-pointer w-[50px] h-[50px] my-auto" animationData={PandaAnimation} loop={true} />
          <section className="flex my-auto">
            <div className='font-bold text-2xl'>QUENIFY</div>
            <div className="text-2xl">MAGIC</div>
          </section>
      </section>
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          {/* the rest */}
        <section className="flex bg-none my-auto gap-10">
          {/* <SearchBar /> */}
          <SheetTrigger>
          <Button onClick={() => setCartOpen(true)} className={`${cartOpen ? 'hidden' : 'fixed top-5 right-5 z-[100] rounded-[30px] hover:bg-white hover:text-black hover:border hover:border-black flex gap-2' }`}>
            {matches ? 
              <>
                <ShoppingCartIcon />Cart
              </> : 
              <>
                <ShoppingCartIcon />
              </>}
          </Button>
          </SheetTrigger>
            
            <SheetContent className="overflow-y-auto h-auto">
              <SheetHeader>
                <SheetTitle>Cart</SheetTitle>
                <SheetDescription> 
                  <CartItemComponent setOrderPlaced={setOrderPlaced}/>
                </SheetDescription>
              </SheetHeader>
              <SheetHeader className='mt-7'>
                <SheetTitle>View Order</SheetTitle>
                <SheetDescription> 
                  <OrderItemComponent orderPlaced={orderPlaced} setOrderPlaced={setOrderPlaced}/>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </section>
        </Sheet>
      </Box>
	)
}

export default Navbar;