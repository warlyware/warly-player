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
  const pendingPlayRef = useRef(false);
  const { setIsLoading } = useLoading();
  const [isPlaying, setIsPlaying] = useState(false);

  const initializeHowl = () => {
    if (soundRef.current) {
      return soundRef.current;
    }

    console.log('Creating new Howl instance');
    pendingPlayRef.current = true;
    setIsLoading(true);
    const howl = new Howl({
      // src: ['http://192.168.50.3:8000/stream'],
      src: ['https://hear.clear.beer/stream'],
      html5: true,
      format: ['mp3', 'aac'],
      autoplay: true,
      onloaderror: (_id, error) => {
        console.error('Load error:', error);
        pendingPlayRef.current = false;
        setIsLoading(false);
      },
      onplay: () => {
        console.log('onplay - stream playing');
        pendingPlayRef.current = false;
        setIsLoading(false);
        setIsPlaying(true);
      },
      onplayerror: (_id, error) => {
        console.error('Play error:', error);
        pendingPlayRef.current = false;
        setIsPlaying(false);
        setIsLoading(false);
      },
      onpause: () => {
        console.log('onpause - stream paused');
        setIsPlaying(false);
      },
      onend: () => {
        console.log('onend - stream ended');
        pendingPlayRef.current = false;
        setIsPlaying(false);
      },
    });

    soundRef.current = howl;
    return howl;
  };

  useEffect(() => {
    initializeHowl();

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
    const sound = initializeHowl();
    console.log('play() called, soundRef exists:', !!sound, 'currently playing:', sound?.playing(), 'pending:', pendingPlayRef.current);

    if (!sound) {
      return;
    }

    if (sound.playing() || pendingPlayRef.current) {
      console.log('Already playing or pending playback, not calling play()');
      return;
    }

    pendingPlayRef.current = true;
    setIsLoading(true);
    try {
      sound.play();
    } catch (error) {
      pendingPlayRef.current = false;
      setIsLoading(false);
      console.error('Failed to trigger playback', error);
    }
  };

  const pause = () => {
    console.log('pause() called');
    if (soundRef.current) {
      pendingPlayRef.current = false;
      soundRef.current.pause();
    }
  };

  return (
    <AudioContext.Provider value={{
      sound: soundRef.current,
      play,
      pause,
      isPlaying,
    }}>
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
