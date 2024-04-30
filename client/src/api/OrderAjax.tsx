import { backendApi } from "@/assets/backend"

interface OrderItem {
  menu_item: number,
  quantity: number
}

// customer: place order
export const placeOrder = (orderItems: OrderItem[]) => {
    /*
      returns status 400 if bad request
      returns status 200 if successful
    */
  return fetch(`${backendApi}/api/placeorder/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_items: orderItems
      })
    })
  }

export const getOrderItemsAsCustomer = () => {
  return fetch(`${backendApi}/api/orderitems/`, {
    method: 'GET',
    credentials: 'include'
  })
}
  
export const getOrderItemsAsStaff = (token: string, tableNumber: number) => {
  return fetch(`http://localhost:8000/api/orders/?table_number=${tableNumber}`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${token}`,
    }
  })
}

export const getAllOrders = (token: string) => {
  return fetch(`${backendApi}/api/allorders/`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${token}`,
    }
  })
}

export const updateOrderStatus = (token: string, orderItemPk: number, newOrderStatus: string) => {
  return fetch(`${backendApi}/api/orderitems/${orderItemPk}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: newOrderStatus
    })
  })
} 

export const getBill = () => {
  return fetch(`${backendApi}/api/bill/`, {
    method: 'GET',
    credentials: 'include'
  })
}

export const getBillAsStaff = (token: string, tableNumber: number) => {
  return fetch(`${backendApi}/api/staffbill/?table_number=${tableNumber}`, {
    method: 'GET',
    headers: {
      Authorization: `Token ${token}`,
    }
  })
}

export const endCustomerSession = (token: string, tableNumber: number) => {
  return fetch(`${backendApi}/api/staff-ending-customer/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      table_number: tableNumber
    })
  })
}