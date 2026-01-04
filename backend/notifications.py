from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from music.models import Track, Album, Mixtape
from .models import Notification, UserProfile
import logging

logger = logging.getLogger(__name__)

class NotificationManager:
    def __init__(self):
        self.milestones = {
            'plays': [100, 500, 1000, 5000, 10000, 50000, 100000],
            'downloads': [10, 50, 100, 500, 1000, 5000, 10000],
            'followers': [1, 10, 25, 50, 100, 250, 500, 1000]
        }
    
    def create_notification(self, user, notification_type, title, message, related_object=None, related_object_id=None):
        """Create a notification for a user"""
        try:
            notification = Notification.objects.create(
                user=user,
                type=notification_type,
                title=title,
                message=message,
                related_object_type=ContentType.objects.get_for_model(related_object.__class__) if related_object else None,
                related_object_id=related_object_id,
                is_read=False
            )
            return notification
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return None
    
    def check_play_milestone(self, track):
        """Check if track has reached a play milestone"""
        try:
            current_plays = track.download_count  # Using download_count as play count for now
            for milestone in self.milestones['plays']:
                if current_plays >= milestone:
                    # Check if we already notified for this milestone
                    existing = Notification.objects.filter(
                        user=track.artist.user if track.artist else None,
                        type='milestone',
                        title__contains=f'{milestone} plays',
                        related_object_type=ContentType.objects.get_for_model(Track),
                        related_object_id=track.id
                    ).exists()
                    
                    if not existing and track.artist and track.artist.user:
                        self.create_notification(
                            user=track.artist.user,
                            notification_type='milestone',
                            title=f'🎉 {milestone} Plays Milestone!',
                            message=f'Your track "{track.title}" has reached {milestone} plays! Keep up the great work!',
                            related_object=track,
                            related_object_id=track.id
                        )
                        return True
            return False
        except Exception as e:
            logger.error(f"Error checking play milestone: {e}")
            return False
    
    def check_download_milestone(self, track):
        """Check if track has reached a download milestone"""
        try:
            current_downloads = track.download_count
            for milestone in self.milestones['downloads']:
                if current_downloads >= milestone:
                    # Check if we already notified for this milestone
                    existing = Notification.objects.filter(
                        user=track.artist.user if track.artist else None,
                        type='milestone',
                        title__contains=f'{milestone} downloads',
                        related_object_type=ContentType.objects.get_for_model(Track),
                        related_object_id=track.id
                    ).exists()
                    
                    if not existing and track.artist and track.artist.user:
                        self.create_notification(
                            user=track.artist.user,
                            notification_type='milestone',
                            title=f'📥 {milestone} Downloads Milestone!',
                            message=f'Your track "{track.title}" has been downloaded {milestone} times! Your music is getting popular!',
                            related_object=track,
                            related_object_id=track.id
                        )
                        return True
            return False
        except Exception as e:
            logger.error(f"Error checking download milestone: {e}")
            return False
    
    def check_follower_milestone(self, user_profile):
        """Check if user has reached a follower milestone"""
        try:
            current_followers = user_profile.followers_count
            for milestone in self.milestones['followers']:
                if current_followers >= milestone:
                    # Check if we already notified for this milestone
                    existing = Notification.objects.filter(
                        user=user_profile.user,
                        type='milestone',
                        title__contains=f'{milestone} followers',
                    ).exists()
                    
                    if not existing:
                        self.create_notification(
                            user=user_profile.user,
                            notification_type='milestone',
                            title=f'👥 {milestone} Followers Milestone!',
                            message=f'You now have {milestone} followers! Your profile is growing fast!',
                            related_object=user_profile,
                            related_object_id=user_profile.id
                        )
                        return True
            return False
        except Exception as e:
            logger.error(f"Error checking follower milestone: {e}")
            return False

# Global notification manager instance
notification_manager = NotificationManager()

@receiver(post_save, sender=Track)
def track_updated(sender, instance, created, **kwargs):
    """Handle track updates for milestone checking"""
    if not created:
        # Check milestones when track is updated (play count changed)
        notification_manager.check_play_milestone(instance)
        notification_manager.check_download_milestone(instance)

@receiver(post_save, sender=UserProfile)
def user_profile_updated(sender, instance, created, **kwargs):
    """Handle user profile updates for follower milestone checking"""
    if not created:
        # Check follower milestone when profile is updated
        notification_manager.check_follower_milestone(instance)

@receiver(post_save, sender=Follow)
def follow_created(sender, instance, created, **kwargs):
    """Create notification when user gets a new follower"""
    if created:
        # Get the user who is being followed
        followed_user = instance.following.user.userprofile
        
        # Create notification for the user who got a new follower
        notification_manager.create_notification(
            user=followed_user,
            notification_type='social',
            title='👥 New Follower!',
            message=f'{instance.follower.user.username} started following you!',
            related_object=instance,
            related_object_id=instance.id
        )

def create_notification_for_user(user, notification_type, title, message, related_object=None):
    """Helper function to create notifications"""
    return notification_manager.create_notification(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        related_object=related_object,
        related_object_id=related_object.id if related_object else None
    )

def create_system_notification(title, message, notification_type='system'):
    """Create system-wide notifications for all users"""
    from django.contrib.auth.models import User
    
    users = User.objects.filter(is_active=True)
    notifications = []
    
    for user in users:
        notification = notification_manager.create_notification(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message
        )
        if notification:
            notifications.append(notification)
    
    return notifications
