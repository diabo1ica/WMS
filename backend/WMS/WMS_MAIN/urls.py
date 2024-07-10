from django.urls import path, include
from . import views, stripe_views

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('register/', views.ManagerRegistrationAPIView.as_view(), name='user-registration'),
    path('login/', views.LoginAPIView.as_view(), name='user-login'),
    path('logout/', views.LogoutAPIView.as_view(), name='user-logout'),
    path('valid-restaurant/', views.ValidRestaurantAPIView.as_view(), name='valid-restaurant'),
    path('restaurant_details/', views.RestaurantDetails.as_view(), name="restaurant-details"), 
    path('staffregister/', views.StaffRegister.as_view(), name="staff-register"),
    path('updatetables/', views.UpdateTableList.as_view(), name="update-tables"),
    path('listallstaff/', views.ListAllStaff.as_view(), name='list-all-staff'),
    path('position/menuitem/', views.UpdateMenuItemPosition.as_view(), name='menu-item-position'),
    path('position/category/', views.UpdateCategoryPosition.as_view(), name='category-position'),
    # password reset APIs
    path('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    # assistance
    path('tableassistance/', views.AssistanceAPIView.as_view(), name="table-assistance"),
    path('tableassistancewithoutparams/', views.AssistanceWithoutParamsView.as_view(), name="table-assistance-without-params"),
    path('stafftableassistance/', views.StaffViewingAssistanceView.as_view(), name="staff-viewing-table-assistance"),
    #path('password/reset/', views.PasswordResetRequest.as_view(), name='password-reset-request'),
    #path('password/reset/confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('allorders/', views.AllOrdersList.as_view(), name="all-orders"),
    path('orders/', views.OrderList.as_view(), name="order-list"),
    path('orders/<int:pk>/', views.OrderDetail.as_view(), name="order-detail"),
    path('orderitems/', views.OrderItemList.as_view(), name='order-items'),
    path('orderitems/<int:pk>/', views.OrderItemDetail.as_view(), name='orderitem-detail'),
    path('placeorder/', views.PlaceOrderAPIView.as_view(), name='place-order'),
    path('bill/', views.BillAPIView.as_view(), name='request-bill'),
    path('staffbill/', views.StaffBillAPIView.as_view(), name='staff-request-bill'),
    # GET domain/api/categories/ - Gets a list of all categories for restaurant 1
    # POST domain/api/categories/ - Provide category fields as form/post data
    path('categories/', views.CategoryList.as_view(), name="category-list"),
    # GET domain/api/categories/1/?restaurant=1 - Gets the category object with primary key 1 in restaurant 1
    # PUT domain/api/categories/1/?restaurant=1 - Updates the category object with primary key 1 in restaurant 1
    # DELETE domain/api/categories/1/?restaurant=1 - Deletes the category object with primary key 1 in restaurant 1
    path('categories/<int:pk>/', views.CategoryDetail.as_view(), name="category-detail"),
    path('menuitems/', views.MenuItemList.as_view(), name="menuitem-list"),
    path('menuitems/<int:pk>/', views.MenuItemDetail.as_view(), name="menuitem-detail"),

    path('customer/', views.CustomerSession.as_view(), name='poc-session'),
    path('staff-ending-customer/', views.StaffEndingSession.as_view(), name='staff-ending-customer'),

    path('v1/accounts/', stripe_views.StripeAccountExpress.as_view(), name='stripe-express-account'),
    path('v1/account_links/', stripe_views.StripeAccountLink.as_view(), name='stripe-account-link'),
    path('v1/account_check/', stripe_views.StripeAccountDetailsStatus.as_view(), name='stripe-account-details'),
    path('v1/checkout/', stripe_views.StripeCheckout.as_view(), name='stripe-checkout'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)