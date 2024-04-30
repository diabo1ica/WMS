from rest_framework import serializers
from django.contrib.auth.models import User
from . import models as app_models
from rest_framework.exceptions import NotFound
from WMS_MAIN.models import DISH_STATUS

# TODO add restaurant
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = app_models.Restaurant
        fields = ['name', 'location', 'table_numbers', 'num_categories']

class CombinedRegistrationSerializer(serializers.Serializer):
    # Fields for Manager, Restaurant, and RestaurantUser models
    manager = UserSerializer()
    restaurant = RestaurantSerializer()

    def create_manager(self):
        manager_data = self.validated_data.get('manager')
        self.manager_instance = UserSerializer().create(manager_data)
        return self.manager_instance

    def create_restaurant(self):
        restaurant_data = self.validated_data.get('restaurant')
        # Check if a restaurant with the same data already exists
        existing_restaurant = app_models.Restaurant.objects.filter(**restaurant_data).first()

        if existing_restaurant:
            # Return the existing restaurant instance
            self.restaurant_instance = existing_restaurant
            return existing_restaurant
        else:
            # Create a new restaurant instance
            self.restaurant_instance = RestaurantSerializer().create(restaurant_data)
            return self.restaurant_instance

    def create_restaurant_user(self):
        if self.manager_instance and self.restaurant_instance:
            restaurant_user_data = {
                'user': self.manager_instance,
                'restaurant': self.restaurant_instance,
                'user_role': 'manager'
            }
            restaurant_user_instance = app_models.RestaurantUser.objects.create(**restaurant_user_data)
            return restaurant_user_instance
        else:
            # Handle the case where manager_instance or restaurant_instance is not available
            return None
        
class StaffRegisterSerializer(serializers.Serializer):
    staff = UserSerializer()
    user_role = serializers.CharField()

    def create_staff(self):
        staff_data = self.validated_data.get('staff')
        self.staff_instance = UserSerializer().create(staff_data)
        return self.staff_instance
    
    def create_restaurant_user(self):
        if self.staff_instance:
            restaurant_user_data = {
                'user': self.staff_instance,
                'restaurant': self.context.get('restaurant') ,
                'user_role': self.validated_data.get('user_role')
            }
            restaurant_user_instance = app_models.RestaurantUser.objects.create(**restaurant_user_data)
            return restaurant_user_instance
        else:
            return None

class PasswordResetRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email']
    
    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("This email address is not associated with any user account.")
        return value
    
    def get_user(self):
        return User.objects.get(email=self.validated_data.get('email'))

class CustomerSession(serializers.ModelSerializer):
    class Meta:
        model = app_models.CustomerSession
        fields = ['table_number', 'restaurant', 'session']

class TablesNeedingAssistanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = app_models.CustomerSession
        fields = ['table_number']


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = app_models.Order
        fields = ['customer_session', 'order_time']

class OrderItemSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(source='id')
    class Meta:
        model = app_models.OrderItem
        fields = ['pk', 'order', 'menu_item', 'status']

    def validate(self, data):
        new_status = data.get('status')
        valid_status = [status[0] for status in DISH_STATUS]

        if new_status not in valid_status:
            raise serializers.ValidationError('Invalid status')
        return data

class CategorySerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(source='id', read_only=True)
    class Meta:
        model = app_models.Category
        fields = ['pk', 'name', 'restaurant', 'num_menu_items', 'position']

    def create(self, validated_data):
        restaurant = validated_data['restaurant']
        last_position = restaurant.num_categories + 1
        validated_data['position'] = last_position

        restaurant.num_categories += 1
        restaurant.save()
        return super().create(validated_data=validated_data)
    
    def destroy(self, instance):
        restaurant = instance.restaurant
        restaurant.num_categories -= 1
        restaurant.save()

        return super().destroy(instance)

class MenuItemSerializer(serializers.ModelSerializer):
    pk = serializers.IntegerField(source='id', read_only=True)
    class Meta:
        model = app_models.MenuItem
        fields = ['pk', 'name', 'description', 'price', 'category', 'dietary_requirements', 'preparation_time', 'restaurant', 'popular', 'image', 'position']

    def create(self, validated_data):
        category = validated_data['category']
        last_position = category.num_menu_items + 1
        validated_data['position'] = last_position

        category.num_menu_items += 1
        category.save()
        return super().create(validated_data=validated_data)
    
    def destroy(self, instance):
        category = instance.category
        category.num_menu_items -= 1
        category.save()

        return super().destroy(instance)

    # def create(self, validated_data):
    #     image_data = validated_data.pop('image', None)
    #     if image_data:
    #         binary_image_data = base64.b64decode(image_data)
    #         image_file = ContentFile(binary_image_data, name='image.jpg')
    #         validated_data['image_field'] = image_file
    #     return super().create(validated_data=validated_data)

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = app_models.Restaurant
        fields = ['table_numbers']

class StripeUserSerializer(serializers.Serializer):
    stripe_id = serializers.CharField()
    
    def create(self, validated_data):
        if user:= self.context.get('user'):
            stripe_user_data = {
                'user': user,
                'stripe_id': self.validated_data.get('stripe_id')
            }
            stripe_user_instance = app_models.StripeUserData.objects.create(**stripe_user_data)
            return stripe_user_instance
        else:
            return None