import { backendApi } from '@/assets/backend';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@mui/material';

import NavbarMenu from '@/component/CustomerMenu/NavbarMenu';
import Sidebar from '@/component/CustomerMenu/Sidebar';
import Category from '@/component/CustomerMenu/CategoryComponent';

import { customerPostAssistanceRequest } from '@/api/AssistanceAjax';

import CartProvider from '@/component/CustomerMenu/CartContext';
import Dialog from '@/component/AssistanceModal';
import BackHandIcon from '@mui/icons-material/BackHand';

// import pic1 from '@/assets/restaurant-illustration-2.jpeg';

interface MenuProp {
  isForManager: boolean
}

const Menu: React.FC<MenuProp> = ({ isForManager }) => {
	// const imageRef = useRef<HTMLDivElement>(null);
	const [sidebarFixed, setSidebarFixed] = useState(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string|undefined>();

	const matches = useMediaQuery('(min-width:990px)');
  const mobileScreen = useMediaQuery('(max-width:700px)');

  const closeModal = () => setIsOpen(false);

  const openModal = () => {
    setIsOpen(true)
    customerPostAssistanceRequest()
    .then(response => {
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("The attempt to request assistance didn't work")
      }
    })
    .catch(error => {
      alert(error)
    })
  };

	useEffect(() => {
    const navbarHeight = 100; // Fixed navbar height is 100px
    const handleScroll = () => {
      const currentPosition = window.scrollY;
      setSidebarFixed(currentPosition > navbarHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // after mount fetch the restaurant details (name and location) to render
  useEffect(() => {
    const fetchRestaurantDetails = isForManager ? () => {
      return fetch(`${backendApi}/api/restaurant_details/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`
        }
      })
    } : () => {
      return fetch(`${backendApi}/api/restaurant_details/`, {
        method: 'GET',
        credentials: 'include'
      })
    }

    fetchRestaurantDetails()
    .then(response => {
      return response.json()
    })
    .then(data => {
      setName(data.name)
    })
    .catch(err => console.error(err))

  }, [])
  return (
    <CartProvider>
      {!isForManager ? <NavbarMenu /> : <></>}
      <section className={`${isForManager ? 'border border-slate-200 p-5 rounded-lg no-select' : 'p-5 '} bg-white`}>
        <Dialog isOpen={isOpen} openModal={openModal} closeModal={closeModal} />
        <div
          className={`${isForManager ? 'hidden' : 'z-[20] hover:cursor-pointer fixed bottom-10 right-10 rounded-[100%] bg-red-500 p-5'}`}
          onClick={openModal}
        >
          <BackHandIcon />
        </div>

        {/* another main section to store sidebar and items */}
        <section className={`h-auto ${!isForManager ? 'flex' : ''} w-full gap-5`}>
          {/* sidebar */}
          {matches && 
            <section className={`${!isForManager ? '' : 'w-[450px]'} mt-2  flex flex-col ${sidebarFixed && matches ? 'fixed top-0' : ''}`}>
              {!isForManager && 
                <div className="bg-white w-full flex flex-start text-4xl font-bold mb-5">
                  {name}
                </div>
              }
              {!isForManager && <Sidebar isForManager={isForManager}/>}
              
            </section>}
          
          {/* menu items */}
          <section className={`${mobileScreen ? 'px-0' : 'px-5'} ${sidebarFixed && matches && !isForManager ? 'ml-[320px]' : ''} overflow-x-hidden`}>
            <section className="w-full">
              <Category isForManager={isForManager}/>
            </section>
          </section>
        </section>

      </section>
    </CartProvider>
  );
}

export default Menu;