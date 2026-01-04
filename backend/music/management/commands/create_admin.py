from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create a superuser for admin access'

    def handle(self, *args, **options):
        try:
            # Check if superuser already exists
            if User.objects.filter(is_superuser=True).exists():
                user = User.objects.filter(is_superuser=True).first()
                self.stdout.write(
                    self.style.SUCCESS(f'Superuser already exists: {user.username} ({user.email})')
                    self.stdout.write(f'Username: {user.username}')
                    self.stdout.write(f'Email: {user.email}')
                    self.stdout.write('Password: admin123 (if not changed)')
                else:
                    # Create new superuser
                    user = User.objects.create_superuser(
                        username='admin',
                        email='admin@ghettoselebu.com',
                        password='admin123'
                    )
                    self.stdout.write(self.style.SUCCESS('Superuser created successfully!'))
                    self.stdout.write(f'Username: {user.username}')
                    self.stdout.write(f'Email: {user.email}')
                    self.stdout.write('Password: admin123')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
