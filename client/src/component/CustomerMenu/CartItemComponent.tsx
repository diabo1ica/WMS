import ItemAmount from '@/component/CustomerMenu/ItemAmount';
import { useState, useContext, useEffect } from 'react';
import { Text, Heading, Card, CardBody, Stack, StackDivider, Box} from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@mui/material';
import { useCart } from '@/component/CustomerMenu/CartContext';
import { placeOrder } from '@/api/OrderAjax';
import { SearchContext } from '@/UseContext';

import ErrorHandler from '@/Error';

interface OrderItem {
  menu_item: number;
  quantity: number;
}

interface CartItemComponentProps {
  setOrderPlaced: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartItemComponent: React.FC<CartItemComponentProps> = ({ setOrderPlaced }) => {
  const matches = useMediaQuery('(max-width: 640px)');

  const { cartItems, amountChanges, clearCart } = useCart();
  const { refresh, setRefresh } = useContext(SearchContext);

  const [amounts, setAmounts] = useState<{ [key: number]: number }>({});

  const amountChange = (itemId: number, newAmount: number) => {
    setAmounts(prevAmounts => ({ ...prevAmounts, [itemId]: newAmount }));
    amountChanges({ uniqueKey: 0, pk:itemId, name: '', price: 0, amount: newAmount });
  };
  
  const handlePlaceOrder = async () => {
    try {
      if (cartItems.length === 0) return;

      const itemsToOrder:OrderItem[] = cartItems.map(item => ({
        menu_item: item.pk,
        quantity: item.amount,
      }));

      await placeOrder(itemsToOrder);
      setRefresh(!refresh);
      clearCart();
      setOrderPlaced(true);

    } catch (error) {
      ErrorHandler(error);
    }
  }

  useEffect(() => {
    // placeholder function
  }, [refresh]);

  return (
      <>
      <Card>     
      <CardBody>
      {cartItems.length === 0 ? (
          <Text>No items in the cart</Text>
        ) : (
        <Stack divider={<StackDivider />} spacing='4'>
          {cartItems.map((item) => (
            <Box key={item.pk} className={`w-full flex ${matches ? 'flex-col' : 'flex-row'} justify-between`}>
              <div className='mr-5'>
                <Heading size='xs'>
                  {item.name}
                </Heading>
                <Text pt='2' fontSize='sm'>
                  ${item.price}
                </Text>
              </div>
              <ItemAmount 
                amount={amounts[item.pk] || item.amount}
                onChange={(newAmount) => amountChange(item.pk, newAmount)}/>
            </Box>
          ))}
        </Stack>
        )}
      </CardBody>
    </Card>
    <Button className='w-full mt-3' onClick={handlePlaceOrder}>Place Order</Button>
    </>
  )
}

export default CartItemComponent;