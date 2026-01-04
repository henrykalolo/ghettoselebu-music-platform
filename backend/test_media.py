#!/usr/bin/env python3
import os
import sys
import django
from django.conf import settings

# Add the project directory to the Python path
sys.path.append('/home/captainchaosie/CascadeProjects/ghettoselebu/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ghettoselebu.settings')

django.setup()

print('MEDIA_URL:', settings.MEDIA_URL)
print('MEDIA_ROOT:', settings.MEDIA_ROOT)
print('DEBUG:', settings.DEBUG)
print('MEDIA_ROOT exists:', os.path.exists(settings.MEDIA_ROOT))

if os.path.exists(settings.MEDIA_ROOT):
    tracks_dir = os.path.join(settings.MEDIA_ROOT, 'tracks')
    print('Tracks directory exists:', os.path.exists(tracks_dir))
    if os.path.exists(tracks_dir):
        files = os.listdir(tracks_dir)
        print('Files in tracks:', files)
else:
    print('MEDIA_ROOT does not exist')
