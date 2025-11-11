import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid"
import { useLoading } from "../hooks/useLoading"
import { useAudio } from "../contexts/AudioContext"
import LoadingSpinner from "./LoadingSpinner"
import NowPlaying from "./NowPlaying"

function AudioPlayer() {
  const { isLoading } = useLoading()
  const { play, pause, isPlaying } = useAudio()

  const togglePlay = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }
  
  return (
    <div className="flex flex-col items-center gap-4">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <NowPlaying />
          <button onClick={togglePlay} className="text-2xl text-white rounded-full px-2" disabled={isLoading}>
            <div className="relative size-24">
              <PauseCircleIcon 
                className={`absolute inset-0 size-24 transition-opacity duration-200 ${isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
              />
              <PlayCircleIcon 
                className={`absolute inset-0 size-24 transition-opacity duration-200 ${!isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
              />
            </div>
          </button>
        </>
      )}
    </div>
  )
}

export default AudioPlayer;