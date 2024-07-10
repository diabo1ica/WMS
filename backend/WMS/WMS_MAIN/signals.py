from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.urls import reverse

from django_rest_passwordreset.signals import reset_password_token_created

# imports we need to create the full URL
from django.contrib.sites.shortcuts import get_current_site

# imports we need to render the template to use in the email
from django.template.loader import render_to_string

from email.mime.image import MIMEImage

from django.contrib.staticfiles import finders
from functools import lru_cache

# https://pypi.org/project/django-rest-passwordreset/
# pip install django-rest-passwordreset
# The following endpoints are provided in django-rest-passwordreset:

# POST ${API_URL}/ - request a reset password token by using the email parameter
# POST ${API_URL}/confirm/ - using a valid token, the users password is set to the provided password
# POST ${API_URL}/validate_token/ - will return a 200 if a given token is valid
# where ${API_URL}/ is the url specified in your urls.py (e.g., api/password_reset/ in our case)

# For testing purposes
# curl -X POST http://127.0.0.1:8000/api/password_reset/ -d "email=pagares775@dacgu.com" 
# Insert any email that is currently in your database to test
@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    # we get the current site to get the domain
    current_site = get_current_site(instance.request)

    # we get the static file path and concatenate it with the domain
    # asset_folder_url = f'http://{current_site.domain}{static("images/")}'
    # f"http://{current_site.domain}
    asset_folder_url = '/static/images/'

    # send an e-mail to the user
    context = {
        'current_user': reset_password_token.user,
        'username': reset_password_token.user.username,
        'email': reset_password_token.user.email,
        'reset_password_url': f"{settings.BACKEND_URL}{reverse('password-change', kwargs={'token': reset_password_token.key})}"
    }

    # render email text
    email_html_message = render_to_string('user_reset_password.html', context)
    email_plaintext_message = render_to_string('user_reset_password.txt', context)

    msg = EmailMultiAlternatives(
        # title:
        "Password Reset for {title}".format(title="WMS User"),
        # message:
        email_plaintext_message,
        # from:
        "noreply@somehost.local",
        # to:
        [reset_password_token.user.email]
    )
    msg.attach_alternative(email_html_message, "text/html")
    images = image_data()
    for image_name, image in images.items():
        msg.attach(image)
    msg.send()

# Attach assets to email
@lru_cache()
def image_data():
    images = {}

    with open(finders.find('images/image-7.png'), 'rb') as f:
        image_data = f.read()
    logo = MIMEImage(image_data)
    logo.add_header('Content-ID', '<logo>')
    images['logo'] = logo

    with open(finders.find('images/panda_logo.png'), 'rb') as f:
        image_data = f.read()
    panda = MIMEImage(image_data)
    panda.add_header('Content-ID', '<panda>')
    images['panda'] = panda

    return images

