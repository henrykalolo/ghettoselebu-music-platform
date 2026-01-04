#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/home/captainchaosie/CascadeProjects/ghettoselebu/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ghettoselebu.settings')

# Setup Django
django.setup()

from django.contrib.auth.models import User

def create_or_get_admin():
    try:
        # Check if superuser already exists
        admin_user = User.objects.filter(is_superuser=True).first()
        
        if admin_user:
            print(f"✅ Superuser already exists:")
            print(f"   Username: {admin_user.username}")
            print(f"   Email: {admin_user.email}")
            print(f"   Password: admin123 (default - may have been changed)")
        else:
            # Create new superuser
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@ghettoselebu.com',
                password='admin123'
            )
            print(f"✅ Superuser created successfully!")
            print(f"   Username: {admin_user.username}")
            print(f"   Email: {admin_user.email}")
            print(f"   Password: admin123")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == '__main__':
    create_or_get_admin()
