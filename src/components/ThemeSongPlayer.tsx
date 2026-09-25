import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YOUTUBE_VIDEO_ID = '43Wt6En7i6g';

export const ThemeSongPlayer: React.FC = () => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const playAudio = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(100);
          playerRef.current.playVideo();
          hasTriggeredRef.current = true;
        } catch (e) {
          console.debug('Audio play retry on interaction');
        }
      }
    };

    // User interaction fallback (modern browsers require 1 interaction to unlock sound if strict autoplay is active)
    const handleFirstInteraction = () => {
      playAudio();
      if (hasTriggeredRef.current) {
        removeInteractionListeners();
      }
    };

    const addInteractionListeners = () => {
      window.addEventListener('click', handleFirstInteraction, { capture: true, passive: true });
      window.addEventListener('touchstart', handleFirstInteraction, { capture: true, passive: true });
      window.addEventListener('keydown', handleFirstInteraction, { capture: true, passive: true });
      window.addEventListener('pointerdown', handleFirstInteraction, { capture: true, passive: true });
    };

    const removeInteractionListeners = () => {
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
      window.removeEventListener('keydown', handleFirstInteraction, { capture: true });
      window.removeEventListener('pointerdown', handleFirstInteraction, { capture: true });
    };

    const initPlayer = () => {
      if (!isMounted || !window.YT || !window.YT.Player) return;

      try {
        playerRef.current = new window.YT.Player('martirez-theme-audio-container', {
          height: '1',
          width: '1',
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID, // Required for loop in YT IFrame
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              try {
                event.target.unMute();
                event.target.setVolume(100);
                event.target.playVideo();
              } catch (e) {}
            },
            onStateChange: (event: any) => {
              // If video ends, ensure it loops
              if (event.data === 0) {
                event.target.playVideo();
              }
            },
          },
        });
      } catch (err) {
        console.debug('Error initializing YouTube player:', err);
      }
    };

    // Load YouTube Iframe API if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    } else if (window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    addInteractionListeners();

    return () => {
      isMounted = false;
      removeInteractionListeners();
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (e) {}
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: -9999,
        left: -9999,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -9999,
        overflow: 'hidden',
        visibility: 'hidden',
      }}
    >
      <div id="martirez-theme-audio-container" />
      {/* Immediate autoplay iframe fallback */}
      <iframe
        title="Theme Audio"
        src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&mute=0&enablejsapi=1`}
        allow="autoplay; encrypted-media"
        tabIndex={-1}
        style={{ width: 1, height: 1, border: 'none' }}
      />
    </div>
  );
};
