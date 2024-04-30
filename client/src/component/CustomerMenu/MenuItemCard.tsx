import {
  ChakraProvider,
  Image,
  Text,
} from '@chakra-ui/react';

import React, { useState } from 'react';

import ItemDetailModal from '@/component/CustomerMenu/Modal/ItemDetailModal';
import ThumbsUpIcon from '@mui/icons-material/ThumbUp';

interface MenuComponentProp {
  uniqueKey: number,
  pk: number,
  name:string,
  description: string,
  image: string,
  price:number,
  isEditable: boolean,
  dietaryRequirement: "DF" | "GF" | "V" | "VG" | "",
  isPopular: boolean,
  minutes: number,
  className: string,
}

const MenuItemCard: React.FC<MenuComponentProp> = ({ pk, uniqueKey, name, image, description, price, isEditable, dietaryRequirement, isPopular, minutes, className })=> {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ChakraProvider>
      {/* modal */}
      <ItemDetailModal 
        isOpen={isOpen} 
        openModal={openModal} 
        closeModal={closeModal} 
        uniqueKey={uniqueKey}
        pk={pk}
        name={name}
        image={image} 
        description={description} 
        price={price}
        isManager={isEditable}
        dietaryRequirement={dietaryRequirement}
        minutes={minutes}
        isPopular={isPopular}
      />
      <div
        className={`${className} h-auto elative z-[1] hover:cursor-pointer hover:border-[1.5px] hover:bg-slate-200 flex rounded-sm border-slate-300 border-[0.5px]`}
      >
        <Image
          onClick={openModal}
          objectFit='cover'
          className="w-[35%] h-auto rounded-l-sm"
          src={image}
          alt='image of an menu item'
        />
        
        <div className='hover:bg-[#f5f3ea] w-full no-cursor p-3'>
          {/* replaced CardBody into div */}
          <div className="flex flex-col justify-between h-full">
            <section className="flex flex-col justify-between h-full" onClick={openModal}>
              <section>
                <div className='flex flex-row'>
                  <div className="capitalize text-[18px] font-semibold ">{name}</div>
                  {isPopular && <ThumbsUpIcon className="ml-2 text-red-500"/>}
                </div>
                <Text noOfLines={2} className="text-gray-500">{description}</Text>
              </section>

            </section>
            <Text className="font-bold">${price}</Text>

          </div>
        </div>
      </div>
    </ChakraProvider>
   
  );
}

export default MenuItemCard;