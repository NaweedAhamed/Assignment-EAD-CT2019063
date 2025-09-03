from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Ensure signal handlers are registered (e.g., auto-create UserProfile)
        from core import signals  # noqa: F401
