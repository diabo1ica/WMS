"""
URL configuration for WMS project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from WMS_MAIN.views import CustomPasswordResetDoneView, CustomPasswordResetView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('WMS_MAIN.urls')),
    # password reset pages (to be moved to the root)
    path('password-change/<str:token>/', CustomPasswordResetView.as_view(), name='password-change'),
    path('completed-password-change/', CustomPasswordResetDoneView.as_view(), name='completed-password-change'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
