import { useState, useEffect, useContext } from 'react';
import { SearchContext } from '@/UseContext';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';

import { getTable, postTable, deleteTable } from '@/api/RestaurantApi';
import { getOrderItemsAsStaff, getAllOrders, updateOrderStatus } from '@/api/OrderAjax';
import { ViewTablesNeedingAssistance } from '@/component/Table/ViewTablesNeedingAssistance'

import Lottie from 'lottie-react';
import OrderSVG from '@/assets/Order.json';
import NoOrder from '@/assets/NoOrder.json';
import TableDetail from '@/assets/TableDetail.json';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import ErrorHandler from '@/Error';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button';

import DeleteIcon from '@mui/icons-material/Delete';

// typescript types and interfaces
interface orderSpecifics {
  customer_session: string | number,
  order_time: string,
}

interface OrderItemSpecifics {
  pk: number,
  order: number,
  menu_item: number,
  status: string,
  table_number: number,
}

interface OrderFetched {
  order: orderSpecifics,
  order_items: OrderItemSpecifics[],
  table_number: string | number,
}

interface OrderItemStructured {
  menuItemId: number,
  status: string,
  orderNumber: number | string;
}

interface structuredOrderItem {
  tableNumber: number,
  orderTime: string,
  orderItems: OrderItemStructured[]
}

interface TableComponentProp {
  tableNumber: number,
  isOccupied: string,
}

interface TableDetailsProps {
  tableNum: number;
  orders: structuredOrderItem[];
}

const YourTable = () => {
  const { assistanceModalOpened, setAssistanceModalOpened, currentTableFocusNumber, setCurrentTableFocusNumber, refresh, setRefresh, menu } = useContext(SearchContext);
	const desktopScreen = useMediaQuery('(min-width:1200px)');
	const mobileScreen = useMediaQuery('(min-width:900px)');

  const [currentTableFocus, setCurrentTableFocus] = useState<number>(-1);
  const [tableFocused, setTableFocused] = useState<boolean>(false);

  const [editTableDialogOpen, setEditTableDialogOpen] = useState<boolean>(false);
  const [editTableDialogOpenMobile, setEditTableDialogOpenMobile] = useState<boolean>(false);

  const [needAssistanceDialogOpen, setNeedAssistanceDialogOpen] = useState<boolean>(false);
  const [needAssistanceDialogOpenMobile, setNeedAssistanceDialogOpenMobile] = useState<boolean>(false);

  const [newTableNumber, setNewTableNumber] = useState<number>(0);
  const [currentTables, setCurrentTables] = useState<TableComponentProp[]>([]);

  const [structuredOrders, setStructuredOrders] = useState<structuredOrderItem[]>([]);
  const [allOrderItems, setAllOrderItems] = useState<OrderItemSpecifics[]>([]);

  const getAllOrderItemsApi = async () => {
    setAllOrderItems([]);
    const token = localStorage.getItem('token');
    if (token === null) throw new Error('invalid token');
    try {
      const res = await getAllOrders(token);
      const allOrders = await res.json();
      setAllOrderItems([]);
      for (const order of allOrders) {
        for (const orderItem of order.order_items) {
          if (orderItem.status === 'PREPARED') {
            const modifiedOrderItem = {
              ...orderItem,
              table_number: order.table_number,
            };
            setAllOrderItems(prevItems => [...prevItems, modifiedOrderItem]);
          }
        }
      }
    } catch (error) {
      ErrorHandler(error);
    }
  }

  const getMenuName = (menuId: number) => {
    return menu.find(menuItem => menuItem.pk === menuId)?.name ?? null;
  }

  const handleTableFocusChange = (tableNumber: number) => {
    setCurrentTableFocus(tableNumber);
    if (tableNumber !== -1) setCurrentTableFocusNumber(tableNumber);
    if (!mobileScreen) setTableFocused(true);
    if (currentTableFocusNumber) getTableOrderApi(currentTableFocusNumber);
    setRefresh(!refresh);
  }

  const handleEditTableDialogOpen = () => {
    setEditTableDialogOpen(!editTableDialogOpen);
  }

  const handleEditTableDialogOpenMobile = () => {
    setEditTableDialogOpenMobile(!editTableDialogOpenMobile);
  }

  const handleNewTableNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTableNumber(Number(e.target.value));
    setRefresh(!refresh);
  }

  // get all orders from OrderAjax.tsx
  // get a specific order info from a specific table
  const getTableOrderApi = async (tableNumber: number) => {
    const token = localStorage.getItem('token');
    if (token === null) throw new Error('invalid token');
    try {
      const res = await getOrderItemsAsStaff(token, tableNumber);
      const tableOrder = await res.json();
      const newStructuredOrders: structuredOrderItem[] = tableOrder.map((order: OrderFetched) => (
        {
          tableNumber: order.table_number,
          orderTime: order.order.order_time,
          orderItems: order.order_items.map((item: OrderItemSpecifics) => ({
            menuItemId: item.menu_item,
            status: item.status,
            orderNumber: item.order,
          })),
        }
      ))
      setStructuredOrders(newStructuredOrders);
    } catch (error) {
      ErrorHandler(error);
    }
  }

  // API table numbers
  // get all tables
  const getTableApi = async () => {
    const token = localStorage.getItem('token');
    if (token === null) {
      throw new Error('invalid token!');
    }
    try {
      const res = await getTable(token);
      const response = await res.json();
      setCurrentTables(response.table_numbers);
    } catch (error) {
      ErrorHandler(error);
    }
  }

  const editTable = async (command: string, tableNumber: number) => {
    const token = localStorage.getItem('token');
    if (token === null) throw new Error('invalid token!');
    try {
      if (command.toLowerCase() === 'post') {
        await postTable(token, tableNumber, false);
      } else if (command.toLowerCase() === 'delete') {
        await deleteTable(token, tableNumber, false);
      } else {
        throw new Error('check command');
      }
    } catch (error) {
      ErrorHandler(error);
    }
    setRefresh(!refresh)
  }
  
  const TableComponent: React.FC<TableComponentProp> = ({ tableNumber, isOccupied }) => {
    return (
      <div onClick={() => {
        setCurrentTableFocusNumber(tableNumber); 
        handleTableFocusChange(tableNumber);
      }} className={`${currentTableFocusNumber === tableNumber ? 'bg-slate-300' : 'bg-white'} border-slate-300 border-t-[1px] flex-shrink-0 w-full h-[60px] flex justify-between place-items-center px-3 hover:bg-slate-100 hover:cursor-pointer`}>
        <div className="font-medium text-md text-black">Table {tableNumber}</div>
        <div className="p-1 px-2 text-sm">{isOccupied === 'false' ? 'available' : 'occupied'}</div>
        <section className="flex">
          <DeleteIcon onClick={() => {
            editTable('delete', tableNumber);
            setTimeout(() => {
              setCurrentTableFocus(-1);
              handleTableFocusChange(-1);
            }, 1000)
          }} />
        </section>
      </div>
    )
  }

  const navigate = useNavigate();
  const handleStaffBill = (tableNum: number) => {
    navigate(`/bill?table=${tableNum}`);
  }

  const TableDetailsComponent: React.FC<TableDetailsProps> = ({ tableNum, orders }) => {
    return (
      <>
        <section className="w-full flex justify-between place-items-center mb-[20px]">
          <div className="font-bold text-2xl">Table {tableNum} Info</div>
          <Button className="hover:bg-white hover:text-black hover:border-black hover:border-[1px]" 
            onClick={() => {
              setCurrentTableFocusNumber(-1);
              handleStaffBill(tableNum);
          }}>Handle Billing</Button>
        </section>
        <section className="flex flex-col gap-5 h-full">
          {orders.length === 0 ?
            <section className="flex flex-col items-center mt-10">
              <Lottie className="h-[200px]" animationData={OrderSVG} loop={true} />
              <div className="text-xl font-bold mt-5">
                Table {tableNum} does not have any orders yet.
              </div>
            </section>
            :
            <section className="flex flex-col gap-5">
              {orders.map((order, index) => (
              <div key={index} className="border-slate-300 border-[1px] p-3 rounded-lg">
                {/* <div className="text-slate-500">Order Number: {order.orderItems[0].orderNumber}</div> */}
                <div className="text-slate-500">Order Number: {orders.length > 0 && orders[0]?.orderItems[0]?.orderNumber}</div>
                <div className="text-slate-500 mb-3">Order Time: {order.orderTime.slice(0, 8)}</div>
                <div className="flex flex-col">
                  {/* order structure */}
                  {order.orderItems.map((orderItem, itemIndex) => (
                    <div key={itemIndex} className="border-slate-400 border-t-[1px] p-2 py-4 hover:bg-slate-200">
                      <section className="flex justify-between place-items-center">
                        <section className="flex flex-col">
                          <div className="font-bold">{getMenuName(orderItem.menuItemId)} x1</div>
                          <div>id: {orderItem.orderNumber}</div>
                        </section>
                        <div>{orderItem.status}</div>
                      </section>
                    </div>
                  ))}
                </div>
              </div>
              ))}
            </section>
          }
        </section>        
      </>
    )
  }

  const updateOrderStatusAPI = async (orderItemPk: number, newOrderStatus: string, currentOrderStatus: string) => {
    const token = localStorage.getItem('token');
    if (token === null) throw new Error('invalid token!')
    try {
      if (currentOrderStatus === 'PREPARED') {
        await updateOrderStatus(token, orderItemPk, newOrderStatus);
        setRefresh(!refresh);
      }
    } catch (error) {
      ErrorHandler(error);
    }
  }
  useEffect(() => {
    if (currentTableFocus !== -1) getTableOrderApi(currentTableFocus);
    getTableApi();
  }, [refresh]);

  useEffect(() => {
    setCurrentTableFocusNumber(-1);
  }, [mobileScreen])

  useEffect(() => {
    const intervalId = setInterval(() => {
      // always do polling for orders ready to be served
      setRefresh(!refresh);
      if (currentTableFocusNumber !== -1 && !assistanceModalOpened && !needAssistanceDialogOpenMobile && currentTableFocusNumber) {
        console.log('polling now')
        handleTableFocusChange(currentTableFocusNumber);
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [currentTableFocusNumber, allOrderItems, assistanceModalOpened, needAssistanceDialogOpen, needAssistanceDialogOpenMobile]);

  useEffect(() => {
    getAllOrderItemsApi();
  }, [refresh])

  useEffect(() => {
    setTableFocused(false);
  }, [mobileScreen])

  useEffect(() => {
    getTableOrderApi(currentTableFocus);
  }, [currentTableFocus])

  useEffect(() => {
    // placeholder function
  }, [menu, allOrderItems, structuredOrders]);

  return (
    <div className="bg-white overflow-y-hidden rounded-lg border border-slate-400 h-full flex">
      {/* ready orders */}
      <section className={`${desktopScreen ? 'border-r-[1px] border-slate-300' : 'hidden'} flex flex-col rounded-l-[10px] w-[600px] px-4 py-3 overflow-y-auto`}>
        <div className="font-bold text-medium">Orders ready to be served:</div>
        {allOrderItems.length === 0 &&
          <section className="h-[80%] flex justify-center flex-col items-center">
            <Lottie className="h-[200px]" animationData={NoOrder} loop={true} />
            <div>Looks like no orders are ready to be served.</div>
          </section>
        }
        {allOrderItems.map((order, index) => (
          // ready order components rendered
          <div key={index} className="border-slate-400 border-[1px] hover:bg-slate-100 mt-2 rounded-lg p-2 flex justify-between place-items-center">
            <section className="flex flex-col">
              <div className="text-sm">Order Name: {getMenuName(order.menu_item)}</div>
              <div className="text-sm">Order #{order.order}</div>
                <div className="text-slate-600 text-sm">Table Number: {order.table_number}</div>
            </section>
            <Button className="bg-slate-800 hover:bg-white hover:text-black hover:border-black hover:border-[1px] text-sm" onClick={() => {
              updateOrderStatusAPI(order.pk, 'SERVED', order.status);
            }}>Mark served</Button>
          </div>
        ))}
      </section>
            
      <section className="flex w-full h-full">
        <section className={`bg-white ${mobileScreen ? 'border-r-[1px] border-slate-300 w-[45%]' : 'w-full'}  flex flex-col px-5 py-3 h-full`}>
        
          <section className="flex justify-between">
            <section className="flex w-full justify-between place-items-center my-auto">

              {/* Tabs to switch between Table and Orders Ready */}
              <Tabs defaultValue="tables" className={`${desktopScreen ? 'hidden' : ''} w-full h-auto`}>
                <TabsList className={`${(tableFocused && !mobileScreen) ? 'hidden' : ''}`}>
                  <TabsTrigger value="tables">Tables</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="tables">
                  {tableFocused === false &&
                    <>
                      <span className="text-sm text-slate-500">All tables in your restaurant</span>
                      {/* shows all tables in the restaurant (mobile version) */}
                      <section className={`${desktopScreen ? 'hidden' : ''} `}>
                        <section className={`flex place-items-center gap-3 w-full justify-end`}>
                        <Dialog open={editTableDialogOpenMobile} onOpenChange={handleEditTableDialogOpenMobile}>
                          <DialogTrigger asChild>
                          <Button size="sm"
                              variant="outline"
                              className="h-7 gap-1 text-sm w-[100px]">Add Table</Button>

                            {/* <Button className="w-[40px] h-[25px] text-[12px] p-1">Edit</Button> */}
                          </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Add Table</DialogTitle>
                                <DialogDescription>
                                  More tables more money
                                </DialogDescription>
                              </DialogHeader>
                              <div className="gap-4 py-4">
                                <div className="flex w-full gap-4 place-items-center justify-start">
                                  <Label htmlFor="name" className="text-right w-1/2">
                                    Insert table number
                                  </Label>
                                  <Input value={newTableNumber} onChange={handleNewTableNumberChange} className="w-[50px]" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                </div>
                              </div>
                              <DialogFooter>

                              <Button className="mt-2" type="submit" onClick={() => {
                                editTable('post', newTableNumber);
                                handleEditTableDialogOpenMobile();
                                setRefresh(!refresh);
                              }}>Add table</Button>
                              </DialogFooter>
                            </DialogContent>
                        </Dialog>
                
                          <Dialog open={needAssistanceDialogOpenMobile} onOpenChange={() => {
                            setNeedAssistanceDialogOpenMobile(!needAssistanceDialogOpenMobile);
                            setAssistanceModalOpened(needAssistanceDialogOpenMobile);
                          }}>
                          <DialogTrigger asChild>
                            {/* <Button className="bg-blue-500">Need Assistance</Button> */}
                            
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 gap-1 text-sm w-[100px]"
                              >
                                {/* <File className="h-3.5 w-3.5" /> */}
                                <span className="sm:not-sr-only">Assistance</span>
                            </Button>
                          </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Tables that need assistance:</DialogTitle>
                                <DialogDescription>
                                  Fast bro later customers get mad
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex flex-col gap-3 px-0 h-[250px] overflow-y-auto">
                                <ViewTablesNeedingAssistance/>
                              </div>
                              <DialogFooter>
                                <Button className="bg-red-400" type="submit" onClick={() => setNeedAssistanceDialogOpenMobile(!needAssistanceDialogOpenMobile)}>Close</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </section>

                        <div className="w-full h-auto flex justify-between px-4 pb-4 text-slate-500 font-medium text-sm mt-[15px] pt-3">
                          <span>Table Number</span>
                          <span className="mr-[40px]">Status</span>
                          <span>Delete</span>
                        </div>
                        <section style={{ height: 'calc(100vh - 310px'}} className="flex flex-col overflow-y-auto">
                        {Object.entries(currentTables)
                          .filter(([key]) => key !== null && key !== undefined && key !== 'null')
                          .map(([key, val], index) => (
                            <TableComponent key={index} tableNumber={Number(key)} isOccupied={val.toString()} />
                          ))
                        }
                        </section>
                      </section>
                    </>}
                    {(tableFocused && !mobileScreen) && 
                      <>
                        <Button className="mb-5" onClick={() => {
                          setTableFocused(false);
                          setCurrentTableFocusNumber(-1);
                          setRefresh(!refresh);
                        }}>Back to tables</Button>
                        {currentTableFocus === -1 ?
                          <div className="flex flex-col place-items-center">
                            <div>Tap on the table to see its details</div>
                            <Lottie className="h-[200px]" animationData={TableDetail} loop={true} />
                          </div> :
                          <TableDetailsComponent tableNum={currentTableFocus} orders={structuredOrders}/>
                        }
                      </>
                    }
                </TabsContent>
                <TabsContent value="orders" style={{ height: 'calc(100vh - 190px'}} className="">
                  <span className="text-sm text-slate-500">All orders that are ready to be served</span>
                  {/* ready orders */}
                  {allOrderItems.length === 0 &&
                    <section className="flex justify-center flex-col items-center">
                      <Lottie className="h-[200px]" animationData={NoOrder} loop={true} />
                      <div>Looks like no orders are ready to be served.</div>
                    </section>
                  }
                  <section className={`${desktopScreen ? 'hidden' : ''} flex flex-col rounded-l-[10px] w-full mt-3 overflow-y-auto`}>
                    {allOrderItems.map((order, index) => (
                      // ready order components rendered
                      <div key={index} className="border-slate-400 border-[1px] hover:bg-slate-100 mt-2 rounded-lg p-2 flex justify-between place-items-center">
                        <section className="flex flex-col">
                          <div className="text-sm">Order Name: {getMenuName(order.menu_item)}</div>
                          <div className="text-sm">Order #{order.order}</div>
                            <div className="text-slate-600 text-sm">Table Number: {order.table_number}</div>
                        </section>
                        <Button className="bg-slate-800 hover:bg-white hover:text-black hover:border-black hover:border-[1px] text-sm" onClick={() => {
                          updateOrderStatusAPI(order.pk, 'SERVED', order.status);
                        }}>Mark served</Button>
                      </div>
                    ))}
                  </section>
                </TabsContent>
              </Tabs>
            </section>
          </section>

          {/* ================================================================================================================================================ */}

          {/* shows all tables in the restaurant */}
          <section className={`${desktopScreen ? '' : 'hidden'} `}>
            <section className={`flex place-items-center gap-3 w-full justify-end`}>
              <Dialog open={editTableDialogOpen} onOpenChange={handleEditTableDialogOpen}>
                <DialogTrigger asChild>
                <Button size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-sm w-[100px]">Add Table</Button>
                  {/* <Button className="w-[40px] h-[25px] text-[12px] p-1">Edit</Button> */}
                </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Table</DialogTitle>
                      <DialogDescription>
                        More tables more money
                      </DialogDescription>
                    </DialogHeader>
                    <div className="gap-4 py-4">
                      <div className="flex w-full gap-4 place-items-center justify-start">
                        <Label htmlFor="name" className="text-right w-1/2">
                          Insert table number
                        </Label>
                        <Input value={newTableNumber} onChange={handleNewTableNumberChange} className="w-[50px]" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                      </div>
                    </div>
                    <DialogFooter>

                    <Button className="mt-2" type="submit" onClick={() => {
                      editTable('post', newTableNumber);
                      handleEditTableDialogOpen();
                      setRefresh(!refresh);
                    }}>Add table</Button>
                    </DialogFooter>
                  </DialogContent>
              </Dialog>
              
              <Dialog open={needAssistanceDialogOpen} onOpenChange={() => {
                setNeedAssistanceDialogOpen(!needAssistanceDialogOpen);
                setAssistanceModalOpened(needAssistanceDialogOpen);
              }}>
              <DialogTrigger asChild>
                {/* <Button className="bg-blue-500">Need Assistance</Button> */}
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-sm w-[100px]"
                  >
                    {/* <File className="h-3.5 w-3.5" /> */}
                    <span className="sr-only sm:not-sr-only">Assistance</span>
                  </Button>
              </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Tables that need assistance:</DialogTitle>
                    <DialogDescription>
                      Click the assisted button to mark that a table has been assisted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 px-0 h-[250px] overflow-y-auto">
                    <ViewTablesNeedingAssistance/>
                  </div>
                  <DialogFooter>
                    <Button className="bg-red-400" type="submit" onClick={() => setNeedAssistanceDialogOpen(!needAssistanceDialogOpen)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </section>

            <div className="w-full h-auto flex justify-between px-4 pb-4  text-slate-500 font-medium text-sm mt-[15px] pt-3">
              <span>Table Number</span>
              <span className="mr-[40px]">Status</span>
              <span>Delete</span>
            </div>
            <section style={{ height: 'calc(100vh - 240px'}} className="flex flex-col overflow-y-auto">
              {Object.entries(currentTables)
                .filter(([key]) => key !== null && key !== undefined && key !== 'null')
                .map(([key, val], index) => (
                  <TableComponent key={index} tableNumber={Number(key)} isOccupied={val.toString()} />
                ))
              }
            </section>
          </section>
        </section>

        <section className={`${mobileScreen ? '' : 'hidden'} w-[55%] h-full flex flex-col p-5 overflow-y-auto`}>
          {currentTableFocusNumber === -1 ?
            <div style={{ height: 'calc(100vh - 220px'}} className="flex flex-col justify-center place-items-center my-auto">
              <Lottie className="h-[180px]" animationData={TableDetail} loop={true} />
              <div className="mt-[-30px]">Tap on the table to see its details</div>
            </div> :
            <TableDetailsComponent tableNum={currentTableFocusNumber} orders={structuredOrders}/>
          }
        </section>
      </section>
    </div>
  )
}

export default YourTable;