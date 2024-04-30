import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

import React, { useState, useEffect, useContext } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from '@chakra-ui/react';

import { SearchContext } from '@/UseContext';

import { getCategoriesList, postMenuItem, postCategory } from '@/api/MenuItemAjax';

import ErrorHandler from '@/Error';

interface category {
  pk: number,
  name: string,
  restaurant: number,
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
]

const AddMenuItemCard = () => {


  // stuffs from sidebar add category button
  const { refresh, setRefresh } = useContext(SearchContext);

  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [categories, setCategories] = useState<category[]>([]);

  const handleAddCategory = async () => {
    setDialogState('add menu')
    const token = localStorage.getItem('token');

    try {
      if (token === null) {
        throw new Error('Cannot add a new category, because token is not stored.');
      }
      if (!categories.some(c => c.name === newCategoryName)) {
        await postCategory(newCategoryName, token);
        const response = await getCategoriesList(token)
        const data = await response.json()
        setCategories(data);
        setRefresh(!refresh);
      }
    } catch (error) {
      ErrorHandler(error);
    }
    handleAddMenuItemModalOpen();
    setNewCategoryName('');
    setRefresh(!refresh);
  }

  const [dialogState, setDialogState] = useState<string>('add menu');


  useEffect(() => {
    // placeholder function
  }, [refresh, dialogState]);

  const token = localStorage.getItem('token');
  const getCategories = async () => {
		try {
			if (token === null) {
				ErrorHandler('Invalid Token')
				return;
			}
			const res = await getCategoriesList(token);
      const categories = await res.json();
      setCategories(categories);
		} catch (error) {
      ErrorHandler(error);
		}
	}
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryPk, setCategoryPk] = useState<string>('');
  const [dr, setDR] = useState<"DF" | "GF" | "V" | "VG" | "">('');
  const [prepTime, setPrepTime] = useState<number>();
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [image, setImage] = useState<undefined|File>()
  const [imageBase64, setImageBase64] = useState<undefined|string>()

  const handlePopularMenuChange = () => {
    setIsPopular(!isPopular);
    console.log(isPopular);
  }

  const handleSelectCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryPk(event.target.value);
  }

  const handleSelectDRChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (['DF', 'GF', 'V', 'VG', ''].includes(event.target.value)) {
      // setDR(event.target.value as "DF" | "GF" | "V" | "VG" | null);
      setDR(event.target.value as "" | "DF" | "GF" | "V" | "VG");
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      const file: File = event.target.files[0]
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof(reader.result) === "string")
          setImageBase64(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const addNewMenuItem = async () => {
    setDialogState('add menu');
    try {
      if (token === null) {
        console.log('fail to add category menu');
        return;
      }
      console.log(token, itemName, itemDescription, itemPrice, categoryPk, dr, prepTime, isPopular)
      await postMenuItem(
        token, 
        itemName, 
        itemDescription, 
        itemPrice, 
        Number(categoryPk), 
        dr,
        Number(prepTime), 
        isPopular,
        image
      );
    } catch (error) {
      console.log(error);
    } finally {
      setIsModalOpen(false);
      setRefresh(!refresh);
      location.reload();
    }
  }

  useEffect(() => {
    // void
  }, [refresh])

  const handleAddMenuItemModalOpen = () => {
    setIsModalOpen(!isModalOpen);
  }


  return (    
      <Dialog open={isModalOpen} onOpenChange={handleAddMenuItemModalOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed z-[10] bottom-5 right-12 w-[200px] hover:bg-white hover:text-black hover:border hover:border-slate-700"
          onClick={() => {
            getCategories();
            setIsModalOpen(true)}
          }
        >Add new menu
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] no-cursor">
        <DialogHeader>
          <section className="flex items-center gap-4">
            <DialogTitle className="flex">{dialogState === 'add menu' ? 'Add new menu' : 'Add new category'}</DialogTitle>
            {dialogState === 'add menu' ? 
              <Button className="flex bg-blue-500" onClick={() => setDialogState('add category')}>+ Category</Button>
              :
              <Button className="flex bg-blue-500" onClick={() => setDialogState('add menu')}>+ Menu</Button>
            }
          </section>
          
        </DialogHeader>
        {dialogState === 'add menu' ? 
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select id="category" style={{ fontSize: '14px' }} placeholder='Select category' width='278px' onChange={handleSelectCategoryChange}>
                  {categories.map((item, index) => (
                    <option key={index} value={item?.pk.toString() || ''}>{item.name}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input 
                  id="name" 
                  placeholder="item name" 
                  className="col-span-3"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input 
                  id="description" 
                  placeholder="item description" 
                  className="col-span-3"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input 
                  id="price" 
                  placeholder="item price" 
                  className="col-span-3"
                  value={itemPrice}
                  onChange={(e) => {
                    setItemPrice(e.target.value)
                    console.log(itemPrice);
                  }} />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dietary-requirement" className="text-right">
                  Dietary Req
                </Label>
                <Select id="dietary-requirement" style={{ fontSize: '14px' }} placeholder='No dietary requirement' width='278px' onChange={handleSelectDRChange}>
                  {DROptions.map((item, index) => (
                    <option key={index} value={item?.value || ''}>{item.name}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="preparation-time" className="text-right">
                  Preparation Time
                </Label>
                <Input 
                  id="preparation-time" 
                  placeholder="preparation time" 
                  className="col-span-3"
                  value={prepTime}
                  onChange={(e) => {
                    setPrepTime(Number(e.target.value))
                  }} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4 w-full">
                <Label htmlFor="menuitem-image" className="text-right">Image</Label>
                <Input className="w-[277px] hover:border-blue-500 hover:opacity-80 hover:border-[2px] hover:cursor-pointer" id="menuitem-image" type="file" onChange={handleImageChange}/>
              </div>

              {imageBase64 && 
                <div className="grid grid-cols-4 items-center gap-4">
                  <div></div>
                  <img src={imageBase64} alt="menu-item-image" className="rounded-md" width={100} height={100}/>
                </div>
              }
            </div>

            <div className="flex justify-center gap-2">
              <Label htmlFor="name" className="">
                Mark this as popular?
              </Label>
              <Checkbox checked={isPopular} className="no-cursor" onClick={handlePopularMenuChange}/>
            </div>
          </> :
            <div className="flex items-center gap-3">          
              <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input 
              id="categoryName" 
              placeholder="new category name" 
              className="col-span-3"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)} />
            </div>
          }
        
        <DialogFooter>
        <Button 
          className="bg-red-500" type="submit" 
          onClick={() => {
            setIsModalOpen(false);
            setDialogState('add menu');
          }}
        
        >Cancel</Button>
        {dialogState === 'add menu' ?
          <Button 
            className="bg-green-500" type="submit" 
            onClick={addNewMenuItem}
          >
            Add
          </Button> :
          <Button 
          className="bg-green-500" type="submit" 
          onClick={handleAddCategory}
        >
          Add
        </Button>
        }
        
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default AddMenuItemCard;