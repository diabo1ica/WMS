import { backendApi } from "@/assets/backend"
export const getTable = (token: string) => {
  return fetch(`${backendApi}/api/updatetables/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
    }
  })
}

export const postTable = (token: string, tableNumber: number, createBulk: boolean) => {
  return fetch(`${backendApi}/api/updatetables/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}` 
    },
    body: JSON.stringify({
      'num': tableNumber,
      'list': createBulk
    })
  })
}

export const deleteTable = (token: string, tableNumber: number, deleteBulk: boolean) => {
  return fetch(`${backendApi}/api/updatetables/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}` 
    },
    body: JSON.stringify({
      'num': tableNumber,
      'list': deleteBulk
    })
  })
}