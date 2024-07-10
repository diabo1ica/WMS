from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Restaurant, MenuItem, OrderItem, Order, Category, CustomerSession
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
import json
from pathlib import Path
import base64

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = '/api/register/'
        self.login_url = '/api/login/'
        self.staff_register = '/api/staffregister/'
        self.list_staff = '/api/listallstaff/'
        self.logout_url = '/api/logout/'
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }
        self.data2 = {
            'email': 'teststaffuser@gmail.com', 
            'password': 'testpassword', 
            'user_role': 'waitstaff'
        }

        self.data3 = {
            'email': 'testusercase2@gmail.com', 
            'password': 'testpassword', 
            'name': 'name2', 
            'location': 'loc2', 
            'table_numbers': {}
        }
        self.data4 = {
            'email': 'testusercase2staff@gmail.com', 
            'password': 'testpassword',
            'user_role': 'waitstaff'
        }

    def test_signup(self):
        response = self.client.post(self.signup_url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)

    def test_login(self):
        self.client.post(self.signup_url, self.data, format='json')
        response = self.client.post(self.logout_url)
        self.client.post(self.signup_url, self.data3, format='json')
        response = self.client.post(self.logout_url)
        data = {'username': 'testuser@gmail.com', 'password': 'testpassword'}
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_staff_register(self):
        res = self.client.post(self.signup_url, self.data, format='json')
        token = res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        response = self.client.post(self.staff_register, self.data2, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_all_staff(self):
        # Create 1 manager and 1 staff in restaurant 1
        res = self.client.post(self.signup_url, self.data, format='json')
        token = res.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        self.client.post(self.staff_register, self.data2, format='json')

        # Create 1 manager and 1 staff in restaurant 2
        res2 = self.client.post(self.signup_url, self.data3, format='json')
        token = res2.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        register = self.client.post(self.staff_register, self.data4, format='json')
        self.assertEqual(register.status_code, status.HTTP_200_OK)

        info = {'username': 'testuser@gmail.com', 'password': 'testpassword'}
        res3 = self.client.post(self.login_url, info, format='json')
        token = res3.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)

        response = self.client.get(self.list_staff)
        self.assertIsNotNone(response)

class LogoutTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.logout_url = '/api/logout/'

    def test_logout(self):
        # Create a user and get their token
        user = User.objects.create_user(username='testuser@gmail.com', password='testpassword')
        token = Token.objects.create(user=user)

        # Attach the token to the client's headers
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        # Make a POST request to the logout endpoint
        response = self.client.post(self.logout_url)

        # Assert that the response is successful (HTTP 200 OK)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempt to retrieve the token from the database
        try:
            refreshed_token = Token.objects.get(key=token.key)
        except Token.DoesNotExist:
            refreshed_token = None

        # Assert that the token no longer exists in the database
        self.assertIsNone(refreshed_token)

class RestaurantTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = '/api/register/'
        self.valid_restaurant_url = '/api/valid-restaurant/'
        self.details = '/api/restaurant_details/'
        self.update_table_list = '/api/updatetables/'
        self.customer_session = '/api/customer/'
        self.update_url = '/api/updatetables/'
        self.table_assistance = '/api/tableassistance/'
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'namek', 
            'location': 'loca', 
            'table_numbers': {}
        }

    def test_valid_restaurant_exists(self):
        self.register = self.client.post(self.signup_url, self.data, format='json')
        params = {'name': 'namek', 'location': 'loca'}
        response = self.client.get(self.valid_restaurant_url, params)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_restaurant_details(self):
        self.register = self.client.post(self.signup_url, self.data, format='json')
        token = self.register.data['token']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        params = {'name': 'namek', 'location': 'loca'}
        response = self.client.get(self.details, params)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, params)
        # self.assertEqual(response.data.get('message'), 'Restaurant exists.')

    def test_valid_restaurant_not_exist(self):
        self.register = self.client.post(self.signup_url, self.data, format='json')
        params = {'name': 'Nah', 'location': 'Id Win'}
        response = self.client.get(self.valid_restaurant_url, params)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data.get('error'), 'Restaurant does not exist.')

    def test_update_tables(self):
        self.register = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.register.data['token'])

        # Add 3 tables
        num = {'num': 3, 'list': True}
        response = self.client.post(self.update_table_list, num, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        restaurant = Restaurant.objects.get(name='namek')
        self.assertEqual(len(restaurant.table_numbers), 3)

        # Add 1 table
        num = {'num': 4}
        response = self.client.post(self.update_table_list, num, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        restaurant = Restaurant.objects.get(name='namek')
        self.assertEqual(len(restaurant.table_numbers), 4)

        response = self.client.get(self.update_table_list, num, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Remove table 2
        num = {'num': 2}
        response = self.client.delete(self.update_table_list, num, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        restaurant = Restaurant.objects.get(name='namek')
        self.assertEqual(len(restaurant.table_numbers), 3)

    # As a customer
    def test_assistance_customer(self):
        manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + manager.data['token'])
        num = {'num': 3, 'list': True}
        self.client.post(self.update_url, num, format='json')
        self.client.post('/api/logout/')

        params = {'restaurant': 1, 'table_number': 1}
        self.client.post(self.customer_session, params, format='json')
        table_data = params
        response = self.client.get(self.table_assistance, table_data, format='json')

        self.client.post(self.table_assistance, table_data, format='json')
        response = self.client.get(self.table_assistance, table_data, format='json')
    
    def test_asssistance_customer_without_params(self):
        # register
        self.register = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.register.data['token'])

        # Add 3 tables
        num = {'num': 3, 'list': True}
        response = self.client.post(self.update_table_list, num, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # add a wait staff account
        waitStaffCreationResponse = self.client.post('/api/staffregister/', {'email': 'waitstaff@gmail.com', 'password': 'doubleupthepower', 'user_role': 'Wait'}, format='json')
        self.assertEqual(waitStaffCreationResponse.status_code, status.HTTP_200_OK)

        # logout
        self.client.post('/api/logout/')
        self.client.credentials(HTTP_AUTHORIZATION=None)
        
        # customer start session
        params = {'restaurant': 1, 'table_number': 1}
        responseWithCookie = self.client.post(self.customer_session, params, format='json')
        
        # we have to emulate the browser and pass in this cookie with every request going forward
        csCookie = responseWithCookie.cookies.get('sessionid')
        cookie_value = csCookie.output().split(';')[0].split(':')[1].strip()

        customerClient = APIClient()
        # make a request for assistance
        response = customerClient.post('/api/tableassistancewithoutparams/', content_type="application/json", HTTP_COOKIE=cookie_value)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # login as wait staff 
        waitStaffLogin = {'username': 'waitstaff@gmail.com', 'password': 'doubleupthepower'}
        waitStaffSignInResponse = self.client.post('/api/login/', data=waitStaffLogin, format='json')
        self.assertEqual(waitStaffSignInResponse.status_code, status.HTTP_200_OK)
        self.assertEqual(waitStaffSignInResponse.get('Content-Type'), 'application/json')
        waitStaffSignInResponseData = waitStaffSignInResponse.json()
        self.assertEqual(waitStaffSignInResponseData.get('role'), 'Wait')
        waitStaffToken = waitStaffSignInResponseData.get('token')
        self.assertIsNotNone(waitStaffToken)

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + waitStaffToken)
        # get the assistance required
        customersNeedingAssistanceResponse = self.client.get('/api/stafftableassistance/')
        self.assertEqual(customersNeedingAssistanceResponse.status_code, status.HTTP_200_OK)
        customersNeedingAssistanceData = customersNeedingAssistanceResponse.json()
        self.assertEqual(customersNeedingAssistanceData[0], 1)

        # delete the assistance required
        deleteResponse = self.client.delete('/api/tableassistancewithoutparams/', data={'table_number': 1}, format='json')
        self.assertEqual(deleteResponse.status_code, status.HTTP_204_NO_CONTENT)

        # the response from get should be null
        customersNeedingAssistanceResponse = self.client.get('/api/stafftableassistance/')
        self.assertEqual(customersNeedingAssistanceResponse.status_code, status.HTTP_200_OK)
        customersNeedingAssistanceData = customersNeedingAssistanceResponse.json()
        self.assertEqual(customersNeedingAssistanceData, [])

class PlaceOrderTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.place_order_url = '/api/placeorder/'
        self.customer_session = '/api/customer/'
        self.signup_url = '/api/register/'
        self.login_url = '/api/login/'
        self.update_url = '/api/updatetables/'
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }

    def test_place_order(self):
        manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + manager.data['token'])
        num = {'num': 3, 'list': True}
        self.client.post(self.update_url, num, format='json')
        self.client.post('/api/logout/')

        params = {'restaurant': 1, 'table_number': 1}
        customer = self.client.post(self.customer_session, params, format='json')
        restaurant_obj = Restaurant.objects.get(location='loc')
        category = Category.objects.create(name='hams', restaurant=restaurant_obj)
        menu_item = MenuItem.objects.create(name='steamed hams', description='mmm', price=12.99, category=category, dietary_requirements='VG', preparation_time=1, restaurant=restaurant_obj)
        order_items = {
            'order_items': [
                {'menu_item': 1, 'quantity': 1}
            ],
        }
        response = self.client.post(self.place_order_url, order_items, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_menu_item(self):
        manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + manager.data['token'])
        num = {'num': 3, 'list': True}
        self.client.post(self.update_url, num, format='json')
        #self.client.post('/api/logout/')

        params = {'restaurant': 1, 'table_number': 1}
        customer = self.client.post(self.customer_session, params, format='json')
        restaurant = Restaurant.objects.get(location='loc')
        category = Category.objects.create(name='snoopy', restaurant=restaurant)
        order_items = {
            'order_items': [
                {'menu_item': 1, 'quantity': 1}
            ]
        }
        response = self.client.post(self.place_order_url, order_items, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], "['Invalid menu item']")

    def test_invalid_quantity(self):
        manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + manager.data['token'])
        num = {'num': 3, 'list': True}
        self.client.post(self.update_url, num, format='json')
        self.client.post('/api/logout/')

        params = {'restaurant': 1, 'table_number': 1}
        customer = self.client.post(self.customer_session, params, format='json')
        restaurant_obj = Restaurant.objects.get(location='loc')
        category = Category.objects.create(name='hams', restaurant=restaurant_obj)
        menu_item = MenuItem.objects.create(name='steamed hams', description='mmm', price=12.99, category=category, dietary_requirements='VG', preparation_time=1, restaurant=restaurant_obj)
        order_items = {
            'order_items': [
                {'menu_item': 1, 'quantity': 0}
            ],
        }
        response = self.client.post(self.place_order_url, order_items, format='json')

        self.assertEqual(response.data['error'], "['Invalid quantity']")

class OrderListTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.place_order_url = '/api/placeorder/'
        self.customer_session = '/api/customer/'
        self.signup_url = '/api/register/'
        self.login_url = '/api/login/'
        self.update_url = '/api/updatetables/'
        self.order_url = '/api/orders/'
        self.order_item_url = '/api/orderitems/'
        self.bill = '/api/bill/'
        self.staff_bill = '/api/staffbill/'
        self.menupos = '/api/position/menuitem'
        self.categorypos = '/api/position/category'
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }
        self.manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.manager.data['token'])
        self.num = {'num': 7, 'list': True}
        self.client.post(self.update_url, self.num, format='json')
        self.restaurant_obj = Restaurant.objects.get(location='loc')

    def test_order_item_list_valid(self):
        self.client.post('/api/logout/')
        params = {'restaurant': 1, 'table_number': 1}
        customer = self.client.post(self.customer_session, params, format='json')
        category = Category.objects.create(name='hams', restaurant=self.restaurant_obj)
        MenuItem.objects.create(name='steamed hams', description='mmm', price=12.99, category=category, dietary_requirements='VG', preparation_time=1, restaurant=self.restaurant_obj)
        MenuItem.objects.create(name='steamed hams1', description='mmm1', price=12.99, category=category, dietary_requirements='V', preparation_time=11, restaurant=self.restaurant_obj)
        order_items = {
            'order_items': [
                {'menu_item': 1, 'quantity': 1},
                {'menu_item': 2, 'quantity': 2}
            ],
        }
        order_items2 = {
            'order_items': [
                {'menu_item': 2, 'quantity': 1}
            ]
        }
        self.client.post(self.place_order_url, order_items, format='json')
        self.client.post(self.place_order_url, order_items2, format='json')
        response = self.client.get(self.order_item_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

    def test_order_list_valid(self):
        params = {'restaurant': 1, 'table_number': 1}
        customer = self.client.post(self.customer_session, params, format='json')
        category = Category.objects.create(name='hams', restaurant=self.restaurant_obj)
        MenuItem.objects.create(name='steamed hams', description='mmm', price=12.99, category=category, dietary_requirements='VG', preparation_time=1, restaurant=self.restaurant_obj)
        MenuItem.objects.create(name='steamed hams1', description='mmm1', price=12.99, category=category, dietary_requirements='V', preparation_time=11, restaurant=self.restaurant_obj)
        order_items = {
            'order_items': [
                {'menu_item': 1, 'quantity': 1},
                {'menu_item': 2, 'quantity': 2}
            ],
        }
        order_items2 = {
            'order_items': [
                {'menu_item': 2, 'quantity': 1}
            ]
        }
        self.client.post(self.place_order_url, order_items, format='json')
        self.client.post(self.place_order_url, order_items2, format='json')
        response = self.client.get(self.order_url + '?table_number=1')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_invalid_table_num(self):
        params = {'restaurant': 1, 'table_number': 3}
        customer = self.client.post(self.customer_session, params, format='json')
        category = Category.objects.create(name='hams', restaurant=self.restaurant_obj)
        MenuItem.objects.create(name='steamed hams', description='mmm', price=12.99, category=category, dietary_requirements='VG', preparation_time=1, restaurant=self.restaurant_obj)
        order_items = {
            'order_items': [
                {'menu_item': 1, 'quantity': 1},
                {'menu_item': 2, 'quantity': 2}
            ],
        }
        self.client.post(self.place_order_url, order_items, format='json')
        response = self.client.get(self.order_url + '?table_number=3')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_bill(self):
        params = {'restaurant': 1, 'table_number': 1}
        customer = self.client.post(self.customer_session, params, format='json')
        category = Category.objects.create(name='hams', restaurant=self.restaurant_obj)
        MenuItem.objects.create(name='steamed hams', description='mmm', price=12.99, category=category, dietary_requirements='VG', preparation_time=1, restaurant=self.restaurant_obj)
        MenuItem.objects.create(name='steamed hams1', description='mmm1', price=12.99, category=category, dietary_requirements='V', preparation_time=11, restaurant=self.restaurant_obj)
        order_items = {
            'order_items': [
                {'menu_item': 1, 'quantity': 1},
                {'menu_item': 2, 'quantity': 2}
            ],
        }
        order_items2 = {
            'order_items': [
                {'menu_item': 2, 'quantity': 1}
            ]
        }
        self.client.post(self.place_order_url, order_items, format='json')
        self.client.post(self.place_order_url, order_items2, format='json')
        res = self.client.get(self.bill, format='json')
        res = self.client.get(self.bill, {'table_number': 1}, format='json')
        # print("Case staff", res.data)

class PositionTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.place_order_url = '/api/placeorder/'
        self.customer_session = '/api/customer/'
        self.signup_url = '/api/register/'
        self.login_url = '/api/login/'
        self.update_url = '/api/updatetables/'
        self.category = '/api/categories/'
        self.menuitem = '/api/menuitems/'
        self.menupos = '/api/position/menuitem'
        self.categorypos = '/api/position/category'
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }
        self.manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.manager.data['token'])
        self.num = {'num': 7, 'list': True}
        self.client.post(self.update_url, self.num, format='json')
        # Create 3 categories
        self.client.post('/api/categories/', {'name': 'hams'}, format='json')
        self.client.post('/api/categories/', {'name': 'grilled'}, format='json')
        self.client.post('/api/categories/', {'name': 'lisan al gaib'}, format='json')
        category = Category.objects.get(name='hams').id
        
        # Create 3 menu items in first category
        menu_item_1 = {
            "name": 'steamed hams',
            "description": 'description',
            "price": 12.99,
            "category": category,
            "dietary_requirements": 'VG',
            "preparation_time": 15
        }
        menu_item_2 = {
            "name": 'braised hams',
            "description": 'description',
            "price": 12.99,
            "category": category,
            "dietary_requirements": 'VG',
            "preparation_time": 15
        }
        menu_item_3 = {
            "name": 'hams al gaib',
            "description": 'description',
            "price": 12.99,
            "category": category,
            "dietary_requirements": 'VG',
            "preparation_time": 15
        }
        self.client.post(self.menuitem, menu_item_1, format='json')
        self.client.post(self.menuitem, menu_item_2, format='json')
        self.client.post(self.menuitem, menu_item_3, format='json')

    def test_position(self):
        # Initialize new position
        position_menu = {
            'categoryId': 1,
            'menuItems': [{
                'menuItemId': 1,
                'newPosition': 2,
            }, {
                'menuItemId': 2,
                'newPosition': 3,
            }, {
                'menuItemId': 3,
                'newPosition': 1,
            }]
        }
        position_category = {
            'categories': [{
                'categoryId': 1,
                'newPosition': 2,
            }, {
                'categoryId': 2,
                'newPosition': 3,
            }, {
                'categoryId': 3,
                'newPosition': 1,
            }]
        }

        # Call endpoints and update postions of Menu Items and Categories
        self.client.post(self.menupos, position_menu, format='json')
        self.client.post(self.categorypos, position_category, format='json')

        # response = self.client.get(self.menuitem)
        # res = []
        # for item in response.data:
        #     res.append(item['pk'])
        # self.assertEqual(res, [3, 1, 2])

        # Enforce position of current Categories
        response = self.client.get(self.category)
        res = []
        for item in response.data:
            res.append(item['pk'])
        self.assertEqual(res, [3, 1, 2])

        # add more menu items to second category
        menu_item_1 = {
            "name": 'steamed hams',
            "description": 'description',
            "price": 12.99,
            "category": 2,
            "dietary_requirements": 'VG',
            "preparation_time": 15
        }
        menu_item_2 = {
            "name": 'braised hams',
            "description": 'description',
            "price": 12.99,
            "category": 2,
            "dietary_requirements": 'VG',
            "preparation_time": 15
        }
        menu_item_3 = {
            "name": 'LISAN AL GAIB',
            "description": 'description',
            "price": 12.99,
            "category": 2,
            "dietary_requirements": 'VG',
            "preparation_time": 15
        }
        self.client.post(self.menuitem, menu_item_1, format='json')
        self.client.post(self.menuitem, menu_item_2, format='json')
        self.client.post(self.menuitem, menu_item_3, format='json')

        # Set up the menu items' new posstions
        position_menu = {
            'categoryId': 2,
            'menuItems': [{
                'menuItemId': 4,
                'newPosition': 2,
            }, {
                'menuItemId': 5,
                'newPosition': 3,
            }, {
                'menuItemId': 6,
                'newPosition': 1,
            }]
        }
        self.client.post(self.menupos, position_menu, format='json')
        response = self.client.get(self.menuitem)
        # res = []
        # for item in response.data:
        #     print("Category ", item['category'], " MenuItemId ", item['pk'], " Position ", item['position'])

    def test_position_delete(self):
        self.client.post('/api/categories/', {'name': 'LISAN AL GAIB'}, format='json')
        menu_item = {
            "name": 'steamed hams',
            "description": 'description',
            "price": 12.99,
            "category": 1,
            "dietary_requirements": 'VG',
            "preparation_time": 15
        }
        self.client.post(self.menuitem, menu_item, format='json')

        # Delete menu item and cetogory id 3
        self.client.delete(f'{self.menuitem}3/')
        self.client.delete(f'{self.category}3/')
        response = self.client.get(self.menuitem)

        # Assert that items in id 4 is moved to position 3
        res = []
        for item in response.data:
            # print("Category ", item['category'], " MenuItemId ", item['pk'], " Position ", item['position'])
            res.append((item['pk'], item['position']))
        self.assertEqual(res, [(1, 1), (2, 2), (4, 3)])

        # Assert that Category 4 is moved to position 3
        response = self.client.get(self.category)
        res = []
        for item in response.data:
            # print(item['pk'], " Position ", item['position'])
            res.append((item['pk'], item['position']))
        self.assertEqual(res, [(1, 1), (2, 2), (4, 3)])

class CategoryTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer_session = '/api/customer/'
        self.signup_url = '/api/register/'
        self.update_url = '/api/updatetables/'
        
        # create a manager account and 3 tables
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }
        self.manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.manager.data['token'])
        self.num = {'num': 3, 'list': True}
        self.client.post(self.update_url, self.num, format='json')
        self.restaurant = Restaurant.objects.get(location='loc')

        # for use as a customer
        self.customerClient = APIClient()

    def test_category_list_staff(self):
        category = Category.objects.create(name='doodoo', restaurant=self.restaurant)
        category2 = Category.objects.create(name='water', restaurant=self.restaurant)

        response = self.client.get('/api/categories/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_category_list_customer(self):
        response = self.client.post('/api/logout/') # logout of the staff session for good measure
        params = {'restaurant': 1, 'table_number': 1}

        # customer
        # extract the cookie that was sent back with the response
        responseWithCookie = self.customerClient.post(self.customer_session, params, format='json')
        csCookie = responseWithCookie.cookies.get('sessionid')
        cookie_value = csCookie.output().split(';')[0].split(':')[1].strip()

        # make the category for which the customer will fetch from
        category = Category.objects.create(name='cringe', restaurant=self.restaurant)

        # get the categories as a customer (that is include the cookie in the header)
        response = self.customerClient.get('/api/categories/', content_type="application/json", HTTP_COOKIE=cookie_value)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
class CategoryCreateRetrieveUpdateDestroyTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer_session = '/api/customer/'
        self.signup_url = '/api/register/'
        self.update_url = '/api/updatetables/'
        
        # create a manager account and 3 tables
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }
        self.manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.manager.data['token'])
        self.num = {'num': 3, 'list': True}
        self.client.post(self.update_url, self.num, format='json')
        self.restaurant = Restaurant.objects.get(location='loc')

        # for use as a customer
        self.customerClient = APIClient()

    def test_category_create(self):
        # create categories via the api and without passing in the restaurant id
        category1 = {'name': 'Wonton Soup'}
        response = self.client.post('/api/categories/', data=category1, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        category2 = {'name': 'Endangered sea turtle smoothies'}
        response = self.client.post('/api/categories/', data=category2, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_category_retrieve_as_manager_and_customer(self):
        '''
        Retrieve one category as a manager
        '''
        # make a category
        category1 = {'name': 'Wonton Soup'}
        self.client.post('/api/categories/', data=category1, format='json')
        # get the list as a manager (should just be one category)
        categoryListResponse = self.client.get('/api/categories/')
        categoryList = json.loads(categoryListResponse.content)
        # get the primary key of the only category we've added
        categoryPk = categoryList[0]['pk']

        # make the get request for a singular category
        categoryResponse = self.client.get(f'/api/categories/{categoryPk}/')
        self.assertEqual(categoryResponse.status_code, status.HTTP_200_OK)
        category = json.loads(categoryResponse.content)
        self.assertTrue(isinstance(category, dict))
        self.assertTrue("name" in category)
        self.assertEqual(category['name'], category1['name'])

        # same process but as a customer now
        params = {'restaurant': 1, 'table_number': 1}
        responseWithCookie = self.customerClient.post(self.customer_session, params, format='json')

        csCookie = responseWithCookie.cookies.get('sessionid')
        cookie_value = csCookie.output().split(';')[0].split(':')[1].strip()

        categoryResponse = self.customerClient.get(f'/api/categories/{categoryPk}/', HTTP_COOKIE=cookie_value)
        self.assertEqual(categoryResponse.status_code, status.HTTP_200_OK)
        category = json.loads(categoryResponse.content)
        self.assertTrue(isinstance(category, dict))
        self.assertTrue("name" in category)
        self.assertEqual(category['name'], category1['name'])
    
    def test_update_category_as_manager(self):
        '''
        Rewrite one category as a manager, attempts to change the restaurant of the category will be nullified
        '''
        category1 = {'name': 'Wonton Soup'}
        self.client.post('/api/categories/', data=category1, format='json')

        categoryListResponse = self.client.get('/api/categories/')
        categoryList = json.loads(categoryListResponse.content)
        # get the primary key of the only category we've added
        categoryPk = categoryList[0]['pk']
        categoryRestaurant = categoryList[0]['restaurant']
        # make a patch request renaming it and also attempting to change the restaurant
        newCategoryData = {'name': 'No longer Wonton Soup', 'restaurant': 40 }
        patchResponse = self.client.patch(f'/api/categories/{categoryPk}/', data=newCategoryData, format='json')
        # check that its response is ok
        self.assertEqual(patchResponse.status_code, status.HTTP_200_OK)

        # get the same category and assert that its name is different
        categoryResponse = self.client.get(f'/api/categories/{categoryPk}/')
        self.assertEqual(categoryResponse.status_code, status.HTTP_200_OK)
        categoryData = json.loads(categoryResponse.content)
        self.assertDictContainsSubset({'name': 'No longer Wonton Soup'}, categoryData)
        # check that the attempt to change the restaurant failed
        self.assertEqual(categoryData['restaurant'], categoryRestaurant)

        # make a patch request renaming it
        newCategoryData = {'name': 'No longer Wonton Soup nor'}
        patchResponse = self.client.patch(f'/api/categories/{categoryPk}/', data=newCategoryData, format='json')
        self.assertEqual(patchResponse.status_code, status.HTTP_200_OK)

        # assert that its name is different
        categoryResponse = self.client.get(f'/api/categories/{categoryPk}/')
        categoryData = json.loads(categoryResponse.content)
        self.assertEqual(categoryData['name'], 'No longer Wonton Soup nor')

    def test_post_category_as_customer(self):
        '''
        Rewrite one category as a customer, should be unauthorised
        '''
        response = self.customerClient.post('/api/categories/', data={'name': 'Free foods'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_category_as_manager(self):
        '''
        Delete category
        '''
        category1 = {'name': 'Wonton Soup'}
        self.client.post('/api/categories/', data=category1, format='json')

        categoryListResponse = self.client.get('/api/categories/')
        categoryList = json.loads(categoryListResponse.content)
        categoryPk = categoryList[0]['pk']

        deleteResponse = self.client.delete(f'/api/categories/{categoryPk}/')
        self.assertEqual(deleteResponse.status_code, status.HTTP_204_NO_CONTENT)
        
        getResponse = self.client.get(f'/api/categories/{categoryPk}/')
        self.assertEqual(getResponse.status_code, status.HTTP_404_NOT_FOUND)

class MenuItemTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cust_client = APIClient()
        self.customer_session = '/api/customer/'
        self.signup_url = '/api/register/'
        self.update_url = '/api/updatetables/'
        self.menu_item = '/api/menuitems/'
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }

        self.test_image_path = (
            Path(__file__).resolve().parent / "images_for_test/"
        )

        self.manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.manager.data['token'])
        self.num = {'num': 3, 'list': True}
        self.client.post(self.update_url, self.num, format='json')
        self.restaurant = Restaurant.objects.get(location='loc')
        category = Category.objects.create(name='cringe', restaurant=self.restaurant)
        firstMenuItem = MenuItem.objects.create(name='steamed hams', description='mmm', price=12.99, category=category, dietary_requirements='VG', preparation_time=1, restaurant=self.restaurant)
        MenuItem.objects.create(name='steamed hams1', description='mmm1', price=12.99, category=category, dietary_requirements='V', preparation_time=11, restaurant=self.restaurant)
        self.firstMenuItemPk = firstMenuItem.id
        self.firstMenuItemCategoryPk = category.id

    def test_menu_item_list_staff(self):
        response = self.client.get(self.menu_item)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_menu_item_list_customer(self):
        params = {'restaurant': 1, 'table_number': 1}
        cookie_response = self.cust_client.post(self.customer_session, params, format='json')
        csCookie = cookie_response.cookies.get('sessionid')
        cookie_value = csCookie.output().split(';')[0].split(':')[1].strip()

        response = self.cust_client.get(self.menu_item, content_type='application/json', HTTP_COOKIE=cookie_value)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_add_menu_item(self):
        '''
        Adding a menu item should only require your authentication details
        '''

        # get the pk of the category first
        categoriesResponse = self.client.get('/api/categories/')
        categories = categoriesResponse.data
        categoryPk = categories[0]['pk']
        with open(self.test_image_path / "lasagna.jpg", "rb") as lasagnaImage:
            # imageData = base64.b64encode(lasagnaImage.read()).decode('utf-8')
            newMenuItem = {
                'name': 'Lasagna',
                'description': 'Cheesy lasagna',
                'price': 12.5,
                'category': categoryPk,
                'dietary_requirement': 'VG',
                'preparation_time': 12,
                'popular': True,
                'image': lasagnaImage
            }
            postResponse = self.client.post(self.menu_item, data=newMenuItem)
            self.assertEqual(postResponse.status_code, status.HTTP_201_CREATED)

        with open(self.test_image_path / "nasi.jpg", "rb") as nasiLemakImage:
            # imageData = base64.b64encode(nasiLemakImage.read()).decode('utf-8')
            newMenuItem = {
                'name': 'NasiLemak',
                'description': 'Malaysian dish',
                'price': 12.5,
                'category': categoryPk,
                'dietary_requirement': 'VG',
                'preparation_time': 12,
                'popular': True,
                'image': nasiLemakImage
            }
            postResponse = self.client.post(self.menu_item, data=newMenuItem)
            self.assertEqual(postResponse.status_code, status.HTTP_201_CREATED)
        
        menuItemsResponse = self.client.get(self.menu_item)
        self.assertEqual(menuItemsResponse.status_code, status.HTTP_200_OK)
        self.assertEqual(len(menuItemsResponse.data), 4)

    def test_update_menu_item(self):
        '''
        Update the menu item without changing its category then with changing its category
        '''
        newMenuItem = {
            'name': 'Fruit Bowl',
            'description': 'Its fruit',
            'price': 5,
            'dietary_requirement': 'VG',
            'preparation_time': 12,
            'popular': True,
        }
        patchResponse = self.client.patch(f'/api/menuitems/{self.firstMenuItemPk}/', data=newMenuItem, format='json')
        self.assertEqual(patchResponse.status_code, status.HTTP_200_OK)

        new_category = Category.objects.create(name='yucky', restaurant=self.restaurant)
        patchCategory = self.client.patch(f'/api/menuitems/{self.firstMenuItemPk}/', data={'category': new_category.id}, format='json')
        self.assertEqual(patchCategory.status_code, status.HTTP_200_OK)

        menuItemsResponse = self.client.get(self.menu_item)
        self.assertEqual(menuItemsResponse.status_code, status.HTTP_200_OK)

        self.assertEqual(len(menuItemsResponse.data), 2)

        self.assertEqual(menuItemsResponse.data[0]['name'], 'Fruit Bowl')

    def test_update_menu_item_to_category_that_doesnt_belong_to_user(self):
        '''
        Update menu item category to a new category that doesn't belong to the restaurant
        '''
        restaurant_wrong = Restaurant.objects.create(name='sustaurant', location='sussyland', table_numbers={})
        category_wrong = Category.objects.create(name='wrong cat', restaurant=restaurant_wrong)
        newMenuItem = {
            'name': 'Fruit Bowl',
            'description': 'Its fruit',
            'price': 5,
            'category': category_wrong.id,
            'dietary_requirement': 'VG',
            'preparation_time': 12,
            'popular': True,
        }

        patchResponse = self.client.patch(f'/api/menuitems/{self.firstMenuItemPk}/', data=newMenuItem, format='json')
        self.assertEqual(patchResponse.status_code, status.HTTP_403_FORBIDDEN)

class OrderItemDetailTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cust_client = APIClient()
        self.customer_session = '/api/customer/'
        self.signup_url = '/api/register/'
        self.update_url = '/api/updatetables/'
        self.menu_item = '/api/menuitems/'
        self.place_order_url = '/api/placeorder/'
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }
        self.manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.manager.data['token'])
        self.num = {'num': 3, 'list': True}
        self.client.post(self.update_url, self.num, format='json')
        self.restaurant = Restaurant.objects.get(location='loc')
        category = Category.objects.create(name='cringe', restaurant=self.restaurant)
        menu = MenuItem.objects.create(name='steamed hams', description='mmm', price=12.99, category=category, dietary_requirements='VG', preparation_time=1, restaurant=self.restaurant)
        MenuItem.objects.create(name='steamed hams1', description='mmm1', price=12.99, category=category, dietary_requirements='V', preparation_time=11, restaurant=self.restaurant)
        params = {'restaurant': 1, 'table_number': 1}
        self.cust_client.post(self.customer_session, params, format='json')

    def test_update_order_status(self):
        order_items = {
            'order_items': [
                {'menu_item': 1, 'quantity': 1}
            ],
        }
        self.cust_client.post(self.place_order_url, order_items, format='json')
        new_status = {'status': 'PREPARED'}
        response = self.client.patch('/api/orderitems/1/', data=new_status, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        patched_order = self.cust_client.get('/api/orderitems/')
        self.assertEqual(patched_order.data[0]['order_item']['status'], 'PREPARED')

class CustomerSessionTest(TestCase):
    def setUp(self):
        self.manager = APIClient()
        self.customer = APIClient()
        
        # make a manager account
        data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }
        response = self.manager.post('/api/register/', data, format='json')
        self.manager.credentials(HTTP_AUTHORIZATION='Token ' + response.data['token'])
        # give it some tables
        data = {'num': 3, 'list': True}
        self.manager.post('/api/updatetables/', data, format='json')
        self.assertEqual(len(Restaurant.objects.get().table_numbers.keys()), 3)
        self.assertEqual(list(Restaurant.objects.get().table_numbers.values())[0], False)
        self.assertEqual(list(Restaurant.objects.get().table_numbers.values())[1], False)
        self.assertEqual(list(Restaurant.objects.get().table_numbers.values())[2], False)

    def test_customer_start_and_end(self):
        oneAndOnlyRestaurant = Restaurant.objects.get()
        # make a customer session with the restaurant's table
        params = {'restaurant': oneAndOnlyRestaurant.id, 'table_number': 1}
        cookie_response = self.customer.post('/api/customer/', params, format='json')
        self.assertEqual(cookie_response.status_code, status.HTTP_201_CREATED)
        csCookie = cookie_response.cookies.get('sessionid')
        cookie_value = csCookie.output().split(';')[0].split(':')[1].strip()

        # check that the json field in the restaurant reflects this new change in availability of tables
        oneAndOnlyRestaurant = Restaurant.objects.get()
        tableStatuses = oneAndOnlyRestaurant.table_numbers
        self.assertTrue(tableStatuses['1'])

        # finish the customer session
        response = self.customer.delete('/api/customer/', HTTP_COOKIE=cookie_value)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # check that the json field in the restaurant reflects this new change in availability of tables
        oneAndOnlyRestaurant = Restaurant.objects.get()
        tableStatuses = oneAndOnlyRestaurant.table_numbers
        self.assertFalse(tableStatuses['1'])


    def test_staff_ends_customer_session(self):
        oneAndOnlyRestaurant = Restaurant.objects.get()
        # make a customer session with the restaurant's table
        params = {'restaurant': oneAndOnlyRestaurant.id, 'table_number': 1}
        cookie_response = self.customer.post('/api/customer/', params, format='json')
        csCookie = cookie_response.cookies.get('sessionid')
        cookie_value = csCookie.output().split(';')[0].split(':')[1].strip()

        # the manager ends the customer session
        response = self.manager.delete('/api/staff-ending-customer/', data={'table_number': 1}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # check that the json field in the restaurant reflects this new change in availability of tables
        oneAndOnlyRestaurant = Restaurant.objects.get()
        tableStatuses = oneAndOnlyRestaurant.table_numbers
        self.assertFalse(tableStatuses['1'])



class StripeTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = '/api/register/'
        self.place_order_url = '/api/placeorder/'
        self.customer_session = '/api/customer/'
        self.update_url = '/api/updatetables/'
        self.order_url = '/api/orders/'
        self.order_item_url = '/api/orderitems/'

        self.express = '/api/v1/accounts/'
        self.link = '/api/v1/account_links/'
        self.check = '/api/v1/account_check/'
        self.checkout = '/api/v1/checkout/'
        self.data = {
            'email': 'testuser@gmail.com', 
            'password': 'testpassword', 
            'name': 'name', 
            'location': 'loc', 
            'table_numbers': {}
        }
        self.manager = self.client.post(self.signup_url, self.data, format='json')
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.manager.data['token'])

        self.num = {'num': 7, 'list': True}
        self.client.post(self.update_url, self.num, format='json')
        self.restaurant_obj = Restaurant.objects.get(location='loc')
    
    def test_create_acc(self):
        response = self.client.post(self.express)
        # print(response)
        response = self.client.post(self.link)
        # print(response)
        response = self.client.get(self.check)
        # print(response)

    # def test_checkout(self):
    #     self.client.post(self.express)
    #     self.client.post(self.link)
    #     self.client.get(self.check)
    #     #self.client.post('/api/logout/')

    #     params = {'restaurant': 1, 'table_number': 1}
    #     customer = self.client.post(self.customer_session, params, format='json')
    #     category = Category.objects.create(name='hams', restaurant=self.restaurant_obj)
    #     MenuItem.objects.create(name='steamed hams', description='mmm', price=12.99, category=category, dietary_requirements='VG', preparation_time=1, restaurant=self.restaurant_obj)
    #     MenuItem.objects.create(name='steamed hams1', description='mmm1', price=12.99, category=category, dietary_requirements='V', preparation_time=11, restaurant=self.restaurant_obj)
    #     order_items = {
    #         'order_items': [
    #             {'menu_item': 1, 'quantity': 1},
    #             {'menu_item': 2, 'quantity': 2}
    #         ],
    #     }
    #     order_items2 = {
    #         'order_items': [
    #             {'menu_item': 2, 'quantity': 1}
    #         ]
    #     }
    #     self.client.post(self.place_order_url, order_items, format='json')
    #     self.client.post(self.place_order_url, order_items2, format='json')
    #     res = self.client.post(self.checkout, format='json')
    #     print("Checkout", res.data)