from django.conf import settings
from typing import Any
from django.forms import ValidationError
from django.http.response import HttpResponse as HttpResponse
from django.views.generic import TemplateView
from django.contrib.auth import authenticate
from django.contrib.auth.forms import PasswordChangeForm
from requests import session
from django.http import HttpRequest, JsonResponse, QueryDict
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied, NotFound
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from stripe import Customer
from .serializers import CategorySerializer, OrderSerializer, OrderItemSerializer, CombinedRegistrationSerializer, MenuItemSerializer, StaffRegisterSerializer, TableSerializer, TablesNeedingAssistanceSerializer, CustomerSession as CustomerSessionSerializer
from .models import Category, Order, OrderItem, Restaurant, MenuItem, RestaurantUser, CustomerSession as CustomerSessionModel
from django.utils import timezone
from rest_framework.parsers import JSONParser

# An APIView that handles manager registration
# provided with the request parameters below creates a manager user,
# a restaurant and establishes a connection between the two in the database
# Request :
#   - email (string)       => an email string, also acts as the username
#   - password (string)    => a password string
#   - name (string)        => restaurant name
#   - location (string)    => restaurant location
#   - table_numbers (json) => assume empty on registration
# Request format example:
# {
#       "email": "wmscsad2024@gmail.com",
#       "password": "datadata",
#       "name": "wms",
#       "location": "wms",
#       "table_numbers": {}
# }
# Response :
#   - Returns status 201 and an object containing the user's token on success
#   - returns {'error': 'Authentication failed'} if user authentication fails
#   - returns error 400 on failure (e.g: username already exists)
class ManagerRegistrationAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CombinedRegistrationSerializer(data=self.request_parser(request.data))
        if (serializer.is_valid()):
            # Save manager and restaurant details
            serializer.create_manager()
            rest_id = serializer.create_restaurant().pk
            serializer.create_restaurant_user()

            username = request.data.get('email')
            password = request.data.get('password')
            # Authenticate user
            user = authenticate(username=username, password=password)
            name = user.restaurantuser.restaurant.name
            location = user.restaurantuser.restaurant.location

            # Create token if user is valid
            if user:
                # Creates a token if it does not exist for the user
                token, create = Token.objects.get_or_create(user=user)
                return Response({'token': token.key, 'restaurantId': rest_id, 'location': location, 'name': name}, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Authentication failed'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Parse the request for the serializer
    def request_parser(self, data):
        return {
            "manager": {
                "username": data.get('email'),
                "email": data.get('email'),
                "password": data.get('password')
            },
            "restaurant": {
                "name": data.get('name'),
                "location": data.get('location'),
                "table_numbers": {}
            }
        }

# Handles login procedure
# Request :
#   - username (string)    => an email string
#   - password (string)    => a password string
# Response :
#   - Returns status 200 and an object containing the user's token and restaurant details on success
#   - Returns status 401 and {'error': 'Invalid credentials'} on failed authentication
class LoginAPIView(APIView):
    pemission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        # If user is valid return token along with other fields needed by the frontend
        if user:
            token, created = Token.objects.get_or_create(user=user)
            rest_id = user.restaurantuser.restaurant.pk
            name = user.restaurantuser.restaurant.name
            location = user.restaurantuser.restaurant.location
            role = user.restaurantuser.user_role
            return Response({'token': token.key, 'restaurantId': rest_id, 'name': name, 'location': location, 'role': role}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Removes the token from a client's header
# Response:
#   - Returns status 200 on success
#   - Returns error status 401 for non authenticated users        
class LogoutAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # simply delete the token to force a logout
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)

# Checks the database whether a restaurant with the 
# provided parameters (name and location) exists or not
# Request :
#   - name (string)        => restaurant name
#   - location (string)    => restaurant location
# Response :
#   - Returns {'message': 'Restaurant exists.'} and status 200 if restaurant exists
#   - Returns {'error': 'Restaurant does not exist.'} and error status 404 if restaurant does not exist
class ValidRestaurantAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        name = request.query_params.get("name")
        location = request.query_params.get("location")

        existing_restaurant = self.check_existing_restaurant(name, location)

        if existing_restaurant:
            return Response({'restaurant_id': existing_restaurant.id}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Restaurant does not exist.'}, status=status.HTTP_404_NOT_FOUND)
    
    def check_existing_restaurant(self, name, location):
        try:
            existing_restaurant = Restaurant.objects.get(name=name, location=location)
            return existing_restaurant
        except Restaurant.DoesNotExist:
            return None

# Endpoint to retrieve restaurant details.
# Request:
#     - Method: GET
#     - Requires authentication
# Response:
#     - Status 200: Successful retrieval of restaurant details
#         - Returns restaurant name and location
#     - Status 401: Unauthorized
#         - Returns an error message if the user is not authenticated
class RestaurantDetails(APIView):
    def get(self, request):
        if sessionKey := request.session.session_key:
            try:
                cs = CustomerSessionModel.objects.get(session=sessionKey)
                restaurant = cs.restaurant
                return Response({'name': restaurant.name, 'location': restaurant.location, 'table_number': cs.table_number}, status=status.HTTP_200_OK)
            except CustomerSessionModel.DoesNotExist:
                return Response(status=404, data={'message': "You're customer session has ended already."})
            except CustomerSessionModel.MultipleObjectsReturned:
                return Response(status=500)
        if user := self.request.user:
            restaurant = user.restaurantuser.restaurant
            return Response({'name': restaurant.name, 'location': restaurant.location}, status=status.HTTP_200_OK)
        return Response({'error': 'Please log in or sign up first'})
        
# Only managers can create staff accounts therefore this endpoint is
# separated from the manager registration endpoint
# Request :
#   - email (string)       => an email string, also acts as the username
#   - password (string)    => a password string
#   - user_role (string)   => the role of the staff
# Response :
#   - Returns status 200 if registration is successful
#   - Returns {'error': 'Authentication failed'} and error status 400 if registration failed
#   - Returns {'error': 'Unauthorized role'} and error status 401 if the user accessing the endpoint does not have manager level access
class StaffRegister(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = self.request.user
        role = user.restaurantuser.user_role
        # Check user role
        if role == 'manager':
            restaurant = user.restaurantuser.restaurant
            staff_serializer = StaffRegisterSerializer(data=self.request_parser(request.data), context={'restaurant': restaurant})
            if (staff_serializer.is_valid()):
                staff_serializer.create_staff()
                staff_serializer.create_restaurant_user()
                return Response(status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Authentication failed'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Unauthorized role'}, status=status.HTTP_401_UNAUTHORIZED)
    
    def request_parser(self, data):
        return {
            "staff": {
                "username": data.get('email'),
                "email": data.get('email'),
                "password": data.get('password')
            },
            "user_role": data.get('user_role')
        }
    
# Assumes a logged in manager user level of authority
# { POST }
# Request:
#   - num (int)     => number of tables to be added if list is True, else creates table number {num} 
#   - list (bool)   => sets create behaviour
# Response :
#   - Returns status 200 if table creation is successful
#   - Returns {'error': 'Unauthorized role'} and error status 401 if the user accessing the endpoint does not have manager level access
#
# { GET }
# Query Params:
#   - num (int)     => number of the table to be checked
# Response :
#   - Returns the occupancy status of the table and status 200 if table exists
#   - Returns {'error': 'Unauthorized role'} and error status 401 if the user accessing the endpoint does not have manager level access
#
# { DELETE }
# Request :
#   - num (int)     => number of the table to be deleted
# Response :
#   - Returns status 200 if table deletion is successful
#   - Returns {'error': 'Table is occupied'} and status 400 if table is occupied
#   - Returns {'error': 'Table number does not exist'} and status 400 if table number does not exist
#   - Returns {'error': 'Unauthorized role'} and error status 401 if the user accessing the endpoint does not have manager level access
# If currently restaurant has no tables
# Then calling post if num = 3 and list = True, then the restaurant will have table_numbers = ['1': false, '2': false, '3: false']
# If calling delete when num = 2, then table_numbers = ['1': false, '3': false]
# If calling post if num = 2 and list = False or list not provided in request then table_numbers = ['1': false, '2': false, '3: false']
class UpdateTableList(APIView):
    def post(self, request):
        user = self.request.user
        role = user.restaurantuser.user_role
        if role == 'manager':
            restaurant = user.restaurantuser.restaurant
            current_table_numbers = restaurant.table_numbers or {}
            tables_to_add = request.data.get('num')
            if request.data.get('list'):
                current_size = len(current_table_numbers)
                for i in range(current_size, current_size + tables_to_add):
                    current_table_numbers[i] = False
                restaurant.table_numbers = current_table_numbers
                restaurant.save()
                return Response(status=status.HTTP_200_OK)
            elif not request.data.get('list'):
                table_number = request.data.get('num')
                restaurant.table_numbers[table_number] = False
                restaurant.save()
                return Response(status=status.HTTP_200_OK)
        return Response({'error': 'Unauthorized role'}, status=status.HTTP_401_UNAUTHORIZED)

    def get(self, request):
        user = self.request.user
        if hasattr(user, "restaurantuser"):
            restaurant = user.restaurantuser.restaurant
            serializer_instance = TableSerializer(restaurant)
            return Response(status=200, data=serializer_instance.data)
        else:
            return Response(status=401)
    
    def delete(self, request):
        user = self.request.user
        role = user.restaurantuser.user_role
        if role == 'manager':
            restaurant = user.restaurantuser.restaurant
            current_table_numbers = restaurant.table_numbers or {}
            table_number = str(request.data.get('num'))
            if table_number in current_table_numbers:
                if current_table_numbers[table_number] == True:
                    return Response({'error': 'Table is occupied'}, status=status.HTTP_400_BAD_REQUEST)
                del current_table_numbers[table_number]
                restaurant.table_numbers = current_table_numbers
                restaurant.save()
                return Response(status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Table number does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Unauthorized role'}, status=status.HTTP_401_UNAUTHORIZED)

# Endpoint to update the position of menu items within a category.
# Request:
#     - Method: POST
#     - Requires authentication
#     - Requires 'categoryId' and 'menuItems' in request data
# Response:
#     - Status 200: Successful update of menu item positions
#     - Status 401: Unauthorized
#         - Returns an error message if the user is not authenticated
#     - Status 404: Not Found
#         - Returns an error message if the requested menu item is not found
# Example Usage:
#   POST /api/menu/update_position/
#   {
#         "categoryId": 1,
#       "menuItems": [
#             {"menuItemId": 1, "newPosition": 2},
#           {"menuItemId": 2, "newPosition": 1}
#       ]
#   }
class UpdateMenuItemPosition(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = self.request.user
        if hasattr(user, "restaurantuser"):
            restaurant_instance = user.restaurantuser.restaurant
            category_id = request.data.get('categoryId')
            menu_list = request.data.get('menuItems')
            for item in menu_list:
                try:
                    menu_item = MenuItem.objects.get(restaurant=restaurant_instance, category__id=category_id, id=item['menuItemId'])
                except MenuItem.DoesNotExist:
                    raise NotFound("Menu Item not found")
                menu_item.position = item['newPosition']
                menu_item.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)

# Endpoint to update the position of categories.

# Request:
#     - Method: POST
#     - Requires authentication
#     - Requires 'categories' in request data, each containing 'categoryId' and 'newPosition'
# Response:
#     - Status 200: Successful update of category positions
#     - Status 401: Unauthorized
#         - Returns an error message if the user is not authenticated
#     - Status 404: Not Found
#         - Returns an error message if the requested category is not found
# Example Usage:
#     POST /api/category/update_position/
#     {
#         "categories": [
#             {"categoryId": 1, "newPosition": 2},
#             {"categoryId": 2, "newPosition": 1}
#         ]
#     }           
class UpdateCategoryPosition(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = self.request.user
        if hasattr(user, "restaurantuser"):
            restaurant_instance = user.restaurantuser.restaurant
            category_list = request.data.get('categories')
            for item in category_list:
                try:
                    category = Category.objects.get(restaurant=restaurant_instance, id=item['categoryId'])
                except Category.DoesNotExist:
                    raise NotFound("Category does not exist")
                category.position = item['newPosition']
                category.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)

# Endpoint to list all staff members associated with the restaurant.
# Request:
#     - Method: GET
#     - Requires authentication
#     - Requires the user to have the 'manager' role
# Response:
#     - Status 200: Successful retrieval of staff members
#         - Returns a list of staff members with their details
#     - Status 401: Unauthorized
#         - Returns an error message if the user is not authenticated or lacks the 'manager' role
class ListAllStaff(APIView):
    def get(self, request):
        user = self.request.user
        restaurant_user = user.restaurantuser
        role = restaurant_user.user_role
        if role == 'manager':
            response = []
            list = RestaurantUser.objects.filter(restaurant=restaurant_user.restaurant)
            for r_user in list:
                if r_user.user_role != 'manager':
                    res = {
                        'pk': r_user.user.pk,
                        'username': r_user.user.username,
                        'role': r_user.user_role
                    }
                    response.append(res)
            return Response({'Response': response}, status=status.HTTP_200_OK)
        return Response({'error': 'Unauthorized role'}, status=status.HTTP_401_UNAUTHORIZED)

# Takes table_number(int) and restaurnt(int) and searches for
# the relevant customer session
# Calling post will flip the boolean value of the CustomerSession's need_assistance field
# Calling get will obtain the state of the CustomerSession's need_assistance field 
class AssistanceAPIView(APIView):
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        table_number = request.data.get('table_number')
        restaurant_id = request.data.get('restaurant')
        try:
            q = CustomerSessionModel.objects.get(restaurant=restaurant_id, table_number=table_number)
            # Checks for valid session or valid staff account
            if request.session.session_key == q.session or hasattr(request.user, 'restaurantuser'):
                q.need_assistance = not q.need_assistance
                q.save()
                return Response(status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid session or staff'}, status=status.HTTP_401_UNAUTHORIZED)
        except CustomerSessionModel.DoesNotExist:
            return Response({'error': 'Invalid restaurant id or table number'}, status=status.HTTP_404_NOT_FOUND)
        
    def get(self, request):
        table_number = request.query_params.get('table_number')
        restaurant_id = request.query_params.get('restaurant')
        try:
            q = CustomerSessionModel.objects.get(restaurant=restaurant_id, table_number=table_number)
            # Checks for valid session or valid staff account
            if request.session.session_key == q.session or hasattr(request.user, 'restaurantuser'):
                return Response({'status': q.need_assistance}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid session or staff'}, status=status.HTTP_401_UNAUTHORIZED)
        except CustomerSessionModel.DoesNotExist:
            return Response({'error': 'Invalid restaurant id or table number'}, status=status.HTTP_404_NOT_FOUND)


# Endpoint to request or remove assistance without specific parameters like table number.
# Request:
#     - Method: POST (to request assistance), DELETE (to remove assistance)
#     - Requires Token Authentication
# Response:
#     - Status 200: Successful request for assistance (POST)
#         - Returns a message indicating that a call for assistance is in progress
#     - Status 201: Successful submission of assistance request (POST)
#         - Returns a message indicating that a call for assistance has been sent
#     - Status 204: Successful removal of assistance request (DELETE)
#         - Returns a message indicating that assistance status has been reassigned
#     - Status 401: Unauthorized
#         - Returns an error message if authentication fails
#     - Status 404: Not Found
#         - Returns an error message if a customer session or the requested table is not found
class AssistanceWithoutParamsView(APIView):
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        try:
            if q := CustomerSessionModel.objects.get(session=request.session.session_key):
                if (q.need_assistance):
                    return Response(status=200, data={'message': "You already have a call for assistance in progress. We'll be with you shortly."}) 
                q.need_assistance = True
                q.save()
                return Response(status=201, data={'message': "Your call for assistance has been sent. We'll be with you shortly."}) 
        except CustomerSessionModel.DoesNotExist:
            return Response(status=401, data={'message': 'You are not in a customer session at the moment.'})

    def delete(self, request):
        '''
            Staff makes a request to remove the assistance required for a table
        '''
        table_number = request.data.get('table_number')
        restaurant = request.user.restaurantuser.restaurant.pk
        # find the customer session with the table number
        try:
            cs = CustomerSessionModel.objects.get(table_number=table_number, restaurant=restaurant)
            if cs.need_assistance == False:
                return Response(status=404, data={'message': "Customer doesn't need assistance."})
            else:
                cs.need_assistance = False
                cs.save()
                return Response(status=204, data={'message': "Successfully reassigned customer's assistance status."})
        except CustomerSessionModel.DoesNotExist:
            return Response(status=404, data={'message': "Customer Session was not found. Please ask for another table."})

# Endpoint for staff members to view tables needing assistance.
# Request:
#     - Method: GET
#     - Requires Token Authentication
# Response:
#     - Status 200: Successful retrieval of tables needing assistance
#         - Returns a list of table numbers needing assistance
#     - Status 401: Unauthorized
#         - Returns an error message if authentication fails    
class StaffViewingAssistanceView(APIView):
    authentication_classes = [TokenAuthentication]

    def get(self, request):
        restaurant = request.user.restaurantuser.restaurant.pk
        customersNeedingHelp = CustomerSessionModel.objects.filter(restaurant=restaurant, need_assistance=True)
        # serialize the customersNeedingHelp
        data = TablesNeedingAssistanceSerializer(customersNeedingHelp, many=True).data
        processedData = []
        for t in data:
            processedData.append(t['table_number'])
        return Response(processedData, status=200)

class AllOrdersList(generics.ListAPIView):
    serializer_class = OrderSerializer
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'restaurantuser'):
            return Order.objects.none()
        else:
            restaurant = user.restaurantuser.restaurant
            return Order.objects.filter(customer_session__restaurant=restaurant).order_by('id')
        
    def list(self, request):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)

        order_list = []
        for order in queryset:
            order_serializer = OrderSerializer(order)
            order_items = OrderItem.objects.filter(order=order).order_by('menu_item__name')
            item_serializer = OrderItemSerializer(order_items, many=True)
            order_data = {
                'order': order_serializer.data,
                'order_items': item_serializer.data,
                'table_number': order.customer_session.table_number,
                'order_id': order.id
            }
            order_list.append(order_data)

        return Response(order_list, status=status.HTTP_200_OK)

class OrderList(generics.ListAPIView):
    serializer_class = OrderSerializer
    
    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, "restaurantuser"): # Customer placing order - filter order objects of customer session's table number
            session = self.request.session.session_key
            try:
                cs = CustomerSession.objects.get(session=session)
                return Order.objects.filter(cs).order_by('id')
            except CustomerSessionModel.DoesNotExist:
                return Response(status=404, data={'message': "Customer Session was not found. Please ask for another table."})
        else: # Staff member / manager has restaurantuser field - filter order objects of given table number
            table_number = self.request.query_params.get('table_number')
            restaurant = user.restaurantuser.restaurant
            if table_number == None or str(table_number) not in restaurant.table_numbers.keys():
                return Order.objects.none()
            return Order.objects.filter(customer_session__table_number=table_number).order_by('id')
        
    def list(self, request):
        '''
        If customer: return list of Order objects
        If wait staff: return list of order_data in the form
        order_data = {
            'order': Order obj,
            'order_items': [OrderItem obj, OrderItem obj1, etc...],
            'table_number': table number
            'order_id': order_id
        }
        '''
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)

        user = request.user
        order_list = []
        if hasattr(user, 'restaurantuser'):
            table_number = self.request.query_params.get('table_number')
            for order in queryset:
                order_serializer = OrderSerializer(order)
                order_items = OrderItem.objects.filter(order=order).order_by('menu_item__name')
                item_serializer = OrderItemSerializer(order_items, many=True)
                order_data = {
                    'order': order_serializer.data,
                    'order_items': item_serializer.data,
                    'table_number': table_number,
                    'order_id': order.id
                }
                order_list.append(order_data)
        else:
            order_list = OrderSerializer(queryset, many=True).data

        return Response(order_list, status=status.HTTP_200_OK)

class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, "restaurantuser"):
            session = self.request.session.session_key
            return Order.objects.filter(customer_session__session=session)
        else:
            restaurant = user.restaurantuser.restaurant
            return Order.objects.filter(customer_session__restaurant=restaurant)
    
    def get_object(self, request):
        pass
    
    def perform_update(self, serializer):
        instance = serializer.instance
        user = self.request.user
        if not hasattr(user, "restaurantuser"):
            raise ValidationError("You are not logged in.")
        else:
            restaurant = user.restaurantuser.restaurant
            if restaurant.id != instance.restaurant.id:
                raise ValidationError("Access denied")
            else:
                serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not hasattr(user, "restaurantuser"):
            raise ValidationError("You are not logged in.")
        else:
            restaurant = user.restaurantuser.restaurant
            if restaurant.id != instance.restaurant.id:
                raise ValidationError("Access denied")
            else:
                instance.delete()

class CategoryList(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'restaurantuser'):
            try:
                restaurant = CustomerSessionModel.objects.get(session=self.request.session.session_key).restaurant
            except CustomerSessionModel.DoesNotExist:
                raise NotFound("Customer Session not found, cannot find restaurant")
        else:
            restaurant = user.restaurantuser.restaurant
        if not Restaurant.objects.filter(id=restaurant.id).exists():
            raise ValidationError("Invalid restaurant")
        else:
            return Category.objects.filter(restaurant=restaurant).order_by('position')

    # wrapping the ListCreateAPIView's post request with a modification to the request to have the restaurant data passed in
    def post(self, request, *args, **kwargs):
        user = request.user
        if not hasattr(user, 'restaurantuser'):
            raise PermissionDenied("You are not a staff member.")
        elif user.restaurantuser.user_role != "manager":
            raise AuthenticationFailed("You are not a manager.")
        else:
            restaurant = user.restaurantuser.restaurant
            request.data['restaurant'] = restaurant.id
            return super().post(request, *args, **kwargs)

class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    # queryset is all Category instances belonging to the restaurant of the User
    def get_queryset(self):
        # get the restaurant of the staff member or customer
        user = self.request.user
        if not hasattr(user, 'restaurantuser'):
            try:
                restaurant = CustomerSessionModel.objects.get(session=self.request.session.session_key).restaurant
            except CustomerSessionModel.DoesNotExist:
                raise NotFound("Customer Session not found, cannot find restaurant")
        else:
            restaurant = user.restaurantuser.restaurant
        # check the restaurant exists
        if not Restaurant.objects.filter(id=restaurant.id).exists():
            raise ValidationError('Invalid restaurant')
        else:
            return Category.objects.filter(restaurant=restaurant)

    def get_serializer(self, *args, **kwargs): # line 66 of mixins.py (UpdateModelMixin)
        # remove the restaurant from data so that we can't change which restaurant the category belongs to
        if 'data' in kwargs:
            data = kwargs['data']
            data.pop('restaurant', None)
        return super().get_serializer(*args, **kwargs)

    # override to ensure that we have a manager AND that the instance belongs to the restaurant of the manager
    def perform_update(self, serializer):
        instance = serializer.instance
        user = self.request.user
        if not hasattr(user, "restaurantuser"):
            raise PermissionDenied("You are not logged in.")
        elif user.restaurantuser.user_role != "manager":
            raise AuthenticationFailed("You are not a manager.")
        else:
            restaurant = user.restaurantuser.restaurant
            if restaurant.id != instance.restaurant.id:
                raise AuthenticationFailed("Access denied")
            else:
                serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not hasattr(user, "restaurantuser"):
            raise PermissionDenied("You are not logged in.")
        elif user.restaurantuser.user_role != "manager":
            raise AuthenticationFailed("You are not a manager.")
        else:
            restaurant = user.restaurantuser.restaurant
            if restaurant.id != instance.restaurant.id:
                raise AuthenticationFailed("Access denied")
            else:
                self.update_position(instance)
                instance.delete()
    
    def update_position(self, instance):
        restaurant = instance.restaurant
        for i in range(instance.position + 1, restaurant.num_categories + 1):
            try:
                category = Category.objects.get(restaurant=restaurant, position=i)
            except Category.DoesNotExist:
                raise NotFound("Category Does not exist")
            category.position -= 1
            category.save()
        restaurant.num_categories -= 1
        restaurant.save()

class OrderItemList(generics.ListCreateAPIView):
    serializer_class = OrderItemSerializer
    authentication_classes = [SessionAuthentication]

    def get_queryset(self):
        '''
        If user is customer, get queryset of OrderItem objects associated with their table number.
        If user is staff member, table number should be given through query parameter to fetch order items of given table
        '''
        # print('reached')
        user = self.request.user
        if not hasattr(user, "restaurantuser"):
            session = self.request.session.session_key
            try:
                table_number = CustomerSessionModel.objects.get(session=session).table_number
            except CustomerSessionModel.DoesNotExist:
                raise NotFound("Customer Session not found, cannot find table number")
            return OrderItem.objects.filter(order__customer_session__table_number=table_number).order_by('order__id')
        else:
            restaurant = user.restaurantuser.restaurant
            return OrderItem.objects.filter(order__customer_session__restaurant=restaurant).order_by('order__id')
        
    def list(self, request):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)
        
        user = request.user
        order_item_list = []
        if not hasattr(user, 'restaurantuser'):
            for item in queryset:
                order_data = {
                    'order_item': OrderItemSerializer(item).data,
                    'order_time': item.order.order_time
                }
                order_item_list.append(order_data)
        else:
            order_item_list = OrderItemSerializer(queryset, many=True).data
        
        return Response(order_item_list, status=status.HTTP_200_OK)
        
class OrderItemDetail(generics.UpdateAPIView):
    serializer_class = OrderItemSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, "restaurantuser"):
            session = self.request.session.session_key
            OrderItem.objects.filter(order__customer_session__session=session)
        else:
            restaurant = user.restaurantuser.restaurant
            return OrderItem.objects.filter(order__customer_session__restaurant=restaurant)
        
    def perform_update(self, serializer):
        instance = serializer.instance
        user = self.request.user
        # you're not a staff
        if not hasattr(user, "restaurantuser"):
            raise PermissionDenied("You are not logged in.")
        else:
            restaurant = user.restaurantuser.restaurant
            new_status = serializer.validated_data.get('status')

            if instance.order.customer_session.restaurant != restaurant:
                raise AuthenticationFailed('Access denied')
            
            if new_status == 'SERVED':
                if instance.status != 'PREPARED':
                    raise ValidationError('Order item must be prepared before serving')
            
            serializer.save(status=new_status)
        
class PlaceOrderAPIView(APIView):
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        session = request.session.session_key
        if not CustomerSessionModel.objects.filter(session=session):
            return Response({'error': 'Invalid customer session'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            session_obj = CustomerSessionModel.objects.get(session=session)
        except CustomerSessionModel.DoesNotExist:
            raise NotFound("Customer Session not found")

        order_items = request.data.get('order_items')
        if not order_items:
            return Response({'error': 'Order items required'}, status=status.HTTP_400_BAD_REQUEST)
        
        order = Order.objects.create(customer_session=session_obj, order_time=timezone.now())
        for item in order_items:
            menu_item_pk = item['menu_item']
            quantity = item['quantity']

            try:
                self.is_valid(menu_item_pk, quantity)
            except ValidationError as error:
                return Response({'error': str(error)}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                menu_item_instance = MenuItem.objects.get(pk=menu_item_pk)
            except MenuItem.DoesNotExist:
                raise NotFound("Selected Menu item does not exist")
            for _ in range(quantity):
                OrderItem.objects.create(order=order, menu_item=menu_item_instance)
        
        return Response({'message': 'Order has been placed successfully'}, status=status.HTTP_200_OK)
    
    def is_valid(self, menu_item, quantity):
        if not MenuItem.objects.filter(pk=menu_item):
            raise ValidationError('Invalid menu item')
        elif int(quantity) <= 0:
            raise ValidationError('Invalid quantity')

class BillAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        session = self.request.session.session_key
        try:
            session_instance = CustomerSessionModel.objects.get(session=session)
        except CustomerSessionModel.DoesNotExist:
            raise NotFound("Customer Session not found")
        table_number = session_instance.table_number
        restaurant_instance = session_instance.restaurant
        orders = OrderItem.objects.filter(order__customer_session__table_number=table_number, order__customer_session__restaurant=restaurant_instance)

        if not orders:
            raise ValidationError('No orders found for table ', table_number)
        bill_total = sum(item.menu_item.price for item in orders)

        sort_orders = orders.order_by('menu_item__name')
        order_list = OrderItemSerializer(sort_orders, many=True).data

        return Response({
            'table_number': table_number,
            'order_list': order_list,
            'bill_total': bill_total,
        })
    
class StaffBillAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = self.request.user
        restaurant = user.restaurantuser.restaurant
        table_number = request.query_params.get('table_number')
        orders = OrderItem.objects.filter(order__customer_session__table_number=table_number, order__customer_session__restaurant=restaurant)

        if not orders:
            raise ValidationError('No orders found for table ', table_number)
        bill_total = sum(item.menu_item.price for item in orders)

        sort_orders = orders.order_by('menu_item__name')
        order_list = OrderItemSerializer(sort_orders, many=True).data

        return Response({
            'table_number': table_number,
            'order_list': order_list,
            'bill_total': bill_total,
        })


class MenuItemList(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    authentication_classes = [SessionAuthentication, TokenAuthentication]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'restaurantuser'):
            try:
                restaurant = CustomerSessionModel.objects.get(session=self.request.session.session_key).restaurant
            except CustomerSessionModel.DoesNotExist:
                raise NotFound("Customer Session not found, cannot find restaurant")
        else:
            restaurant = user.restaurantuser.restaurant
        if not Restaurant.objects.filter(id=restaurant.id).exists():
            raise ValidationError("Invalid restaurant")
        else:
            return MenuItem.objects.filter(restaurant=restaurant)

    # overriding later in the stack
    def create(self, request, *args, **kwargs):
        user = request.user
        if not hasattr(user, 'restaurantuser'):
            raise PermissionDenied("You are not a staff member.")
        elif user.restaurantuser.user_role != "manager":
            raise AuthenticationFailed("You are not a manager.")
        else:
            restaurant = user.restaurantuser.restaurant
            if (isinstance(request.data, QueryDict)):
                extended_data = QueryDict('', mutable=True)
                extended_data.update(request.data)
                extended_data['restaurant'] = restaurant.id
            else:
                extended_data = request.data
            serializer = self.get_serializer(data=extended_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class MenuItemDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemSerializer
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    parser_classes = [JSONParser]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'restaurantuser'):
            try:
                restaurant = CustomerSessionModel.objects.get(session=self.request.session.session_key).restaurant
            except CustomerSessionModel.DoesNotExist:
                raise NotFound("Customer Session not found, cannot find restaurant")
        else:
            restaurant = user.restaurantuser.restaurant
        if not Restaurant.objects.filter(id=restaurant.id).exists():
            raise ValidationError("Invalid restaurant")
        else:
            return MenuItem.objects.filter(restaurant=restaurant)

    def get_serializer(self, *args, **kwargs): # line 66 of mixins.py (UpdateModelMixin)
        # remove the restaurant from data so that we can't change which restaurant the menuitem belongs to
        if 'data' in kwargs:
            data = kwargs['data']
            data.pop('restaurant', None)
        return super().get_serializer(*args, **kwargs)

    def perform_update(self, serializer):
        instance = serializer.instance
        user = self.request.user
        # you're not a staff
        if not hasattr(user, "restaurantuser"):
            raise PermissionDenied("You are not logged in.")
        # you're not a manager
        elif user.restaurantuser.user_role != "manager":
            raise AuthenticationFailed("You are not a manager.")
        # other checks
        else:
            restaurant = user.restaurantuser.restaurant
            # the instance doesn't belong to you
            if restaurant.id != instance.restaurant.id:
                raise AuthenticationFailed("Access denied")
            # attempting to change category
            if newCategory := serializer.validated_data.get('category'):
                # the newCategory exists
                # if newCategory := Category.objects.get(id=newCategoryId):
                # it doesn't belong to the manager
                if not Category.objects.filter(id=newCategory.id).exists():
                    raise ValidationError("The new category doesn't exist.")
                elif newCategory.restaurant != restaurant:
                    raise AuthenticationFailed("Attempting to change the category to another restaurant's.")
            serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not hasattr(user, "restaurantuser"):
            raise PermissionDenied("You are not logged in.")
        elif user.restaurantuser.user_role != "manager":
            raise AuthenticationFailed("You are not a manager.")
        else:
            restaurant = user.restaurantuser.restaurant
            if restaurant.id != instance.restaurant.id:
                raise AuthenticationFailed("Access denied")
            else:
                self.update_position(instance)
                instance.delete()
    
    def update_position(self, instance):
        category = instance.category
        restaurant = instance.restaurant
        for i in range(instance.position + 1, category.num_menu_items + 1):
            try:
                menu_item = MenuItem.objects.get(restaurant=restaurant, category=category, position=i)
            except MenuItem.DoesNotExist:
                raise NotFound("MenuItem Does not exist")
            menu_item.position -= 1
            menu_item.save()
        category.num_menu_items -= 1
        category.save()

class CustomerSession(APIView):
    authentication_classes = [SessionAuthentication]
    # make a customer session
    def post(self, request):
        '''
        Given a restaurant pk and table number
        1. Create a session
        2. Either deny them (409) because that table is taken at that restaurant
        OR permit them because it's free (201) or the table belongs to their session (200)
        '''
        # if a session doesn't already exist create one
        if not request.session.session_key:
            request.session.create()
        
        session = request.session.session_key
        table_number = request.data.get('table_number')
        restaurant_id = request.data.get('restaurant')
        try:
            restaurant_instance = Restaurant.objects.get(pk=restaurant_id)
        except Restaurant.DoesNotExist:
            raise NotFound(f"Restaurant with id {restaurant_id} not found")
        
        # check if the table inside of restaurant_instance is available
        if tn := restaurant_instance.table_numbers.get(str(table_number)): # string conversion because json doesn't allow keys to be strings
            return Response(status=409, data={'Conflict': 'Your input table number is currently in use. By Restaurant instance.'})
        elif tn == None:
            return Response(status=404, data={'Not Found': "Your input table number isn't in the restaurant's available table numbers."})

        # if there's an existing order instance associated with their table
        try: 
            if q := CustomerSessionModel.objects.get(restaurant=restaurant_id, table_number=table_number):
                # it belongs to them
                if q.session == session:
                    # Update table occupancy state
                    if str(table_number) in restaurant_instance.table_numbers.keys():
                        restaurant_instance.table_numbers[str(table_number)] = True
                        restaurant_instance.save()
                    return Response(status=200, data={'Success': 'Reconnected to your existing session.'})
                # it doesn't
                else:
                    return Response(status=409, data={'Conflict': "Your input table number is currently in use. By CustomerSession instance."})
        except CustomerSessionModel.DoesNotExist:
            pass

        # they don't have an order instance
        CustomerSessionModel.objects.create(table_number=table_number, restaurant=restaurant_instance, session=session) 
        # Update table occupancy state
        if str(table_number) in restaurant_instance.table_numbers.keys():
            restaurant_instance.table_numbers[str(table_number)] = True
            restaurant_instance.save()
        return Response(status=201)

    # end a customer session
    def delete(self, request):
        '''
        If a session exists:
            if there's an order associated with it -> delete 200
            if there isn't an order associated with it -> 404
        else:
            -> 400 bad request
        
        Change the availability of the customer sessions in the Restaurant model
        '''
        # find the order instance associated with this session
        session = request.session.session_key
        if session:
            # delete it if it exists
            try:
                cs = CustomerSessionModel.objects.get(session=session)
            except CustomerSessionModel.DoesNotExist:
                return Response(status=404)
            except CustomerSessionModel.MultipleObjectsReturned:
                return Response(status=500)

            # get the table number of the customer
            table_number = cs.table_number
            # get the restaurant of the customer
            restaurant = cs.restaurant
            # change the table status of the restaurant so that the customer's table is available
            tables = restaurant.table_numbers
            tables[str(table_number)] = False
            restaurant.save()

            cs.delete() # should trigger cascade removing orders and order items
            return Response(status=200)
        else:
            # indicate that the response
            return Response(status=400, data={'message': 'Your are not in a customer session.'})

    # test to see that a customer session exists
    def get(self, request):
        '''
        there's a session and an order associated with it -> 200 { orderExists: True }
        there's a session and an order isn't associated with it -> 200 { orderExists: False }
        otherwise 404
        '''
        if request.session.session_key:
            q = CustomerSessionModel.objects.filter(session=request.session.session_key)
            # if there is a
            if q:
                return Response(status=200)
            else:
                return Response(status=404)
        return Response(status=404)

class StaffEndingSession(APIView):
    authentication_classes = [TokenAuthentication]
    def delete(self, request):
        table_number = request.data.get('table_number')
        restaurant = request.user.restaurantuser.restaurant
        try:
            cs = CustomerSessionModel.objects.get(table_number=table_number, restaurant=restaurant)
            tables = restaurant.table_numbers
            tables[str(table_number)] = False
            restaurant.save()
            cs.delete()
            return Response(status=200)
        except CustomerSessionModel.DoesNotExist:
            return Response(status=404)
        except CustomerSessionModel.MultipleObjectsReturned:
            return Response(status=500)


# Password Resetting
class CustomPasswordResetView(TemplateView):
    '''
    Custom password reset view parameterised on the url encoded parameters
    '''
    template_name = "tokenised_reset_password.html"
    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        context['token'] = kwargs.get('token')
        context['backendUrl'] = settings.BACKEND_URL
        return context


class CustomPasswordResetDoneView(TemplateView):
    '''
    Page to signify that password change was successful
    '''
    template_name = "reset_password_complete.html"
    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        context['frontendUrl'] = settings.FRONTEND_URL
        return context

class RequestDataWrapper:
    def __init__(self, request):
        self.request = request

    def __getitem__(self, key):
        return self.request.POST.get(key) or self.request.GET.get(key)
