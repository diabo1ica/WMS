import React from 'react';

import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect } from 'react'
import { Image } from '@chakra-ui/react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ItemAmount from '@/component/CustomerMenu/ItemAmount';
import { useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { useCart } from '@/component/CustomerMenu/CartContext';
import ClearIcon from '@mui/icons-material/Clear';

import { useContext } from 'react';
import { SearchContext } from '@/UseContext';

import { deleteMenuItem, patchMenuItem } from '@/api/MenuItemAjax';

import { Label } from "@/components/ui/label"
import { Select } from '@chakra-ui/react';

interface MyModalProps {
  uniqueKey: number;
  pk: number;
  name: string;
  price: number;
  description: string;
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  isManager:boolean;
  dietaryRequirement: "DF" | "GF" | "V" | "VG" | "",
  isPopular: boolean,
  minutes: number,
  image: string,
}

const MyModal = ({ isOpen, closeModal, uniqueKey, pk, image, name, description, price, isManager, dietaryRequirement, isPopular, minutes}: MyModalProps) => {
  const { refresh, setRefresh } = useContext(SearchContext);  
  const [amount, setAmount] = useState<number>(1);
  
  let addToCart: (arg0: { uniqueKey: number; pk:number; name: string; price: number; amount: number; }) => void;

  if (!isManager) {
    ({ addToCart } = useCart());
  }

  const deleteMenuItemApi = async () => {
    const token = localStorage.getItem('token');
    if (token === null) {
      console.log('fail to add category menu');
      throw new Error('Token is invalid!');
    }
    try {
      await deleteMenuItem(token, pk);
      console.log('delete working')
      setRefresh(!refresh);
    } catch (error) {
      console.log(error);
    }
  }

  const DROptions = [
    {
      name: 'Dairy Free',
      value: 'DF'
    },
    {
      name: 'Gluten Free',
      value: 'GF'
    },
    {
      name: 'Vegetarian',
      value: 'V',
    },
    {
      name: 'Vegan',
      value: 'VG',
    },
    {
      name: 'No Dietary Requirement',
      value: '',
    }
  ]

  const editMenuItemApi = async () => {
    const token = localStorage.getItem('token');
    if (token === null) {
      console.log('fail to add category menu');
      throw new Error('RestaurantId or Token or both are invalid!');
    }
    try {
      const response = await patchMenuItem(token, pk, 
        // update details
        {
          name: menuName,
          description: menuDescription,
          price: menuPrice.toString(),
          categoryId: uniqueKey, // category pk
          dietary_requirements: (menuDR as undefined | "DF" | "GF" | "V" | "VG"),
          preparation_time: menuPrepTime,
          popular: menuPopular
        }
      );
      console.log(response);
      setRefresh(!refresh);
    } catch (error) {
      console.log(error);
      throw new Error('Edit Menu Item Failed');
    }
  }
  
  const handleAddToCart = () => {
    const orderItem = {
      uniqueKey: uniqueKey,
      pk: pk,
      name: name,
      price: price,
      amount: amount
    };
    addToCart(orderItem);
  }
  
  const amountChange = (newAmount: number) => {
    setAmount(newAmount);
  };

  // const matches = useMediaQuery('(max-width: 640px)');
  const modalHorizontal = useMediaQuery('(min-width: 960px)');

  const [editMode, setEditMode] = useState<boolean>(false);

  const [menuName, setMenuName] = useState<string>(name);
  const [menuDescription, setMenuDescription] = useState<string>(description);
  const [menuPrice, setMenuPrice] = useState<number>(price);
  const [menuPrepTime, setMenuPrepTime] = useState<number>(minutes);
  const [menuPopular, setMenuPopular] = useState<boolean>(isPopular);
  const [menuDR, setMenuDR] = useState<"DF" | "GF" | "V" | "VG" | "">(dietaryRequirement);

  const handleMenuNameChange = (e: React.ChangeEvent<HTMLInputElement>) => (
    setMenuName(e.target.value)
  )

  const handleMenuDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => (
    setMenuDescription(e.target.value)
  )

  const handleMenuPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => (
    setMenuPrice(Number(e.target.value))
  )
  
  const handleMenuPrepTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => (
    setMenuPrepTime(Number(e.target.value))
  )

  const handleMenuPopularChange = () => {
    setMenuPopular(!menuPopular);
  }

  const handleMenuDRChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (['DF', 'GF', 'V', 'VG', ''].includes(event.target.value)) {
      setMenuDR(event.target.value as "" | "DF" | "GF" | "V" | "VG");
    }
  }

  const translateDR = (dietaryRequirement: "DF" | "GF" | "V" | "VG" | "") => {
    if (dietaryRequirement === 'DF') return 'Dairy Free';
    if (dietaryRequirement === 'GF') return 'Gluten Free';
    if (dietaryRequirement === 'VG') return 'Vegan';
    if (dietaryRequirement === 'V') return 'Vegetarian';
    return 'No Dietary Requirement';
  }

  useEffect(() => {
    // edit mode changed
  }, [editMode, refresh]);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" 
          onClose={() => {
            closeModal(); 
            setTimeout(() => {
              if (editMode) setEditMode(false);
            }, 200)
          }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto no-select">
            <div className="flex min-h-screen items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
              <div className={`bg-white flex overflow-hidden shadow-xl transition-all ${modalHorizontal ? 'h-[500px] w-[960px]' : 'h-[800px] w-[420px]'}  rounded-sm`}>
                <Dialog.Panel className={`w-full flex h-auto ${modalHorizontal ? 'h-full' : 'flex-col overflow-y-auto'} bg-white`}>

                  {/* image */}
                  <section className={`relative ${modalHorizontal ? 'w-1/2' : ''} bg-red-200 hover:cursor-pointer hover:bg-slate-100`} onClick={() => closeModal()}>
                    <div className={`bg-white absolute top-4 p-2 w-[40px] left-4 rounded-[1000px]`}><ClearIcon /></div>
                    <Image
                      objectFit='cover'
                      src={image}
                      alt='image of the menu item'
                      className={`h-full ${modalHorizontal ? 'w-full' : 'w-auto'}`}
                    />
                  </section>

                  {/* content */}
                  <section className={`${modalHorizontal ? 'w-1/2 h-full' : ''}`}>
                    <section className={`${isPopular ? 'items-start' : '' } p-7 flex flex-col h-[430px]`}>
                      {/* if popular */}
                      <section className={`${editMode ? 'mb-2 justify-right' : '' } w-full flex justify-between `}>
                        {isPopular && 
                          <div>
                            <div className="bg-[#e3e8fb] text-[#5a46c3] mb-3 text-[12px] w-[60px] h-[25px] grid place-items-center font-bold">Popular</div>
                          </div>
                        }

                      </section>
                      
                      <div className="mb-4 capitalize my-heading-lg w-full">
                        {editMode ? <input placeholder='name' value={menuName} onChange={handleMenuNameChange} className="border-[#095d44] border-[1px] p-1 rounded-lg w-full"></input> : `${name}`}
                      </div>

                      <div className="mb-4 text-inherit my-body-md flex flex-col items-start w-full">
                        {editMode ? <textarea value={menuDescription} onChange={(e) => handleMenuDescriptionChange(e)} rows={5} className="w-full border-[#095d44] border-[1px] p-1 rounded-lg"></textarea> : `${description}`}
                      </div>

                      {/* leave this for now until the add menu item DR has been fixed */}
                      <div className="mb-10 text-slate-500">
                        <div className="grid grid-cols-4 items-center gap-4">
                          {editMode ? 
                          <>
                          <Label htmlFor="name" className="text-right">
                          Dietary Req
                          </Label>
                          <Select style={{ fontSize: '14px' }} placeholder='Change dietary requirement' width='278px' onChange={handleMenuDRChange}>
                            {DROptions.map((item, index) => (
                              <option key={index} value={item?.value || ''}>{item.name}</option>
                            ))}
                          </Select>
                          </>
                           : `${dietaryRequirement && translateDR(dietaryRequirement)}`}
                        </div>
                      </div>

                      <section className="w-full flex justify-between">
                        <div className="font-bold">
                          {editMode ? <input placeholder='price' value={menuPrice} onChange={handleMenuPriceChange} className="w-full border-[#095d44] border-[1px] p-1 rounded-lg" /> : `$${price}`}
                        </div>
                        <div className="flex gap-1 place-items-center"><AccessTimeIcon/>
                        {editMode ? <input value={menuPrepTime} onChange={handleMenuPrepTimeChange} className="w-full border-[#095d44] border-[1px] p-1 rounded-lg" placeholder='prep time'></input> : `${minutes} minutes`}
                        </div>
                      </section> 

                      {editMode &&
                        <div className="w-full flex items-center justify-center mt-3">
                          <button 
                            className={`${!menuPopular ? 'bg-green-600 hover:bg-red-400' : 'bg-green-600 hover:bg-red-400' } text-white text-[14px] font-bold p-2 rounded-lg `}
                            onClick={() => {
                              handleMenuPopularChange()
                            }}
                          >
                            {menuPopular ? 'Mark as not popular' : 'Mark as popular'}
                          </button>
                        </div>
                      }
                    </section>
                    
                    <div className="border-slate-300 border-t-[1px] flex h-[70px] p-3 justify-evenly w-full gap-4">
                      {/* for MANAGER */}
                      {isManager ?
                        <button 
                          className="w-[35%] border-[2px] border-[#095d44] rounded-md" 
                          onClick={() => {
                            deleteMenuItemApi();
                            closeModal();
                          }}
                        >
                          Delete Menu Item
                        </button> :
                        <button className="w-[35%]">
                        {!isManager &&
                          <ItemAmount 
                            amount={amount}
                            onChange={amountChange}
                          />
                        }
                      </button>
                      }
                      
                      {isManager ?
                        <button 
                          className="bg-[#095d44] text-white w-[65%] rounded-md"
                          onClick={() => {
                            setEditMode(!editMode);
                            if (editMode) {
                              editMenuItemApi();
                            }
                          }}
                        >
                          {editMode ? 'Save' : 'Edit Menu Item'}
                        </button> :
                        // <button className="bg-[#095d44] text-white w-[65%] rounded-md">Add to order</button>
                        <button className="bg-[#095d44] text-white w-[65%] rounded-md"  
                            onClick={() => {
                              handleAddToCart();
                              closeModal();
                            }}
                          >
                            Add to cart
                        </button>
                      }
                    </div>
                  </section>
                </Dialog.Panel>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MyModal;