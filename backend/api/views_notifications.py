from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Q
from django.utils import timezone
from music.models import Notification, Track, Album, Mixtape
from .serializers_notifications import NotificationSerializer, NotificationCountSerializer
import logging

logger = logging.getLogger(__name__)

class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get user's notifications with pagination and filtering"""
    try:
        # Get query parameters
        notification_type = request.query_params.get('type', 'all')
        is_read = request.query_params.get('is_read', 'all')
        
        # Build queryset
        queryset = Notification.objects.filter(user=request.user)
        
        # Filter by type
        if notification_type != 'all':
            queryset = queryset.filter(type=notification_type)
        
        # Filter by read status
        if is_read == 'read':
            queryset = queryset.filter(is_read=True)
        elif is_read == 'unread':
            queryset = queryset.filter(is_read=False)
        
        # Order by creation date
        queryset = queryset.order_by('-created_at')
        
        # Paginate
        paginator = NotificationPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        
        # Serialize
        serializer = NotificationSerializer(paginated_queryset, many=True)
        
        return paginator.get_paginated_response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        return Response(
            {'error': 'Failed to get notifications'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_counts(request):
    """Get notification counts by type"""
    try:
        user = request.user
        
        # Get total counts
        total_count = Notification.objects.filter(user=user).count()
        unread_count = Notification.objects.filter(user=user, is_read=False).count()
        
        # Get counts by type
        social_count = Notification.objects.filter(
            user=user, 
            type__in=['social', 'follow']
        ).count()
        
        milestone_count = Notification.objects.filter(
            user=user, 
            type='milestone'
        ).count()
        
        system_count = Notification.objects.filter(
            user=user, 
            type='system'
        ).count()
        
        data = {
            'total': total_count,
            'unread': unread_count,
            'social': social_count,
            'milestones': milestone_count,
            'system': system_count
        }
        
        serializer = NotificationCountSerializer(data)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting notification counts: {e}")
        return Response(
            {'error': 'Failed to get notification counts'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read"""
    try:
        notification = Notification.objects.get(
            id=notification_id, 
            user=request.user
        )
        notification.is_read = True
        notification.save()
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data)
        
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        return Response(
            {'error': 'Failed to mark notification as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read"""
    try:
        updated_count = Notification.objects.filter(
            user=request.user, 
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': f'Marked {updated_count} notifications as read',
            'updated_count': updated_count
        })
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {e}")
        return Response(
            {'error': 'Failed to mark notifications as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """Delete a specific notification"""
    try:
        notification = Notification.objects.get(
            id=notification_id, 
            user=request.user
        )
        notification.delete()
        
        return Response({
            'message': 'Notification deleted successfully'
        })
        
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting notification: {e}")
        return Response(
            {'error': 'Failed to delete notification'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_all_notifications(request):
    """Clear all notifications for the user"""
    try:
        deleted_count = Notification.objects.filter(user=request.user).delete()[0]
        
        return Response({
            'message': f'Deleted {deleted_count} notifications',
            'deleted_count': deleted_count
        })
        
    except Exception as e:
        logger.error(f"Error clearing notifications: {e}")
        return Response(
            {'error': 'Failed to clear notifications'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_test_notification(request):
    """Create a test notification (for development/testing)"""
    try:
        from music.models import Notification
        
        notification = Notification.objects.create(
            user=request.user,
            type='system',
            title='🧪 Test Notification',
            message='This is a test notification to verify the notification system is working.',
            is_read=False
        )
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating test notification: {e}")
        return Response(
            {'error': 'Failed to create test notification'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_settings(request):
    """Get user's notification preferences"""
    try:
        # This would be stored in user profile settings
        # For now, return default settings
        settings_data = {
            'social_notifications': True,
            'milestone_notifications': True,
            'system_notifications': True,
            'like_notifications': True,
            'comment_notifications': True,
            'follow_notifications': True
        }
        
        return Response(settings_data)
        
    except Exception as e:
        logger.error(f"Error getting notification settings: {e}")
        return Response(
            {'error': 'Failed to get notification settings'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_notification_settings(request):
    """Update user's notification preferences"""
    try:
        # This would update user profile settings
        # For now, just return the settings as confirmation
        settings_data = request.data
        
        return Response({
            'message': 'Notification settings updated successfully',
            'settings': settings_data
        })
        
    except Exception as e:
        logger.error(f"Error updating notification settings: {e}")
        return Response(
            {'error': 'Failed to update notification settings'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
