import { backendApi } from "@/assets/backend";
const isValidId = (id: number) => {
  return (id >= 0 && id % 1 === 0) 
}

export const isValidPrice = (price: string) => {
  const priceRegex = new RegExp(/^\d+(\.\d{1,2})?$/);
  return parseFloat(price) > 0 && priceRegex.test(price)
}

const isValidPreparationTime = (prepTime: number) => {
  return prepTime > 0
}

// POST
export const postCategory = (newCategoryName: string, token: string) => {

  return fetch(`${backendApi}/api/categories/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}` 
    },
    body: JSON.stringify({
      name: newCategoryName
    })
  })
}
// 201 if success
// 400 and response data { name: [ 'This field may not be blank.' ] } if input empty name
// 500 if access denied (invalid restaurant)
// 403 if invalid token (unauthorised)

// GET
export const getCategoriesList = (token: string) => {
  return fetch(`${backendApi}/api/categories/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`
    },
  })
}
// 200 if success (note can be the wrong restaurant id) ** NEEDS TO BE A WAY TO DETERMINE CUSTOMERS AND MANAGERS RESTAURANT SERVER-SIDE
// 403 if invalid token (unauthorised)

export const customerGetCategoriesList = () => {
  return fetch(`${backendApi}/api/categories/`, {
    method: 'GET',
    credentials: 'include'
  })
}
// 200 if success (can be wrong restaurant id)

// ${backendApi}/api/categories/{categoryId}/?restaurant={restaurantId}
// GET probably not that helpful
export const getCategory = (token: string, categoryId: number) => {
  if (!isValidId(categoryId)) {
    throw new TypeError('Expecting a UUID for category id.')
  }

  return fetch(`${backendApi}/api/categories/${categoryId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`
    },
  })
}
// 200 if success
// 404 if category not found (deleted) or category doesn't belong to the restaurant
// 403 if invalid token

// PUT not that helpful because you need to supply a restaurant as well as a new name
export const putCategory = (token: string, categoryId: number, newName: string) => {
  if (!isValidId(categoryId)) {
    throw new TypeError('Expecting a UUID for category id.')
  }

  return fetch(`${backendApi}/api/categories/${categoryId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': "application/json"
    },
    body: JSON.stringify({
      name: newName,
    })
  })
}
// 200 if success
// 400 if the new name is empty
// 403 if invalid token (unauthorised)
// 404 if the categoryid doesn't exist or the category doesn't belong to the restuarant
// 500 if unauthorised (the user doesn't own the restaurant to which the category belongs)

// PATCH
export const patchCategory = (token: string, categoryId: number, newName: string) => {
  if (!isValidId(categoryId)) {
    throw new TypeError('Expecting a UUID for category id.')
  }

  return fetch(`${backendApi}/api/categories/${categoryId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': "application/json"
    },
    body: JSON.stringify({
      name: newName
    })
  })
}
// 200 if success
// 400 if the new name is empty
// 403 if invalid token (unauthorised)
// 404 if the categoryid doesn't exist or the category doesn't belong to the restuarant
// 500 if unauthorised (the user doesn't own the restaurant to which the category belongs)

// DELETE
export const deleteCategory = (token: string, categoryId: number) => {
  return fetch(`${backendApi}/api/categories/${categoryId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Token ${token}`,
    }
  })
}
// 204 if success (no content sent back so don't json parse)
// 403 if invalid token (unauthorised)
// 404 if the categoryid doesn't exist or the category doesn't belong to the restaurant id
// 500 if unauthorised (the user doesn't own the restaurant to which the category belongs)

// ${backendApi}/api/menuitems/?restaurant={restaurantId}
// GET
export const getMenu = (token: string) => {
  return fetch(`${backendApi}/api/menuitems/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
    }
  })
}
// 200 on success (can be the wrong restaurant)
// 403 if invalid token

export const customerGetMenu = () => {
  return fetch(`${backendApi}/api/menuitems/`, {
    method: 'GET',
    credentials: 'include'
  })
}
// 200 on success
// POST
export const postMenuItem = (
  token: string, 
  name: string,
  description: string, 
  price: string, 
  categoryId: number, 
  dietary_requirements: "DF" | "GF" | "V" | "VG" | "", 
  preparation_time: number,
  popular: boolean,
  image: File | undefined
) => {
  if (!isValidId(categoryId)) {
    throw new TypeError('Expecting a UUID for category id.')
  }
  if (!isValidPrice(price)) {
    throw new TypeError('Expecting a two decimal place positive number for price.')
  }
  if (!isValidPreparationTime(preparation_time)) {
    throw new TypeError('Expecting a whole positive number for preparation time.')
  }

  const formData = new FormData()
  formData.append('token', token)
  formData.append('name', name)
  formData.append('description', description)
  formData.append('price', price)
  formData.append('category', String(categoryId))
  formData.append('dietary_requirements', dietary_requirements)
  formData.append('preparation_time', String(preparation_time))
  formData.append('popular', String(popular))
  if (image) {
    formData.append('image', image)
  }
  return fetch(`${backendApi}/api/menuitems/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
    },
    body: formData
  })
}
// 201 successfully posted
// 403 if the token is invalid
// 500 if the restaurant doesn't belong to you or the category doesn't belong to the restaurant

// ${backendApi}/api/menuitems/{menuitemId}/?restaurant={restaurantId}
// GET 
export const getMenuItem = (token: string, menuItemId: number) => {
  if (!isValidId(menuItemId)) {
    throw new TypeError('Expecting a UUID for menu item id.')
  }

  return fetch(`${backendApi}/api/menuitems/${menuItemId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
    }
  })
}

// 404 if not found
export const customerGetMenuItem = (menuItemId: number) => {
  if (!isValidId(menuItemId)) {
    throw new TypeError('Expecting a UUID for menu item id.')
  }

  return fetch(`${backendApi}/api/menuitems/${menuItemId}/`, {
    method: 'GET',
    credentials: 'include'
  })
}
// 404 if not found
// PUT (using this one most of the time)
export const putMenuItem = (
  token: string, menuItemId: number,
  name: string,
  description: string,
  price: string,
  categoryId: number,
  dietary_requirements: 'DF' | 'VG' | 'V' | 'GF',
  preparation_time: number,
  popular: boolean
) => {
  if (!isValidId(categoryId)) {
    throw new TypeError('Expecting a UUID for category id.')
  }
  if (!isValidId(menuItemId)) {
    throw new TypeError('Expecting a UUID for menu item id.')
  }
  if (!isValidPreparationTime(preparation_time)) {
    throw new TypeError('Expecting a whole number for preparation time.')
  }

  return fetch(`${backendApi}/api/menuitems/${menuItemId}/`, {
    method: 'PUT',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "name": name,
      "description": description,
      "price": price,
      "category": categoryId,
      "dietary_requirements": dietary_requirements,
      "preparation_time": preparation_time,
      "popular": popular,
    })
  })
}

interface patchDetails {
  name?: string,
  description?: string,
  price?: string,
  categoryId?: number,
  dietary_requirements?: 'DF' | 'VG' | 'V' | 'GF',
  preparation_time?: number,
  popular?: boolean
}

// PATCH 
export const patchMenuItem = (token: string, menuItemId: number, updateDetails: patchDetails) => {
  if (!isValidId(menuItemId)) {
    throw new TypeError('Expecting a UUID for menu item id.')
  }
  if (updateDetails.categoryId !== undefined && (!isValidId(updateDetails.categoryId))) {
    throw new TypeError('Expecting a UUID for category id.')
  }
  if (updateDetails.preparation_time !== undefined && (!isValidPreparationTime(updateDetails.preparation_time))) {
    throw new TypeError('Expecting a whole positive number for preparation time.')
  }

  return fetch(`${backendApi}/api/menuitems/${menuItemId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateDetails)
  })
}
// 200 on success
// DELETE 
export const deleteMenuItem = (token: string, menuItemId: number) => {
  console.log('token used is', token);
  if (!isValidId(menuItemId)) {
    throw new TypeError('Expecting a UUID for menu item id.')
  }
  return fetch(`${backendApi}/api/menuitems/${menuItemId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Token ${token}`
    }
  })
}
// 204 on success (no content)