import { useEffect, useState, useContext } from 'react';
import Lottie from 'lottie-react';

import SidebarComponent from "@/component/CustomerMenu/SidebarComponent";
import ErrorHandler from '@/Error';
import { SearchContext } from '@/UseContext';
import { customerGetCategoriesList, getCategoriesList } from '@/api/MenuItemAjax';

import Project from '@/assets/Project.json';

interface SidebarProps {
  isForManager: boolean
}

interface category {
  pk: number,
  name: string,
  restaurant: number,
}

const Sidebar = ({isForManager}: SidebarProps) => {
  const { refresh } = useContext(SearchContext);

  const [categories, setCategories] = useState<category[]>([]);
  const getCategories = async () => {

    if (isForManager) {
      try {
        const token = localStorage.getItem('token');
        if (token === null) throw new Error('invalid token!');
        const res = await getCategoriesList(token);
        const categories = await res.json();
        setCategories(categories);
        
      } catch(error) {
        ErrorHandler(error);
      }
    } else {
      try {
        const res = await customerGetCategoriesList();
        const categories = await res.json();
        setCategories(categories);
      } catch (error) {
        ErrorHandler(error);
      }
    }
  }

  useEffect(() => {
    getCategories();
  }, [refresh]);

  return (
    <div className='flex flex-col gap-2 w-[300px] p-2 sticky no-select no-cursor no-carat'>
      {categories.length > 0 ? 
        <>
          {categories.map((item, index) => (
            <SidebarComponent key={index} uniqueKey={index} name={item.name} needsEditWidget={isForManager}/>
          ))}
        </> :
        <> 
          <Lottie className="my-auto" animationData={Project} loop={true} />
          <div className="text-2xl font-bold mx-auto flex justify-center text-center">No category found</div>
        </>
      }
    </div>
  )
}

export default Sidebar;