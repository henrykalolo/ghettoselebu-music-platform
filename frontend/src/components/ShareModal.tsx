import React, { useState } from 'react';
import { 
  Share2Icon, 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkIcon, 
  MailIcon, 
  MessageSquareIcon,
  CopyIcon,
  CheckIcon,
  XIcon,
  MusicIcon
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    description: string;
    url: string;
    type: 'track' | 'album' | 'playlist' | 'artist';
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, content }) => {
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const handleShare = async (platform: string) => {
    const shareUrl = content.url;
    const shareText = `Check out ${content.title} on Ghettoselebu! ${content.description}`;
    
    try {
      if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)} ${encodeURIComponent(shareUrl)}`, '_blank');
      } else if (platform === 'instagram') {
        window.open(`https://www.instagram.com/`, '_blank');
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`, '_blank');
      } else if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)} ${encodeURIComponent(shareUrl)}`, '_blank');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(content.url);
      setCopied(true);
      setShareMessage('Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setShareMessage('');
      }, 2000);
    } catch (error) {
      console.error('Copy error:', error);
      setShareMessage('Failed to copy link');
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out ${content.title} on Ghettoselebu`);
    const body = encodeURIComponent(`I wanted to share this ${content.type} with you:\n\n${content.title}\n\n${content.description}\n\nListen here: ${content.url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Share {content.type}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-start space-x-4">
            {content.type === 'track' && (
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <MusicIcon className="h-6 w-6 text-white" />
              </div>
            )}
            {content.type === 'album' && (
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-xs">ALBUM</div>
              </div>
            )}
            {content.type === 'playlist' && (
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-xs">PLAYLIST</div>
              </div>
            )}
            {content.type === 'artist' && (
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-xs">ARTIST</div>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">{content.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{content.description}</p>
              <div className="text-xs text-gray-500">
                <span className="text-gray-400">Type:</span> {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white mb-4">Share via</h3>
          
          {/* Social Media */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FacebookIcon className="h-5 w-5" />
              <span>Facebook</span>
            </button>
            
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center space-x-2 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <TwitterIcon className="h-5 w-5" />
              <span>Twitter</span>
            </button>
            
            <button
              onClick={() => handleShare('instagram')}
              className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <InstagramIcon className="h-5 w-5" />
              <span>Instagram</span>
            </button>
            
            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center justify-center space-x-2 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <LinkIcon className="h-5 w-5" />
              <span>LinkedIn</span>
            </button>
          </div>

          {/* Direct Share */}
          <div className="space-y-3">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <CopyIcon className="h-5 w-5" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            
            <button
              onClick={handleEmailShare}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <MailIcon className="h-5 w-5" />
              <span>Email</span>
            </button>
          </div>

          {/* QR Code */}
          <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-white mb-2">Share QR Code</h4>
            <div className="bg-white p-3 rounded-lg flex items-center justify-center">
              <div className="text-gray-800 text-xs">QR Code Placeholder</div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {shareMessage && (
          <div className="mt-4 p-3 bg-green-600 text-white rounded-lg border border-green-500 flex items-center justify-center">
            <CheckIcon className="h-5 w-5 mr-2" />
            <span>{shareMessage}</span>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
