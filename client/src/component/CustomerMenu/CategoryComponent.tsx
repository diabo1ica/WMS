import React, { useContext, useEffect, useRef, useState } from 'react';
import { SearchContext } from '@/UseContext';
import MenuItemCard from '@/component/CustomerMenu/MenuItemCard';
import AddMenuItemCard from '@/component/CustomerMenu/Modal/AddMenuItemModal';
import EditMenuPosition from '@/component/CustomerMenu/Modal/EditMenuPosition';

import Project from '@/assets/Project.json';
import Lottie from 'lottie-react';

import { getMenu, getCategoriesList, customerGetMenu, customerGetCategoriesList } from '@/api/MenuItemAjax';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Container, SimpleGrid, useBreakpointValue } from '@chakra-ui/react'
import { useMediaQuery } from '@mui/material';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { patchCategory, deleteCategory } from '@/api/MenuItemAjax';
import ErrorHandler from '@/Error';

interface CategoryComponentProps {
  isForManager: boolean
}

interface SectionRefs {
  [key: string]: React.RefObject<HTMLDivElement>;
}

interface category {
  pk: number,
  name: string,
  restaurant: number,
}

interface menuItem {
  category: number,
  description: string,
  dietary_requirements: "DF" | "GF" | "V" | "VG" | "",
  name: string,
  pk: number,
  popular: boolean,
  preparation_time: number,
  price: string,
  restaurant: number,
  image: string
  position: number
}

interface structuredMenu {
  category: category,
  menuItems: menuItem[]
}

// Stores all menu items (separated by respective category)
const Category = ({isForManager} : CategoryComponentProps) => {
  const mobileScreen = useMediaQuery('(max-width:500px)');

  const { refresh, setRefresh, setMenu, setStructuredMenuGlobal } = useContext(SearchContext);
  const updateCategoryName = async (newCategoryName: string, categoryId: number, oldCategoryName: string) => {
  
    if (newCategoryName === oldCategoryName) throw new Error('New category name is the same as the old one!');
    if (newCategoryName === '') throw new Error('Category name cannot be empty!');
  
    const token = localStorage.getItem('token');
  
    if (token === null) return;
    try {
      await patchCategory(token, categoryId, newCategoryName);
      setRefresh(!refresh);
      location.reload();
    } catch (error) {
      ErrorHandler(error);
    }
  }
  
  const deleteSelectedCategory = async (categoryId: number) => {
    const token = localStorage.getItem('token');
    if (token === null) return;
    try {
      await deleteCategory(token, categoryId);
      setRefresh(!refresh);
    } catch (error) {
      ErrorHandler(error);
    }
    
  }
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const handleNewCategoryName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryName(e.target.value);
  }

  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState<boolean>(false);

  const handleEditCategoryDialogOpen = () => {
    setEditCategoryDialogOpen(!editCategoryDialogOpen);
  }

  const { searchMenuOption } = useContext(SearchContext);

  const sectionRefs = useRef<SectionRefs>({});
  const columns = useBreakpointValue({ sm: 1, md: 2, lg: isForManager ? 2 : 1, xl: isForManager ? 3 : 2 });

	const [isLoading, setIsLoading] = useState<boolean>(false);
  const [structuredMenu , setStructuredMenu] = useState<structuredMenu[]>([]);
  const [specialMenu, setSpecialMenu] = useState<menuItem[]>([]);

  const token = localStorage.getItem('token');

  const fetchCategories = isForManager ? () => getCategoriesList(token ? token : '') : () => customerGetCategoriesList()
  const fetchhMenuItems = isForManager ? () => getMenu(token ? token : '') : () => customerGetMenu()
  
  const getCategories = async () => {
		try {
			const res = await fetchCategories()
			const categories = await res.json();
      return categories;
		} catch (error) {
			ErrorHandler(error);
		}
	}

	const fetchMenuItems = async () => {
		try {
			const res = await fetchhMenuItems();
      const menu = await res.json();
      setMenu(menu);
      return menu;
		} catch (error) {
      ErrorHandler(error);
		}
	}

  const handleAddSpecialMenu = (allMenuItems: menuItem[]) => {
    setSpecialMenu([]);
    const specialMenuItems = allMenuItems.filter(menuItem => menuItem.popular && menuItem.category && !specialMenu.includes(menuItem));
    setSpecialMenu(specialMenuItems);
  }

  const buildStructuredMenu = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories: category[] = await getCategories();
      const fetchedMenuItems: menuItem[] = await fetchMenuItems();

      handleAddSpecialMenu(fetchedMenuItems);

      // sort menu items in order by position number
      const newStructuredMenu: structuredMenu[] = fetchedCategories.map((category) => ({
        category,
        menuItems: fetchedMenuItems.filter((menuItem) => menuItem.category === category.pk).sort((a, b) => a.position - b.position),
      }))
      setStructuredMenu(newStructuredMenu);
      setStructuredMenuGlobal(newStructuredMenu);
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setSpecialMenu([]);
    buildStructuredMenu();
  }, [refresh]);

  useEffect(() => {
    // placeholder
  }, [specialMenu])

  useEffect(() => {
    sectionRefs.current = structuredMenu.reduce((acc, item) => {
      acc[item.category.name] = React.createRef();
      return acc ;
    }, {} as SectionRefs);
  }, [structuredMenu]);

  useEffect(() => {
    if (searchMenuOption && sectionRefs.current[searchMenuOption]?.current) {
      sectionRefs.current[searchMenuOption].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchMenuOption]);

  return (
    <div className="relative overflow-x-hidden w-full flex-grow no-select no-carat pb-24">
      {isLoading && <div className="h-screen w-full grid place-items-center">LOADING...</div>}
      {isForManager &&
        <AddMenuItemCard />
      }

      {isForManager &&
        <EditMenuPosition />
      }

      {structuredMenu.length > 0 ? 
        <div className="overflow-x-hidden">
          {/* render special menu item slider first */}
          {specialMenu.length > 0 &&
            <div className={`font-bold text-2xl mt-0 ${mobileScreen ? 'px-1' : 'px-4'}`}>
              Special Menu Items
            </div>
          }
          <div className={`flex overflow-x-auto gap-5 border-black pt-5 pb-3 ${mobileScreen ? 'px-1' : 'px-4'} mb-5`}>
            {specialMenu.map((menuItem, index) => (
              <MenuItemCard
                key={index}
                pk={menuItem.pk}
                uniqueKey={index}
                name={menuItem.name}
                image={menuItem.image}
                description={menuItem.description}
                price={Number(menuItem.price)}
                isEditable={isForManager}
                dietaryRequirement={menuItem.dietary_requirements}
                minutes={menuItem.preparation_time}
                isPopular={menuItem.popular}
                className="shrink-0 w-[420px]"
              />
            ))}
          </div>
          {structuredMenu.length > 0 && structuredMenu.map((item, index) => (
            <Container 
              key={index}
              maxW="full"
              ref={sectionRefs.current[item.category.name]}
            >
              <section className="">
                <section className="flex gap-3">
                <div className="capitalize my-heading-lg my-auto">{item.category.name}</div>
                {isForManager ?
                <Dialog>
                  <DialogTrigger asChild>
                  <button 
                    className="bg-white hover:bg-[#ffcc99] border border-black my-4 px-3 rounded-[4px]"
                    onClick={() => setNewCategoryName(item.category.name)}
                  >
                    Edit
                  </button>
                  </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex">Edit Category</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input onChange={(e) => {handleNewCategoryName(e);}} id="name" value={newCategoryName} className="col-span-3" />
                        </div>
                      </div>
                      <DialogFooter>
                      <Button className="bg-red-500" type="submit"
                        onClick={() => {
                          deleteSelectedCategory(item.category.pk);
                          handleEditCategoryDialogOpen();
                        }}
                      >
                        Delete Category
                      </Button>
                        <Button className="bg-green-500" type="submit" 
                          onClick={() => {
                            updateCategoryName(newCategoryName, item.category.pk, item.category.name);
                            handleEditCategoryDialogOpen();
                          }}
                        >Save changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  : <></>
                }
                </section>
                
              </section>
          
              <SimpleGrid className={`w-full ${!isForManager ? 'my-3' : ''}`} columns={isForManager ? columns : columns} spacing='10px'>
                {item.menuItems.map((menuItem, subIndex) => (  
                  <MenuItemCard
                    key={subIndex}
                    uniqueKey={menuItem.category}
                    pk={menuItem.pk}
                    name={menuItem.name}
                    description={menuItem.description}
                    image={menuItem.image}
                    price={Number(menuItem.price)}
                    isEditable={isForManager}
                    dietaryRequirement={menuItem.dietary_requirements}
                    minutes={menuItem.preparation_time}
                    isPopular={menuItem.popular}
                    className="w-full shrink-1"
                  />
                ))}
                </SimpleGrid>
            </Container>   
          ))}
        </div> :
        <>
          <Lottie className="md:w-1/2 mx-auto" animationData={Project} loop={true} />
          <div className="font-bold text-2xl mx-auto grid place-items-center">No menu item found</div>
        </>
        }
    </div>
  )
}

export default Category;