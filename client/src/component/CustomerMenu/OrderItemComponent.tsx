import { useState, useEffect, useContext } from 'react';
import { Text, Heading, Card, CardBody, Stack, StackDivider, Box} from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getOrderItemsAsCustomer } from '@/api/OrderAjax';
import { customerGetMenuItem } from '@/api/MenuItemAjax';
import { SearchContext } from '@/UseContext';
import ErrorHandler from '@/Error';

interface OrderItemSpecific {
  order: number,
  menu_item: number,
  status: string
}

interface OrderItem {
  order_item: OrderItemSpecific,
  order_time: string,
}

interface orderItems {
  category: number,
  description: string,
  dietary_requirements: "DF" | "GF" | "V" | "VG" | "",
  name: string,
  pk: number,
  popular: boolean,
  preparation_time: number,
  price: string,
  restaurant: number,
  status:string,
  orderQty: number,
  order_time: string,
  timeDiff: number
}

interface OrderItemComponentProps {
  orderPlaced: boolean;
  setOrderPlaced: React.Dispatch<React.SetStateAction<boolean>>;
}

const OrderItemComponent: React.FC<OrderItemComponentProps> = () => {
  const { refresh } = useContext(SearchContext);

    const matches = useMediaQuery('(max-width: 640px)');
    const [orderItems, setOrderItems] = useState<orderItems[]>([]);
    // const { refresh, setRefresh } = useContext(SearchContext);
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();
    const handleRequestBill = () => {
      navigate('/bill');
    }

    useEffect(() => {
      buildViewOrder(); 
    }, [refresh]);

    const fetchOrderItems = async () => {
      try {
        const res = await getOrderItemsAsCustomer();
        if (res.ok) {
          const orderItemsData = await res.json();
          return orderItemsData;
        } else {
          throw new Error('Failed to fetch order items.')
        }
      } catch (error) {
        ErrorHandler(error);
      }
    }

    const getOrderItemsDetail = async(items: OrderItem[]) => {
      try {
        const promises = items.map(async (item) => {
          const response = await customerGetMenuItem(item.order_item.menu_item);
          const data = await response.json();
          data.status = item.order_item.status;
          data.order_time = item.order_time;
          return data;
        });
        const itemDetails = await Promise.all(promises);
        return itemDetails;
      } catch (error) {
        ErrorHandler(error);
      }
    }

    const buildViewOrder = async() => {
      try {
        const fetchedItem: OrderItem[] = await fetchOrderItems();
        const itemDetail = await getOrderItemsDetail(fetchedItem);
        if (itemDetail !== undefined) {
          const filteredData: orderItems[] = [];
          const itemMap = new Map<string, orderItems>();

          const currentTime = new Date();
          itemDetail.forEach(item => {
            const orderTimeParts = item.order_time.split(':');
            const orderHour = parseInt(orderTimeParts[0], 10) + 10;
            console.log(item.order_time + '     ' + orderHour);
            const orderMinute = parseInt(orderTimeParts[1], 10);
            console.log(orderMinute);
            const orderSecond = parseInt(orderTimeParts[2], 10);
    
            const orderTime = new Date();
            orderTime.setHours(orderHour);
            orderTime.setMinutes(orderMinute);
            orderTime.setSeconds(orderSecond);
            console.log(orderTime);

            let timeDiffInSec= (currentTime.getTime() - orderTime.getTime()) / 1000;

            // ensure time difference is positive
            if (timeDiffInSec < 0) {
              timeDiffInSec = 0;
            }
            const timeDiffInMin = Math.floor(timeDiffInSec / 60);
    
            item.timeDiff = timeDiffInMin;
            console.log(timeDiffInMin);

            const key = `${item.name}_${item.status}_${item.timeDiff}`;
            if (itemMap.has(key)) {
              const existingItem = itemMap.get(key);
              if (existingItem) {
                existingItem.orderQty += 1;
              }
            } else {
              itemMap.set(key, { ...item, orderQty: 1 });
            }
          });

          filteredData.push(...itemMap.values());
          setOrderItems(filteredData);
          setLoading(false); 
        }
        // setRefresh((prevRefresh) => !prevRefresh);
      } catch (error) {
        ErrorHandler(error);
      }
    }

    const getEstTime = (preparationTime: number, timeDiff: number) => {
      const estTime = preparationTime - timeDiff;
      if (estTime < 0) {
        return 0;
      } else {
        return estTime;
      }
    }

    return (
      <>
        {loading ? ( 
          <Text className='flex justify-center place-items-center m-2'>LOADING...</Text>
      ) : (
      <Card>     
      <CardBody>
      {orderItems.length === 0 ? (
          <Text>You have not place any order</Text>
        ) : (
        <Stack divider={<StackDivider />} spacing='4'>
            {orderItems.map((item, index) => (
            <Box key={index} className={`w-full flex ${matches ? 'flex-col' : 'flex-row'} justify-between`}>
              <div className='mr-5'>
                <Heading size='xs'>
                  {item.name}  X {item.orderQty}
                </Heading>
                <Text pt='2' fontSize='sm'>
                  ${(parseFloat(item.price) * item.orderQty).toFixed(2)}
                </Text>
              </div>
              {item.status === 'ORDER SENT' ? (
                <Text>Est. {getEstTime(item.preparation_time, item.timeDiff)} mins</Text>
              ) : (
                <Text>{item.status}</Text>
              )}
            </Box>
          ))}
        </Stack>
        )}
      </CardBody>
    </Card>
        )}
    <Button className='w-full mt-3' onClick={handleRequestBill}>Request Bill</Button>
    </>
  )
}

export default OrderItemComponent;