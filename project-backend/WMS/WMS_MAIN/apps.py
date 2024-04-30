from django.apps import AppConfig

class WmsMainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'WMS_MAIN'

    def ready(self):
        import WMS_MAIN.signals  # noqa
