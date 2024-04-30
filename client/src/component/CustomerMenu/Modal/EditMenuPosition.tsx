import {
    Dialog,
    DialogContent,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Separator } from "@/components/ui/separator"
  import { useState, useRef, useContext } from 'react';
  import { Button } from "@/components/ui/button"
  
  import { getMenu, getCategoriesList } from '@/api/MenuItemAjax';
  import { SearchContext } from '@/UseContext';
  import ErrorHandler from '@/Error';
  import { editCategoryPosition, editMenuItemPosition } from '@/api/EditPositionAjax';

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
    image: string,
    position: number
  }
  
  interface structuredMenu {
    category: category,
    menuItems: menuItem[]
  }  

  interface MenuItems {
    categoryId: number,
    menuItems: UpdatedMenuItem[];
  }
  
  interface UpdatedMenuItem {
    menuItemId: number;
    newPosition: number;
  }  
  
  const EditMenuPosition = () => {
    const token = localStorage.getItem('token');
    const [structuredMenu , setStructuredMenu] = useState<structuredMenu[]>([]);
    const { setMenu, refresh, setRefresh } = useContext(SearchContext);
    const [categoryPositionChange, setCategoryPositionChange] = useState(false);
    const [itemPositionChange, setItemPositionChange] = useState(false);

    const getCategories = async () => {
      try {
        const res = await getCategoriesList(token ? token : '');
        const categories = await res.json();
        return categories;
      } catch (error) {
        ErrorHandler(error);
      }
    }

    const buildStructuredMenu = async () => {
        try {
          const fetchedCategories: category[] = await getCategories();
          const res = await getMenu(token ? token : '');
          const response = await res.json();
          const fetchedMenuItems: menuItem[]  = response;

          setMenu(fetchedMenuItems);
          const newStructuredMenu: structuredMenu[] = fetchedCategories.map((category) => ({
            category,
            menuItems: fetchedMenuItems.filter((menuItem) => menuItem.category === category.pk).sort((a, b) => a.position - b.position),
          }))
          setStructuredMenu(newStructuredMenu);
        } catch (error) {
          ErrorHandler(error);
        }
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleEditMenupositionOpen = () => {
        setIsModalOpen(!isModalOpen);
      }

    const dragCategory = useRef<number>(-1);
    const dragOverCategory = useRef<number>(-1);
  
    const handleSortOrderCategory = () => {
      const dragCategoryIndex = dragCategory.current;
      const dragOverCategoryIndex = dragOverCategory.current;
      if (dragCategoryIndex !== -1 && dragOverCategoryIndex !== -1 && dragCategoryIndex !== dragOverCategoryIndex) {
        const updatedStructuredMenu = [...structuredMenu];
        const draggedCategory = updatedStructuredMenu[dragCategoryIndex];
        updatedStructuredMenu.splice(dragCategoryIndex, 1);
        updatedStructuredMenu.splice(dragOverCategoryIndex, 0, draggedCategory);
        setCategoryPositionChange(true);
        setStructuredMenu(updatedStructuredMenu);
      }
    }

    const dragItem = useRef<{ categoryIndex: number; itemIndex: number }>({ categoryIndex: -1, itemIndex: -1 });
    const dragOverItem = useRef<{ categoryIndex: number; itemIndex: number }>({ categoryIndex: -1, itemIndex: -1 });

    const handleDragStart = (categoryIndex: number, itemIndex: number) => {
      dragItem.current = { categoryIndex, itemIndex };
    };
    
    const handleDragEnter = (categoryIndex: number, itemIndex: number) => {
      dragOverItem.current = { categoryIndex, itemIndex };
      const { categoryIndex: currentDragCategoryIndex, itemIndex: currentDragItemIndex } = dragItem.current;
      
      if (categoryIndex === currentDragCategoryIndex && itemIndex !== currentDragItemIndex) {
        const updatedStructuredMenu = [...structuredMenu];
        const categoryItems = [...updatedStructuredMenu[categoryIndex].menuItems];

        // Remove the item being dragged from its current position
        const [reorderedItem] = categoryItems.splice(currentDragItemIndex, 1);
        // Insert it at the new position
        categoryItems.splice(itemIndex, 0, reorderedItem);

        updatedStructuredMenu[categoryIndex].menuItems = categoryItems;

        setStructuredMenu(updatedStructuredMenu);

        // Update the current drag positions
        dragItem.current = { categoryIndex, itemIndex };
      }
    };

    const handleSortOrderMenuItem = () => {
      const { categoryIndex: dragCategoryIndex, itemIndex: dragItemIndex } = dragItem.current;
      const { categoryIndex: dragOverCategoryIndex, itemIndex: dragOverItemIndex } = dragOverItem.current;
    
      if (dragCategoryIndex === dragOverCategoryIndex) {
        const updatedStructuredMenu = [...structuredMenu];
        const draggedItem = updatedStructuredMenu[dragCategoryIndex].menuItems[dragItemIndex];
        const categoryItems = [...updatedStructuredMenu[dragCategoryIndex].menuItems];
    
        categoryItems.splice(dragItemIndex, 1);
        categoryItems.splice(dragOverItemIndex, 0, draggedItem);
    
        updatedStructuredMenu[dragCategoryIndex].menuItems = categoryItems;
        setStructuredMenu(updatedStructuredMenu);
        setItemPositionChange(true);
      }
    };

    const saveChanges = async() => {
      // check if category were change? if yes, update category position
      try {
      if (categoryPositionChange) {
        const updatedCategories = structuredMenu.map((item, index) => ({
          categoryId: item.category.pk,
          newPosition: index + 1
        }));
        console.log("updatedCategories:" + JSON.stringify(updatedCategories));
        await editCategoryPosition(updatedCategories, token ? token : '');
        setCategoryPositionChange(false);
      }
      if (itemPositionChange) {
        const updatedMenuItems = structuredMenu.map((item) => {
          const updatedMenuItemsInCategory = item.menuItems.map((menuItem, index) => ({
            menuItemId: menuItem.pk,
            newPosition: index + 1,
          }));
          return {
            categoryId: item.category.pk,
            menuItems: updatedMenuItemsInCategory,
          };
        });
        for (const updatedCategory of updatedMenuItems) {
          const menuItemsObject: MenuItems = {
            categoryId: updatedCategory.categoryId,
            menuItems: updatedCategory.menuItems,
          };
          
          await editMenuItemPosition(menuItemsObject, token ? token : '');
          setItemPositionChange(false);
        }
      }
        handleEditMenupositionOpen();
        
        setRefresh(!refresh);
      } catch (error) {
        console.error('Error saving changes:', error);
      }
    }
  
    return (    
        <Dialog open={isModalOpen} onOpenChange={handleEditMenupositionOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed z-[10] bottom-16 right-12 w-[200px] hover:bg-white hover:text-black hover:border hover:border-slate-700"
            onClick={() => {
              buildStructuredMenu();
              setIsModalOpen(true)}
            }
          >Edit Menu Position
          </Button>
        </DialogTrigger>
        
        <DialogContent className="flex flex-col no-cursor ">
          <section className="max-h-[500px] overflow-y-auto">
            <section className="flex mb-3 justify-center text-md font-bold">Edit the position of categories and menu items</section>
            <section className="flex flex-col gap-4 ">
              {structuredMenu.map((item, categoryIndex) => (
                <section key={categoryIndex} className="flex flex-col gap-2">
                  {item.category && (
                    <section 
                      className="text-blue-500 font-bold"
                      draggable
                      onDragStart={() => (dragCategory.current = categoryIndex)}
                      onDragEnter={() => (dragOverCategory.current = categoryIndex)}
                      onDragEnd={handleSortOrderCategory}>
                        {item.category.name}</section>
                  )}
                  {item.menuItems.map((menuItem, itemIndex) => (
                    <section 
                      key={itemIndex} 
                      className="border rounded p-2 bg-gray-200 flex flex-col"
                      draggable
                      onDragStart={() => handleDragStart(categoryIndex, itemIndex)}
                      onDragEnter={() => handleDragEnter(categoryIndex, itemIndex)}
                      onDragEnd={handleSortOrderMenuItem}>
                        {menuItem.name}
                    </section>
                  ))}
                </section>
              ))}
            </section>
        </section>
        <Separator className="bg-slate-500" />
        <Button className="w-full hover:bg-green-500" onClick={saveChanges}>Save changes</Button>
        </DialogContent>
      </Dialog>
    )
  }
  export default EditMenuPosition;