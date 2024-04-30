import React, {useEffect, useState, useContext } from "react";
import { Button } from '@/components/ui/button';
import { getAllOrders, updateOrderStatus } from '@/api/OrderAjax';
import { SearchContext } from '@/UseContext';
import { useMediaQuery } from '@mui/material';

import Lottie from 'lottie-react';
import Food from '@/assets/Food.json';

import ErrorHandler from '@/Error';

interface OrderSidebarComponentProp {
  name: string,
  onClick: () => void,
  className: string,
}

// typescript types and interfaces
interface orderSpecifics {
  customer_session: string | number,
  order_time: string,
}

// use this
interface OrderItemSpecifics {
  pk: number,
  order: number,
  menu_item: number,
  status: string
}

interface OrderItemProp {
  pk: number,
  menu_item: number,
  status: string
}

// use this (order component)
interface OrderFetched {
  order: orderSpecifics,
  order_id: number,
  order_items: OrderItemSpecifics[],
  table_number: string | number,
  onClick: () => void;
}

const OrderSidebarComponent: React.FC<OrderSidebarComponentProp> = ({ name, onClick, className }) => {
  const mobile = useMediaQuery('(max-width:900px)');
  return (
    <div className={`${className} ${mobile ? 'text-[12px]' : 'text-[14px]'} font-bold w-full flex justify-center place-items-center h-[50px] hover:border hover:bg-slate-200 hover:font-[900] rounded-[10px]`} onClick={onClick}>{name}</div>
  )
}

// helper function that will check if the order itself is completed
const checkOrderComplete = (orders: OrderItemSpecifics[]) => {
  for (const orderItem of orders) {
    if (orderItem.status === 'ORDER SENT') return 'NOT COMPLETED';
  }
  return 'COMPLETED';
}

const OrderComponentReal: React.FC<OrderFetched> = ({ order, order_id, order_items, table_number, onClick }) => {
  return (
    <div onClick={onClick} className="hover:border hover:border-slate-200 hover:bg-slate-200 hover:cursor-pointer w-full h-[100px] align-center place-items-center flex justify-between rounded-lg bg-white p-4">
      <section className="flex flex-col">
        <div className="font-bold">Order #{order_id}</div>
        <div className="text-slate-500">Table Number: {table_number}</div>
        <section className="flex gap-2">
          <div>Status: </div>
          <div className={`${checkOrderComplete(order_items) === 'NOT COMPLETED' ? 'text-red-500' : 'text-green-600'} font-bold`}>{checkOrderComplete(order_items)}</div>
        </section> 
      </section>
      <div className="text-slate-500">{order.order_time.slice(0, 8)}</div>
    </div>
  )
}

const Order = () => {
  const mobile = useMediaQuery('(max-width:900px)');
  // const tablet = useMediaQuery('(min-width:901px) and (max-wdth:1100px');
  // const desktop = useMediaQuery('(min-width:1101px)');

  const { refresh, setRefresh, menu, currentManagerTableTabFocused } = useContext(SearchContext);
  const [showTab, setShowTab] = useState<number>(0);

  const [orderDetailOrderId, setOrderDetailOrderId] = useState<number>(-1);
  const [orderDetailOrderItems, setOrderDetailOrderItems] = useState<OrderItemSpecifics[]>([]);
  const [orderDetailOrderTime, setOrderDetailOrderTime] = useState<string>('');
  const [orderDetailTableNumber, setOrderDetailTableNumber] = useState<string | number>(-1);

  const [orderFocused, setOrderFocused] = useState<boolean>(false);

  const [allOrders, setAllOrders] = useState<OrderFetched[]>([]);

  const updateOrderStatusAPI = async (orderItemPk: number, newOrderStatus: string, currentOrderStatus: string) => {
    const token = localStorage.getItem('token');
    if (token === null) throw new Error('invalid token!')
    try {
      if (currentOrderStatus === 'SERVED') return;
      await updateOrderStatus(token, orderItemPk, newOrderStatus);
      setRefresh(!refresh);
    } catch (error) {
      ErrorHandler(error);
    }
  }

  const getMenuName = (menuId: number) => {
    return menu.find(menuItem => menuItem.pk === menuId)?.name ?? null;
  }

  const OrderItem:React.FC<OrderItemProp> = ({ pk, menu_item, status}) => {
    return (
      <div className="border-b border-slate-300 mb-4 flex flex-col">
        <section className="flex w-full justify-between">
          <div className="font-bold">{getMenuName(menu_item)}</div>
          <div className="my-auto">{status}</div>
        </section>
        <section className="flex gap-2 my-2">
          <Button disabled={status === 'SERVED'} className="bg-blue-500" onClick={() => {
            updateOrderStatusAPI(pk, 'PREPARED', status);
          }}>Mark Ready</Button>
          <Button disabled={status === 'SERVED'} className="bg-orange-400" onClick={() => {
            updateOrderStatusAPI(pk, 'ORDER SENT', status);
          }}>Mark Cooking</Button>
        </section>
      </div>
    )
  }

  // get all orders from OrderAjax.tsx
  // get a specific order info from a specific table
  const getAllOrdersApi = async () => {
    const token = localStorage.getItem('token');
    if (token === null) throw new Error('invalid token');
    try {
      const res = await getAllOrders(token);
      const allOrders = await res.json();
      setAllOrders(allOrders.reverse());
      for (const order of allOrders) {
        if (order.order_id === orderDetailOrderId) {
          handleOrderDetailData(order);
        }
      }
    } catch (error) {
      ErrorHandler(error);
    }
  }

  const handleOrderDetailData = (order: OrderFetched) => {
    console.log('order is ', order);
    setOrderFocused(true);
    setOrderDetailOrderId(order.order_id);
    setOrderDetailOrderItems(order.order_items);
    setOrderDetailOrderTime(order.order.order_time);
    setOrderDetailTableNumber(order.table_number);
  };

  useEffect(() => {
    console.log(currentManagerTableTabFocused);
  }, [showTab, orderDetailOrderId, allOrders, orderDetailOrderItems]);


  useEffect(() => {
    getAllOrdersApi();
  }, [refresh]);

  useEffect(() => {
    // getAllOrdersApi();
    if (orderFocused ||  currentManagerTableTabFocused === 'QR codes') {
      const polling = setInterval(getAllOrdersApi, 2000);
      console.log('order polling here bro')
      return () => clearInterval(polling);
    }
  }, [allOrders, orderDetailOrderId, orderFocused, currentManagerTableTabFocused]);

  const checkOrderReady = (order: OrderFetched) => {
    for (const orderItem of order.order_items) {
      if (orderItem.status === 'ORDER SENT') return false;
    }
    return true;
  }

  return (
    <div className="rounded-lg h-full flex bg-white border p-0 border-slate-300 no-select overflow-hidden">
      <section className="flex w-full">
        <section className={`${mobile ? 'w-full' : 'w-1/2'} ${(mobile && orderFocused) ? 'hidden' : ''} flex flex-col border-r-[1px] border-slate-300`}>
          {/* sidebar */}
          <section className="flex p-2 border-b-[1px] border-slate-300">
            <OrderSidebarComponent className={`${showTab === 0 && 'text-slate-500 border border-slate-500'}`} name="ALL ORDERS" onClick={() => setShowTab(0)}/>
            <div className="mt-10"></div>
            <OrderSidebarComponent className={`${showTab === 2 && 'text-slate-500 border border-slate-500'}`} name="NOT COMPLETED" onClick={() => setShowTab(2)}/>
            <div className="mt-1"></div>
            <OrderSidebarComponent className={`${showTab === 3 && 'text-slate-500 border border-slate-500'}`} name="COMPLETED" onClick={() => setShowTab(3)}/>
            <div className="mt-1"></div>
          </section>
          {/* ORDER LIST */}
          <section className="flex flex-col px-auto gap-5 bg-[#f8f9fb] p-5 overflow-y-auto" style={{ height: 'calc(100vh - 7.15rem)' }}>
            {allOrders.map((item, index) => {
              if (showTab === 0) {
                return <OrderComponentReal key={index} order={item.order} order_id={item.order_id} order_items={item.order_items} table_number={item.table_number} onClick={() => {handleOrderDetailData(item)}}/>
              } 
                else if (showTab === 3 && checkOrderReady(item)) {
                  return <OrderComponentReal key={index} order={item.order} order_id={item.order_id} order_items={item.order_items} table_number={item.table_number} onClick={() => {handleOrderDetailData(item)}}/>
                } else if (showTab === 2 && !checkOrderReady(item)) {
                  return <OrderComponentReal key={index} order={item.order} order_id={item.order_id} order_items={item.order_items} table_number={item.table_number} onClick={() => {handleOrderDetailData(item)}}/>
                }
            })}         
          </section>
        </section>
        
        {/* ORDER DETAILS */}
        <section className={`${(mobile && orderFocused) && 'w-full flex flex-col'} ${(mobile && !orderFocused) && 'hidden'} ${!mobile && 'w-1/2'} overflow-y-auto`}>
          <Button className={`${!mobile && 'hidden'} w-[120px] mt-5 ml-5`} onClick={() => {setOrderFocused(false); setOrderDetailOrderId(-1); console.log('order focused is now', orderFocused)}}>Back to orders</Button>
        {
          orderDetailOrderId === -1 ? 
          <div className="flex flex-col justify-center items-center h-full">
            <div className="text-2xl font-bold">Ready to handle order?</div>
            <Lottie className="w-[300px]" animationData={Food} loop={true} />
          </div> :
          <section className="flex-grow p-5">
          <section className="flex justify-between">
            <section>
              <div className="text-xl font-bold">Order #{orderDetailOrderId}</div>
              <div>Table Number {orderDetailTableNumber}</div>
              <div className='text-slate-500 mb-6'>{orderDetailOrderTime.slice(0, 8)}</div>
            </section>
          </section>
          <div>
            {orderDetailOrderItems.map((item, index) => (
              <OrderItem key={index} pk={item.pk} menu_item={item.menu_item} status={item.status} />
            ))}
          </div>
        </section>
        }
        </section>
      </section>
    </div>
  )
}

export default Order;