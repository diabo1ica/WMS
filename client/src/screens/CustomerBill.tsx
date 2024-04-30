import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchContext } from '@/UseContext';
import { useMediaQuery } from '@mui/material';

import { getBill, getBillAsStaff, endCustomerSession } from '@/api/OrderAjax';

import { Heading } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { Text } from '@chakra-ui/react';
import { Separator } from '@/components/ui/separator';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import ErrorHandler from '@/Error';

interface OrderItem {
  order: number,
  menu_item: number,
  status: string
}

interface BillItemDetail {
  pk: number;
  name: string;
  quantity: number;
  price: number;
}

const CustomerBill = () => {
  const { menu } = useContext(SearchContext);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tableNumber = queryParams.get('table');

  // get table no. for staff
  const tableNum = tableNumber ? parseInt(tableNumber) : undefined;
  const token = localStorage.getItem('token');

  const [billData, setBillData] = useState({
    table_number: null,
    total_price: null,
    items: [] as BillItemDetail[],
  });
  const matches = useMediaQuery('(max-width: 850px)');
  const [loading, setLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();
  const handleNavigation = () => {
    navigate('/manager')
  }

  const endCustomerSessionAPI = async (tableNumber: number) => {
    const token = localStorage.getItem('token');
    try {
      if (token) await endCustomerSession(token, tableNumber);
    } catch (error) {
      ErrorHandler(error);
    }
  }

  const fetchedBillForCustomer = async() => {
    try {
			const res = await getBill()
			if (res.ok) {
				const bill = await res.json();
        return bill;
			} else {
        throw new Error('Failed to fetch bill.')
			}
		} catch (error) {
			ErrorHandler(error);
		}
  }

  const fetchedBillForStaff = async() => {
    if (token === null || tableNum === undefined) {
      throw new Error('Invalid token: Unauthorised');
    }
    try {
			const res = await getBillAsStaff(token, tableNum);
			if (res.ok) {
				const bill = await res.json();
        return bill;
      }
		} catch (error) {
			ErrorHandler(error);
		}
  }

  const getMenuItem = (menuId: number) => {
    return menu.find((menuItem: { pk: number; }) => menuItem.pk === menuId);
  }

  const getBillItemsDetail = (items: OrderItem[]) => {
    const itemMap = new Map<number, BillItemDetail>();
    for (const item of items) {
      const data = getMenuItem(item.menu_item);
      if (data) {
        const existingItem = itemMap.get(data.pk);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          itemMap.set(data.pk, {
            pk: data.pk,
            name: data.name,
            quantity: 1,
            price: parseFloat(data.price),
          });
        }
      }
    }
    return Array.from(itemMap.values());
  }

  const buildBill = async() => {
    setLoading(true);
    try {
      let bill;
      if (tableNum !== undefined) {
        bill = await fetchedBillForStaff();
      } else {
        bill = await fetchedBillForCustomer();
      }
      const billItemsDetails = await getBillItemsDetail(bill.order_list);
      setBillData({
        table_number: bill.table_number,
        total_price: bill.bill_total,
        items: billItemsDetails || [],
      });
    } catch (error) {
      ErrorHandler(error);
    } finally {
      setLoading(false); 
    }
  }

  useEffect(() => {
    buildBill();
  }, []);


  return (
    <>
      <div>
        <Button className='m-5 mt-10' onClick={handleNavigation}>   
          <ArrowBackIosIcon />Back to menu
        </Button>
      </div>
      {loading ? (
          <Text className='m-2'>LOADING...</Text>
        ) : (
        <section className='p-5 flex flex-row flex-wrap overflow-y-auto justify-center'>
          <section className="min-w-[400px] w-[600px]">
            {billData.table_number !== null ? 
              <Heading className="grid place-items-center">Order Summary for Table {billData.table_number}</Heading>
              :
              <Heading className="grid place-items-center">Nothing on this table</Heading>
            }
            
            {matches &&
            <div className='w-full flex flex-row justify-evenly'>
              <Text>Table No.{billData.table_number}</Text>
            </div>
            }
            <div>
            <section className={`m-5 border-slate-400 border-[1px] rounded-lg ${matches ? 'text-sm' : ''}`}>
              {/* heading */}
              <section className="flex flex-col bg-[#f8f9fb] rounded-t-lg p-7">
                <span className="text-md font-bold">Table Number: {billData.table_number}</span>
                <span className="text-sm text-slate-500">Start: </span>
              </section>

              {/* main body */}
              <section className="p-7">
              <span className="text-sm font-bold">Table Details</span>
                {billData.items.map((item, index) => (                
                  <section key ={index} className="flex justify-between w-full my-3">
                    <span className="w-full text-slate-500">{item.name} x {item.quantity}</span>
                    <span>${item.price}</span>
                  </section>                 
                ))}
              </section>
              <Separator className="bg-slate-400 w-[90%] mx-auto"/ >
                
                {/* footer */}
              <section className="mt-3 px-7 pb-3">
                <Button onClick={() => {
                  if (billData.table_number) endCustomerSessionAPI(billData.table_number);
                  navigate('/manager');
                }} className="bg-black w-full text-white">Handle Billing</Button>
              </section>
              <section className="bg-[#efeff0] p-7 rounded-b-lg border-t-[1px] border-slate-400">
                Updated: Date
              </section>
            </section>
            </div>
          </section>
        </section>
       )}
    </>
  )
}

export default CustomerBill;