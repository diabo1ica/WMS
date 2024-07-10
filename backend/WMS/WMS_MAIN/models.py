from django.db import models
from django.contrib.auth.models import User

DIETARY_REQUIREMENT_CHOICES = [
    ('', 'None'),
    ('DF','Dairy Free'),
    ('GF','Gluten Free'),
    ('V','Vegetarian'),
    ('VG','Vegan'),
]

DISH_STATUS = [
    ('SERVED', 'Served'),
    ('PREPARED', 'Ready to serve'),
    ('ORDER SENT', 'Order sent to kitchen')
]

# Create your models here.
class Restaurant(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    table_numbers = models.JSONField(max_length=1000)
    num_categories = models.IntegerField(default=0)

class InvitedUser(models.Model):
    email_address = models.CharField(max_length=320)
    restaurant = models.ManyToManyField(Restaurant)

class RestaurantUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    user_role = models.CharField(max_length=100, default='manager')

# CustomerSession -> Order -> OrderItem
# X -> Y indicates that there exists many Ys to one X
class CustomerSession(models.Model):
    session = models.CharField(max_length=500)
    table_number = models.IntegerField()
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    need_assistance = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['table_number', 'restaurant']

# an order is a batch of order items made at a point in time, associated with a customer session
class Order(models.Model):
    customer_session = models.ForeignKey(CustomerSession, on_delete=models.CASCADE, null=True)
    order_time = models.TimeField(null=True)

class Category(models.Model):
    name = models.CharField(max_length=100)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    num_menu_items = models.IntegerField(default=0)
    position = models.IntegerField(default=0)

class MenuItem(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=400)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    dietary_requirements = models.CharField(max_length=50, choices=DIETARY_REQUIREMENT_CHOICES, default='')
    preparation_time = models.IntegerField()
    popular = models.BooleanField(default=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='menu_images/', blank=True, null=True, default='menu_images/default_img.png')
    position = models.IntegerField(default=0)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    # quantity = models.IntegerField()
    status = models.CharField(max_length=50, choices=DISH_STATUS, default='ORDER SENT')

class StripeUserData(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    stripe_id = models.CharField(max_length=100)
