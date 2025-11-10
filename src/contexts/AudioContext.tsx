import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Howl } from 'howler';
import { useLoading } from '../hooks/useLoading';

interface AudioContextType {
  sound: Howl | null;
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const soundRef = useRef<Howl | null>(null);
  const { setIsLoading } = useLoading();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Prevent creating multiple instances (e.g., in StrictMode)
    if (soundRef.current) {
      console.log('Howl instance already exists, skipping creation');
      return;
    }

    console.log('Creating new Howl instance');
    // Set loading when initializing
    setIsLoading(true);

    // Create the Howl instance
    soundRef.current = new Howl({
      src: ['http://192.168.50.3:8000/stream'],
      html5: true,
      autoplay: true,
      format: ['mp3', 'aac'],
      onload: () => {
        console.log('onload - stream loaded');
        setIsLoading(false);
        // autoplay should handle starting playback
      },
      onloaderror: (_id, error) => {
        console.error('Load error:', error);
        setIsLoading(false);
      },
      onplay: () => {
        console.log('onplay - stream playing');
        setIsLoading(false);
        setIsPlaying(true);
      },
      onpause: () => {
        console.log('onpause - stream paused');
        setIsPlaying(false);
      },
      onend: () => {
        console.log('onend - stream ended, will auto-reconnect');
        setIsPlaying(false);
        setTimeout(() => {
          console.log('Attempting to reconnect');
          soundRef.current?.play();
        }, 1000);
      },
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up Howl instance');
      if (soundRef.current) {
        soundRef.current.unload();
        soundRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = () => {
    console.log('play() called, soundRef exists:', !!soundRef.current, 'currently playing:', soundRef.current?.playing());
    if (soundRef.current && !soundRef.current.playing()) {
      console.log('Calling soundRef.current.play()');
      soundRef.current.play();
    } else if (soundRef.current?.playing()) {
      console.log('Already playing, not calling play()');
    }
  };

  const pause = () => {
    console.log('pause() called');
    if (soundRef.current) {
      soundRef.current.pause();
    }
  };

  return (
    <AudioContext.Provider value={{ sound: soundRef.current, play, pause, isPlaying }}>
      {children}
    </AudioContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
