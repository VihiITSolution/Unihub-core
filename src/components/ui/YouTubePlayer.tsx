import React from 'react';

interface YouTubePlayerProps {
  embedUrl: string;
  title?: string;
  autoplay?: boolean;
  controls?: boolean;
  modestBranding?: boolean;
  relatedVideos?: boolean;
}

export default function YouTubePlayer({
  embedUrl,
  title = "Live Session",
  autoplay = true,
  controls = true,
  modestBranding = true,
  relatedVideos = false,
}: YouTubePlayerProps) {
  // A valid embed URL must actually be a YouTube embed - anything else
  // (a raw watch/share link that failed extraction upstream, an empty
  // string, or some other host) would silently fail in an iframe with no
  // feedback to the user, so surface a clear error instead of embedding it.
  const isEmbeddable =
    !!embedUrl &&
    (embedUrl.includes('youtube.com/embed/') ||
      embedUrl.includes('youtube-nocookie.com/embed/'));

  if (!isEmbeddable) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center text-center p-6">
        <div>
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-white font-semibold mb-1">Video unavailable</p>
          <p className="text-gray-400 text-sm">
            This lesson&apos;s video link couldn&apos;t be loaded. Please contact the tutor or support.
          </p>
        </div>
      </div>
    );
  }

  // Build URL parameters
  const params = new URLSearchParams();
  if (autoplay) params.append('autoplay', '1');
  if (!controls) params.append('controls', '0');
  if (modestBranding) params.append('modestbranding', '1');
  if (!relatedVideos) params.append('rel', '0');

  const fullEmbedUrl = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}${params.toString()}`;

  return (
    <div className="relative w-full h-full bg-black">
      <iframe
        src={fullEmbedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title}
        style={{ border: 'none' }}
      />
    </div>
  );
}

interface LiveSessionPlayerProps {
  embedUrl: string;
  chatUrl?: string;
  title: string;
  tutorName: string;
  attendeeCount: number;
  isRecording: boolean;
  enableChat: boolean;
  onLeave?: () => void;
}

export function LiveSessionPlayer({
  embedUrl,
  chatUrl,
  title,
  tutorName,
  attendeeCount,
  isRecording,
  enableChat,
  onLeave,
}: LiveSessionPlayerProps) {
  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-gray-400">with {tutorName}</p>
        </div>
        {onLeave && (
          <button
            onClick={onLeave}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Leave Session
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player */}
        <div className={`${enableChat && chatUrl ? 'w-3/4' : 'w-full'} bg-black`}>
          <YouTubePlayer embedUrl={embedUrl} title={title} />
        </div>

        {/* Live Chat */}
        {enableChat && chatUrl && (
          <div className="w-1/4 bg-gray-900 flex flex-col">
            <div className="bg-gray-800 text-white px-4 py-3 font-semibold">
              Live Chat
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={chatUrl}
                className="w-full h-full"
                title="Live Chat"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="bg-gray-900 text-white px-6 py-2 flex justify-between items-center text-sm">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
            <span className="font-semibold">LIVE</span>
          </span>
          <span>👥 {attendeeCount} watching</span>
        </div>
        {isRecording && (
          <div className="text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            This session is being recorded
          </div>
        )}
      </div>
    </div>
  );
}
