import { backendApi } from "@/assets/backend"

export const customerPostAssistanceRequest = () => {
  return fetch(`${backendApi}/api/tableassistancewithoutparams/`, {
    method: 'POST',
    credentials: 'include'
  })
}

export const staffDeleteAssistanceRequest = (token: string, table_number: number) => {
  return fetch(`${backendApi}/api/tableassistancewithoutparams/`, {
    method: 'DELETE', 
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      table_number: table_number
    })
  })
}

export const staffGetTablesNeedingAssistance = (token: string,) => {
  return fetch(`${backendApi}/api/stafftableassistance/`, {
    headers: {
      'Authorization': `Token ${token}`
    },
    method: 'GET'
  })
}