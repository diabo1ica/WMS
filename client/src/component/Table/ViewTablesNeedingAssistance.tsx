import { staffGetTablesNeedingAssistance, staffDeleteAssistanceRequest } from "@/api/AssistanceAjax"

import { Button } from '@/components/ui/button';
import { useEffect, useState, useContext } from "react";
import { SearchContext } from '@/UseContext';
import ErrorHandler from '@/Error';

interface TableNeedsAssistanceProp {
  tableNumber: string,
}

const TableNeedsAssistance: React.FC<TableNeedsAssistanceProp> = ({ tableNumber }) => {
  const { refresh , setRefresh} = useContext(SearchContext);

  const handleAssistNow = () => {
    const token = localStorage.getItem('token')
    if (token !== null) {
      staffDeleteAssistanceRequest(token, parseInt(tableNumber))
      .then(response => {
        if (response.status !== 204) {
          throw new Error("Couldn't make the request to signal the table has been assisted.")
        } else {
          setRefresh(!refresh);
        }
      })
      .catch(error => {
        alert(error)
      })
    }
  }
  return (
    <div className="border-black border-[1px] rounded-[7px] flex justify-between place-items-center  w-full h-[40px] pl-2">
      Table {tableNumber}
      <Button className="h-[40px] w-[100px] hover:bg-slate-500" onClick={handleAssistNow}>Assist Now</Button>
    </div>
  )
}

export const ViewTablesNeedingAssistance = () => {
  const [tablesNeedingAssistance, setTablesNeedingAssistance] = useState([])
  const { refresh } = useContext(SearchContext);

  useEffect(() => {
    // placeholder function
  }, [refresh])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token !== null) {
      staffGetTablesNeedingAssistance(token)
      .then(response => {
        if (response.status !== 200) {
          throw new Error('Failed to fetch the tables needing assistance')
        } else {
          return response.json()
        }
      })
      .then(data => {
        setTablesNeedingAssistance(data)
      })
      .catch(error => {
        console.error(error)
      })
    } 
  }, [refresh]);

  // 
  useEffect(() => {
    const getAndSetTablesNeedingAssistance = () => {
      const token = localStorage.getItem('token')
      if (token !== null) {
        staffGetTablesNeedingAssistance(token)
        .then(response => {
          if (response.status !== 200) {
            throw new Error('Failed to fetch the tables needing assistance')
          } else {
            return response.json()
          }
        })
        .then(data => {
          setTablesNeedingAssistance(data)
        })
        .catch(error => {
          ErrorHandler(error);
        })
      } 
    }
    const polling = setInterval(getAndSetTablesNeedingAssistance, 5000)
    return () => clearInterval(polling)
  }, [])
  // 


  return (
    <div className="flex flex-col gap-3 px-0 h-[250px] overflow-y-auto">
      {tablesNeedingAssistance.map((item) => {
        return <TableNeedsAssistance key={item} tableNumber={item}/>
      })}
    </div>
  )
}

export default ViewTablesNeedingAssistance;