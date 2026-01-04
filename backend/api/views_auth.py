from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from api.serializers_auth import RegisterSerializer, LoginSerializer, UserProfileSerializer
from music.models import UserProfile


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Serialize the user profile
        try:
            profile = user.userprofile
            profile_serializer = UserProfileSerializer(profile)
            profile_data = profile_serializer.data
        except UserProfile.DoesNotExist:
            profile_data = None
        
        return Response({
            'user': profile_data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        # For now, just return success - tokens will be cleared on frontend
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user.userprofile).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    try:
        profile = request.user.userprofile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    try:
        profile = request.user.userprofile
        user = profile.user
        
        # Update user fields
        user_data = {
            'first_name': request.data.get('first_name', user.first_name),
            'last_name': request.data.get('last_name', user.last_name),
            'email': request.data.get('email', user.email),
        }
        
        for field, value in user_data.items():
            setattr(user, field, value)
        user.save()
        
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_favorite_track(request, track_id):
    try:
        profile = request.user.userprofile
        from music.models import Track
        track = Track.objects.get(id=track_id)
        profile.favorite_tracks.add(track)
        return Response({'message': 'Track added to favorites'})
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Track.DoesNotExist:
        return Response({'error': 'Track not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_favorite_track(request, track_id):
    try:
        profile = request.user.userprofile
        from music.models import Track
        track = Track.objects.get(id=track_id)
        profile.favorite_tracks.remove(track)
        return Response({'message': 'Track removed from favorites'})
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Track.DoesNotExist:
        return Response({'error': 'Track not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_favorite_album(request, album_id):
    try:
        profile = request.user.userprofile
        from music.models import Album
        album = Album.objects.get(id=album_id)
        profile.favorite_albums.add(album)
        return Response({'message': 'Album added to favorites'})
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Album.DoesNotExist:
        return Response({'error': 'Album not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def remove_favorite_album(request, album_id):
    try:
        profile = request.user.userprofile
        from music.models import Album
        album = Album.objects.get(id=album_id)
        profile.favorite_albums.remove(album)
        return Response({'message': 'Album removed from favorites'})
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_download_history(request, track_id):
    try:
        profile = request.user.userprofile
        from music.models import Track
        track = Track.objects.get(id=track_id)
        profile.download_history.add(track)
        return Response({'message': 'Download history updated'})
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Track.DoesNotExist:
        return Response({'error': 'Track not found'}, status=status.HTTP_404_NOT_FOUND)
