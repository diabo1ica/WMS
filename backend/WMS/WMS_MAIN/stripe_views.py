from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponseRedirect
from rest_framework import status
from django.urls import reverse
from .serializers import StripeUserSerializer, OrderItemSerializer
from .models import RestaurantUser, OrderItem, CustomerSession as CustomerSessionModel
from rest_framework.exceptions import NotFound, ValidationError
import stripe
from django.contrib.sites.shortcuts import get_current_site

import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))
stripe.api_key = os.getenv("STRIPE_KEY")

# curl -X POST http://127.0.0.1:8000/api/register/ -d "email=stripetest@gmail.com&password=stripetest&name=stripe&location=stripe" 
# curl -X POST http://127.0.0.1:8000/api/login/ -d "username=stripetest@gmail&password=stripetest" 
# curl -X POST http://127.0.0.1:8000/api/v1/accounts/

class StripeAccountExpress(APIView):
    def post(self, request):
        if hasattr(self.request.user, "stripeuserdata"):
            return Response({'message': "User already has a stripe account"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            response = stripe.Account.create(type="express")
        except stripe.error.StripeError as e:
            # Handle any errors that occur during the API request
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)
        serializer = StripeUserSerializer(data={'stripe_id': response['id']}, context={'user': self.request.user})
        if serializer.is_valid():
            serializer.save()
            # we get the current site to get the domain
            current_site = get_current_site(request)
            link_url = reverse('stripe-account-link')

            # we get the refresh and return url
            account_link_url = f'https://{current_site.domain}{link_url}'
            return HttpResponseRedirect(account_link_url)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StripeAccountLink(APIView):
    def post(self, request):
        user = self.request.user
        if not hasattr(user, "stripeuserdata"):
            return Response({'error': 'create stripe account first'}, status=status.HTTP_400_BAD_REQUEST)

        # we get the current site to get the domain
        current_site = get_current_site(request)

        # we get the refresh and return url
        domain_url = f'https://{current_site.domain}'
        refresh = f'{domain_url}/api/v1/account_links/'

        response = stripe.AccountLink.create(
            account=user.stripeuserdata.stripe_id,
            refresh_url=refresh,
            return_url=domain_url,
            type="account_onboarding",
        )
        return HttpResponseRedirect(response.url)
    
# TODO: Use stripe.Account.retrieve to check details submitted parameter in the user's account
class StripeAccountDetailsStatus(APIView):
    def get(self, request):
        user = self.request.user
        if not user:
            return Response({'error': 'Invalid user'} ,status=status.HTTP_401_UNAUTHORIZED)
        if hasattr(user, "stripeuserdata"):
            stripe_id = user.stripeuserdata.stripe_id
            account = stripe.Account.retrieve(stripe_id)
            return Response({'details': account['details_submitted']}, status=status.HTTP_200_OK)
        else:
            return Response({'error': "User does not have stripe account"} ,status=status.HTTP_404_NOT_FOUND)

# Take in response of BillAPIView as request
class StripeCheckout(APIView):
    def post(self, request):
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

        sort_orders = orders.order_by('menu_item__name')
        
        if stripe_id := self.obtain_stripe_id(session_instance):
            response = stripe.checkout.Session.create(
                mode="payment",
                #line_items=[{"price": '{{PRICE_ID}}', "quantity": 1}],
                line_items=self.line_items_parser(sort_orders),
                payment_intent_data={
                    "application_fee_amount": 123,
                    "transfer_data": {"destination": stripe_id},
                },
                success_url="https://example.com/success", # Go here if payment succeeds
                cancel_url="https://example.com/cancel", # Go here if payment fails
            )
            return Response({'url': response['url']}, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
    def obtain_stripe_id(self, session):
        restaurant = session.restaurant
        try:
            restaurant_user = RestaurantUser.objects.get(restaurant=restaurant)
            manager_user = restaurant_user.user
        except RestaurantUser.DoesNotExist:
            raise ValidationError("User does not have manager level access")
        if hasattr(manager_user, "stripeuserdata"):
            return manager_user.stripeuserdata.stripe_id
        return None
    
    def line_items_parser(self, order_list):
        line_items = []
        for item in order_list:
            print("Item",item)
            dish = {
                'price_data': {
                    'currency': 'aud',
                    'product_data': {'name': item.menu_item.name},
                    'unit_amount': int(item.menu_item.price * 100),
                },
                'quantity': 1,
            }
            line_items.append(dish)
        return line_items
