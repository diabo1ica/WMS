const OrderData = [
  {
    orderId: 1,
    orderItems: [
      {
        name: 'Salad', 
        specialReq: 'No sugar', 
        orderQty: 1,
        orderItemStatus: 'delivered'
      },
      {
        name: 'Curry Rice', 
        specialReq: 'No sugar', 
        orderQty: 3,
        orderItemStatus: 'delivered'
      },
      {
        name: 'Japanese Udon', 
        specialReq: 'Extra Spicy', 
        orderQty: 1,
        orderItemStatus: 'cooking'
      }
    ],
    orderStatus: 'delivered',
    orderTime: '22:48pm, 23 March 2024',
    tableNumber: 1,
  },
  { 
    orderId: 2, 
    orderItems: [ 
      {
        name: 'Sushi', 
        specialReq: 'Extra ginger', 
        orderQty: 4,
        orderItemStatus: 'delivered'
      }, 
      {
        name: 'Japanese Udon', 
        specialReq: 'Extra broth', 
        orderQty: 1,
        orderItemStatus: 'delivered'
      }, 
      {
        name: 'Burger', 
        specialReq: 'Extra pickles', 
        orderQty: 4,
        orderItemStatus: 'delivered'
      }, 
      {
        name: 'Japanese Udon', 
        specialReq: 'No green onions', 
        orderQty: 2,
        orderItemStatus: 'ready'
      }
    ], 
    orderTime: '13:03pm, 19 April 2024' ,
    tableNumber: 7,
  },
  { 
    orderId: 3, 
    orderItems: [ 
      {
        name: 'Curry Rice', 
        specialReq: 'No sugar', 
        orderQty: 4,
        orderItemStatus: 'delivered'
      }, 
      {
        name: 'Burger', 
        specialReq: 'Gluten free bun', 
        orderQty: 4,
        orderItemStatus: 'delivered'
      }, 
      {
        name: 'Japanese Udon', 
        specialReq: 'No green onions', 
        orderQty: 3,
        orderItemStatus: 'delivered'
      } ], 
      orderTime: '13:03pm, 30 March 2024',
      tableNumber: 10
    },
  { 
    orderId: 4, 
    orderItems: [ 
      {
        name: 'Pizza', 
        specialReq: 'Gluten free crust', 
        orderQty: 1,
        orderItemStatus: 'delivered'
      }, 
      {
        name: 'Salad', 
        specialReq: 'No sugar', 
        orderQty: 1,
        orderItemStatus: 'delivered'
      }, 
      {
        name: 'Burger', 
        specialReq: 'Vegan', 
        orderQty: 2,
        orderItemStatus: 'delivered'
      }, 
      {
        name: 'Burger', 
        specialReq: 'Extra pickles', 
        orderQty: 2,
        orderItemStatus: 'delivered'
      } 
    ], 
    orderTime: '13:03pm, 06 April 2024',
    tableNumber: 5,
  },
  { 
    orderId: 5, 
    orderItems: [ 
      {
        name: 'Burger', 
        specialReq: 'Vegan', 
        orderQty: 2,
        orderItemStatus: 'delivered'
      } 
    ], 
    orderTime: '13:03pm, 06 April 2024',
    tableNumber: 3,
  },
  { 
    orderId: 6, 
    orderItems: [ 
      {
        name: 'Pizza', 
        specialReq: 'No olives', 
        orderQty: 2,
        orderItemStatus: 'ready'
      }, 
      {
        name: 'Curry Rice', 
        specialReq: 'No sugar', 
        orderQty: 1,
        orderItemStatus: 'ready'
      }, 
      {
        name: 'Burger', 
        specialReq: 'Vegan', 
        orderQty: 3,
        orderItemStatus: 'ready'
      }, 
      {
        name: 'Japanese Udon', 
        specialReq: 'No green onions', 
        orderQty: 8,
        orderItemStatus: 'not ready'
      } 
    ], 
    orderTime: '13:03pm, 27 March 2024',
    tableNumber: 2,
  },
  { 
    orderId: 7, 
    orderItems: [ 
      {
        name: 'Salad', 
        specialReq: 'Extra dressing', 
        orderQty: 1,
        orderItemStatus: 'ready'
      }, 
      {
        name: 'Japanese Udon', 
        specialReq: 'Extra Spicy', 
        orderQty: 1,
        orderItemStatus: 'ready'
      }, 
      {
        name: 'Burger', 
        specialReq: 'No onions', 
        orderQty: 2,
        orderItemStatus: 'ready'
      }, 
      {
        name: 'Pizza', 
        specialReq: 'Extra cheese', 
        orderQty: 2,
        orderItemStatus: 'ready'
      }, 
      {
        name: 'Sushi', 
        specialReq: 'No wasabi', 
        orderQty: 3,
        orderItemStatus: 'cooking'
      }
    ], 
    orderTime: '13:03pm, 15 April 2024',
    tableNumber: 1,
  },
  { 
    orderId: 8, 
    orderItems: [ 
      {
        name: 'Japanese Udon', 
        specialReq: 'Extra Spicy', 
        orderQty: 1,
        orderItemStatus: 'cooking'
      }, 
      {
        name: 'Burger', 
        specialReq: 'No onions', 
        orderQty: 2,
        orderItemStatus: 'ready'
      } 
    ], 
    orderTime: '13:03pm, 22 April 2024',
    tableNumber: 8,
  },
]

export default OrderData;