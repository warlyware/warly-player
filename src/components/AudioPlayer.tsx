import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid"
import { useLoading } from "../hooks/useLoading"
import { useAudio } from "../contexts/AudioContext"

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
      {isLoading && (
        <div className="text-white text-sm">Loading...</div>
      )}
      <button onClick={togglePlay} className="text-2xl text-white rounded-full p-2" disabled={isLoading}>
        {isPlaying ?
          <PauseCircleIcon className="size-24" /> :
          <PlayCircleIcon className="size-24" />
        }
      </button>
    </div>
  )
}

export default AudioPlayer;