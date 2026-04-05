import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import { FaBackward, FaForward } from "react-icons/fa";
import { pauseAllAudio } from "../../utils/pauseAllAudio";

const CustomVideoPlayer = forwardRef(
  (
    {
      src,
      poster,
      className = "",
      autoPlay = false,
      onPlay,
      onPause,
      showPlayButtonOverlay = false,
      onPlayButtonClick,
      pauseOtherVideos = true,
      id,
      allowFullscreen = true,
    },
    ref,
  ) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef(null);
    const wasPlayingBeforeSeek = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    // Expose video ref methods
    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      get currentTime() {
        return videoRef.current?.currentTime || 0;
      },
      set currentTime(value) {
        if (videoRef.current) {
          videoRef.current.currentTime = value;
        }
      },
      get paused() {
        return videoRef.current?.paused ?? true;
      },
      videoElement: videoRef.current,
    }));

    // Format time in MM:SS format
    const formatTime = (time) => {
      if (!time || isNaN(time)) return "0:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Update current time and duration
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);

      video.addEventListener("timeupdate", updateTime);
      video.addEventListener("loadedmetadata", updateDuration);

      return () => {
        video.removeEventListener("timeupdate", updateTime);
        video.removeEventListener("loadedmetadata", updateDuration);
      };
    }, []);

    // Handle play/pause
    const togglePlayPause = (e) => {
      console.log("sdsd");
      e.preventDefault();
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        // Pause all other videos and audio when this video plays
        if (pauseOtherVideos) {
          pauseAllAudio();
          const allVideos = document.querySelectorAll("video");
          allVideos.forEach((v) => {
            if (v !== video && !v.paused) {
              v.pause();
            }
          });
        }

        video
          .play()
          .then(() => {
            setIsPlaying(true);
            onPlay?.();
          })
          .catch((err) => console.error("Video play error:", err));
      } else {
        video.pause();
        setIsPlaying(false);
        onPause?.();
      }
    };

    // Handle 10 seconds backward
    const skipBackward = () => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(0, video.currentTime - 10);
    };

    // Handle 10 seconds forward
    const skipForward = () => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
    };

    // Handle progress bar click and drag
    const handleProgressClick = (e) => {
      const video = videoRef.current;
      const progress = progressRef.current;
      if (!video || !progress) return;

      const rect = progress.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      video.currentTime = percent * video.duration;
    };

    const handleProgressMouseDown = (e) => {
      const video = videoRef.current;
      if (!video) return;

      setIsDragging(true);
      wasPlayingBeforeSeek.current = !video.paused;
      console.log('[Drag] Was playing before seek:', wasPlayingBeforeSeek.current);
      if (wasPlayingBeforeSeek.current) {
        video.pause();
      }

      handleProgressClick(e);
    };

    const handleProgressMouseMove = (e) => {
      if (!isDragging) return;
      handleProgressClick(e);
    };

    const handleProgressMouseUp = () => {
      if (!isDragging) return;
      console.log('[Drag] Mouse up, was playing:', wasPlayingBeforeSeek.current);
      setIsDragging(false);

      const video = videoRef.current;
      if (video && wasPlayingBeforeSeek.current) {
        console.log('[Drag] Resuming playback');
        video.play().catch((err) => console.error('[Drag] Play error:', err));
      }
    };

    // Add global mouse event listeners for dragging
    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleProgressMouseMove);
        document.addEventListener('mouseup', handleProgressMouseUp);

        return () => {
          document.removeEventListener('mousemove', handleProgressMouseMove);
          document.removeEventListener('mouseup', handleProgressMouseUp);
        };
      }
    }, [isDragging]);

    // Handle volume change
    const handleVolumeChange = (e) => {
      const video = videoRef.current;
      if (!video) return;
      const newVolume = parseFloat(e.target.value);
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    };

    // Toggle mute
    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;
      if (isMuted) {
        video.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        video.volume = 0;
        setIsMuted(true);
      }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
      if (!containerRef.current) return;

      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.msRequestFullscreen) {
          containerRef.current.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };

    // Handle fullscreen change
    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(
          !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
          ),
        );
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.addEventListener("msfullscreenchange", handleFullscreenChange);

      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange,
        );
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullscreenChange,
        );
        document.removeEventListener(
          "msfullscreenchange",
          handleFullscreenChange,
        );
      };
    }, []);

    // Auto-hide controls
    useEffect(() => {
      if (isPlaying) {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);

        return () => {
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
        };
      } else {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }
    }, [isPlaying]);

    // Reset controls timeout on mouse move
    const resetControlsTimeout = () => {
      if (isPlaying) {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    // Prevent right-click context menu (to prevent download)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Handle video click to play/pause
    const handleVideoClick = (e) => {
      console.log(e.target);
      console.log(videoRef.current);

      // Don't handle click if it's on the overlay or controls
      if (
        e.target.closest(".absolute.inset-0.flex") ||
        e.target.closest(".absolute.bottom-0")
      ) {
        return;
      }

      togglePlayPause(e);
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
      <div
        ref={containerRef}
        className={`relative group ${className}`}
        onMouseMove={resetControlsTimeout}
        onMouseLeave={() => {
          if (isPlaying && controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
            setShowControls(false);
          }
        }}
      >
        <video
          ref={videoRef}
          id={id}
          src={src}
          poster={poster}
          className="w-full h-full object-cover"
          onContextMenu={handleContextMenu}
          onClick={handleVideoClick}
          onPlay={(e) => {
            // Pause all other videos and audio when this video plays
            if (pauseOtherVideos) {
              pauseAllAudio();
              const allVideos = document.querySelectorAll("video");
              allVideos.forEach((v) => {
                if (v !== e.target && !v.paused) {
                  v.pause();
                }
              });
            }
            setIsPlaying(true);
            onPlay?.();
          }}
          onPause={() => {
            setIsPlaying(false);
            onPause?.();
          }}
          onSeeking={(e) => {
            // Only track if not dragging (dragging handles its own state)
            if (!isDragging) {
              wasPlayingBeforeSeek.current = !e.target.paused;
            }
          }}
          onSeeked={(e) => {
            // Only resume if not dragging (dragging handles its own resume)
            if (!isDragging && wasPlayingBeforeSeek.current && e.target.paused) {
              e.target.play().catch(() => {});
            }
          }}
          autoPlay={autoPlay}
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
        />

        {/* Play Button Overlay (when video is paused) */}
        {showPlayButtonOverlay && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const video = videoRef.current;
              if (video && video.paused) {
                togglePlayPause(e);
              }
            }}
            className="z-30 pointer-events-auto hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/images/play_button.png"
              className="w-[100px] sm:w-[150px]"
              alt="Play Button"
            />
          </button>
        </div>
      )}

        {/* Custom Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="w-full h-3 bg-gray-600 cursor-pointer group/progress relative"
            onMouseDown={handleProgressMouseDown}
          >
            <div
              className="h-full bg-[#5DC9DE] relative"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Draggable thumb */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing" />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-[#5DC9DE] transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <FaPause className="text-xl" />
                ) : (
                  <FaPlay className="text-xl" />
                )}
              </button>

              {/* 10s Backward */}
              <button
                onClick={skipBackward}
                className="text-white hover:text-[#5DC9DE] transition-colors"
                aria-label="Skip backward 10 seconds"
                title="Backward 10s"
              >
                <FaBackward className="text-lg" />
              </button>

              {/* 10s Forward */}
              <button
                onClick={skipForward}
                className="text-white hover:text-[#5DC9DE] transition-colors"
                aria-label="Skip forward 10 seconds"
                title="forward 10s"
              >
                <FaForward className="text-lg" />
              </button>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-[#5DC9DE] transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <FaVolumeMute className="text-lg" />
                  ) : (
                    <FaVolumeUp className="text-lg" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#5DC9DE]"
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            {allowFullscreen && (
              <div className="flex items-center">
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-[#5DC9DE] transition-colors"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <FaCompress className="text-lg" />
                  ) : (
                    <FaExpand className="text-lg" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default CustomVideoPlayer;
CustomVideoPlayer.displayName = "CustomVideoPlayer";
