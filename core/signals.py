from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models.user_profile import UserProfile


@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance: User, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance, defaults={"role": UserProfile.ROLE_STUDENT})
