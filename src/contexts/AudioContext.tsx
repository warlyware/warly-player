import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Howl } from 'howler';
import { useLoading } from '../hooks/useLoading';

interface AudioContextType {
  sound: Howl | null;
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
  isReconnecting: boolean;
  isStreamDead: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const soundRef = useRef<Howl | null>(null);
  const pendingPlayRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { setIsLoading } = useLoading();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isStreamDead, setIsStreamDead] = useState(false);

  const clearReconnectTimer = (shouldResetState = true) => {
    if (reconnectTimerRef.current) {
      clearInterval(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (shouldResetState) {
      setIsReconnecting(false);
    }
  };

  const startReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      return;
    }

    console.log('Attempting to reconnect');
    setIsReconnecting(true);
    reconnectTimerRef.current = setInterval(() => {
      const sound = soundRef.current;
      if (!sound || sound.playing() || pendingPlayRef.current) {
        return;
      }

      console.log('Attempting to reconnect');
      pendingPlayRef.current = true;
      setIsLoading(true);
      sound.play();
    }, 1000);
  };

  const initializeHowl = () => {
    if (soundRef.current) {
      return soundRef.current;
    }

    console.log('Creating new Howl instance');
    pendingPlayRef.current = true;
    setIsLoading(true);
    setIsStreamDead(false);
    const howl = new Howl({
      src: ['http://192.168.50.3:8000/stream'],
      html5: true,
      format: ['mp3', 'aac'],
      autoplay: true,
      onloaderror: (_id, error) => {
        console.error('Load error:', error);
        pendingPlayRef.current = false;
        setIsStreamDead(true);
        setIsLoading(false);
        startReconnectTimer();
      },
      onplay: () => {
        console.log('onplay - stream playing');
        pendingPlayRef.current = false;
        clearReconnectTimer();
        setIsLoading(false);
        setIsPlaying(true);
        setIsReconnecting(false);
        setIsStreamDead(false);
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
        console.log('onend - stream ended, will auto-reconnect');
        pendingPlayRef.current = false;
        setIsPlaying(false);
        startReconnectTimer();
      },
    });

    soundRef.current = howl;
    return howl;
  };

  useEffect(() => {
    initializeHowl();

    return () => {
      console.log('Cleaning up Howl instance');
      if (reconnectTimerRef.current) {
        clearInterval(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      setIsReconnecting(false);
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
    setIsStreamDead(false);
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
      isReconnecting,
      isStreamDead,
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
