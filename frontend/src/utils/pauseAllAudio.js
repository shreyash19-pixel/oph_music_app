/**
 * Pauses all audio elements on the page (NOT video elements)
 * This is useful when a video starts playing to prevent audio conflicts
 */
export const pauseAllAudio = () => {
  // Find all audio elements in the document (NOT video elements)
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach((audio) => {
    if (!audio.paused) {
      audio.pause();
    }
  });

  // Dispatch a custom event to notify components with Audio objects to pause
  // Components that use new Audio() should listen to this event
  const pauseEvent = new CustomEvent('pauseAllAudio');
  window.dispatchEvent(pauseEvent);
};

