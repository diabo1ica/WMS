import { backendApi } from "@/assets/backend"

interface Categories {
	categoryId: number,
	newPosition: number
}

interface MenuItems {
	categoryId: number,
	menuItems: MenuItem[];
}

interface MenuItem {
  menuItemId: number;
  newPosition: number;
}

export const editCategoryPosition = (categories: Categories[], token:string) => {
  return fetch(`${backendApi}/api/position/category/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
			Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ categories: categories })
  })
}

export const editMenuItemPosition = (menuItems:MenuItems, token:string) => {
		console.log(menuItems);
    return fetch(`${backendApi}/api/position/menuitem/`, {
      method: 'POST',
      credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Token ${token}`,
			},
			body: JSON.stringify(menuItems)
    })
  }
