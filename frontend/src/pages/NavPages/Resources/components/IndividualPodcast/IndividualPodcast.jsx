import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import axiosApi from "../../../../../conf/axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  updateReactions,
  addComment,
  updateComment,
  setComments,
} from "../../../../../slice/contentInteractionSlice";
import Like from "../../../../../../public/assets/images/Like.png";
import Liked from "../../../../../../public/assets/images/liked.png";
import Dislike from "../../../../../../public/assets/images/Dislike.png";
import Disliked from "../../../../../../public/assets/images/disliked.png";

// Updated format function for consistency with K notation
const formatViews = (views) => {
  if (!views && views !== 0) return "0 views";

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  // Always use K format even for small numbers
  return `${(views / 1000).toFixed(1)}K views`;
};

const IndividualPodcast = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [socket, setSocket] = useState(null);
  const [content, setContent] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const [userName, setUserName] = useState("");
  const dispatch = useDispatch();
  const { reactions, comments } = useSelector(
    (state) => state.contentInteraction
  );
  const contentReactionRef = useRef(null);
  const commentsReactionRef = useRef({});
  const [refresh, setRefresh] = useState(false);

  // Prevent body scrolling when component mounts
  useEffect(() => {
    // Fix the body scroll position at the top when this component mounts
    window.scrollTo(0, 0);
    // Ensure the body can scroll for this view
    document.body.style.overflow = "";

    return () => {
      // Reset any body styles when unmounting
      document.body.style.overflow = "";
    };
  }, []);

  const initializeSocket = () => {
    try {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ["websocket", "polling"],
        path: "/socket.io/",
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setSocket(newSocket);
        socketRef.current = newSocket;
        initializeConnection(newSocket);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      return newSocket;
    } catch (error) {
      console.error("Socket initialization error:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!id) return;
    const socket = initializeSocket();

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [id]);

  const initializeConnection = async (socketInstance) => {
    if (!id || !socketInstance) return;

    try {
      const response = await axiosApi.post(`/content/content/${id}/connect`);

      const { connectionId } = response.data;
      const contentData = response.data.initialData;

      // Set content and update Redux store
      setContent(contentData);
      dispatch(setComments(contentData.comments || []));
      dispatch(
        updateReactions({
          likes: contentData.likes || 0,
          dislikes: contentData.dislikes || 0,
        })
      );

      // Authenticate with socket connection
      if (socketInstance.connected) {
        socketInstance.emit("authenticate", {
          connectionId,
          contentId: id,
        });
      } else {
        socketInstance.on("connect", () => {
          socketInstance.emit("authenticate", {
            connectionId,
            contentId: id,
          });
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error(
        "[Frontend:initializeConnection] Error:",
        error.response || error
      );
      setIsLoading(false); // Ensure loading state ends even on error
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for socket events
    socket.on("content_details", (data) => {
      handleContentDetails(data);
    });

    socket.on("reaction_updated", (data) => {
      handleReactionUpdate(data);
    });

    socket.on("new_comment", (data) => {
      handleNewComment(data);
    });

    socket.on("comment_updated", (data) => {
      handleCommentUpdate(data);
    });

    socket.on("error", (error) => {
      console.error("[Frontend:socketError]", error);
    });

    return () => {
      socket.off("content_details");
      socket.off("reaction_updated");
      socket.off("new_comment");
      socket.off("comment_updated");
      socket.off("error");
    };
  }, [socket]);

  const handleContentDetails = (data) => {
    setContent(data);
    dispatch(setComments(data.comments || []));
    dispatch(
      updateReactions({
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
      })
    );
  };

  const handleReactionUpdate = (data) => {
    if (
      data &&
      typeof data.likes === "number" &&
      typeof data.dislikes === "number"
    ) {
      dispatch(
        updateReactions({
          likes: data.likes,
          dislikes: data.dislikes,
        })
      );
    }
  };

  const handleNewComment = (comment) => {
    if (comment && comment.id) {
      dispatch(addComment(comment));
    }
  };

  const handleCommentUpdate = (updatedComment) => {
    if (updatedComment && updatedComment.id) {
      dispatch(updateComment(updatedComment));
    }
  };

  const handleReaction = (action) => {
    if (!socket) return;

    // Prevent duplicate reactions
    if (contentReactionRef.current === action) return;

    // If switching reaction types
    if (contentReactionRef.current) {
      socket.emit("toggle_reaction", {
        action: "none",
        contentId: id,
        previousReaction: contentReactionRef.current,
      });
    }

    contentReactionRef.current = action;
    socket.emit("toggle_reaction", {
      action,
      contentId: id,
      previousReaction: null,
    });
  };

  const handleCommentReaction = (commentId, action) => {
    if (!socket) return;

    const currentReaction = commentsReactionRef.current[commentId];
    // Prevent duplicate reactions
    if (currentReaction === action) return;

    // If switching reaction types
    if (currentReaction) {
      socket.emit("toggle_comment_reaction", {
        commentId,
        action: "none",
      });
    }

    commentsReactionRef.current[commentId] = action;
    socket.emit("toggle_comment_reaction", { commentId, action });
  };

  const submitComment = () => {
    if (!socket || !newComment.trim() || !userName.trim()) {
      return;
    }

    socket.emit("add_comment", {
      contentId: id,
      name: userName,
      comment: newComment.trim(),
    });

    setUserName("");
    setNewComment("");
  };

  // Improved video playback control with auto-play
  const togglePlayPause = () => {
    if (!videoRef.current || !socket) return;

    if (videoRef.current.paused) {
      // Use a play promise to handle browser autoplay policies
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            socket.emit("content_started", { contentId: id });
          })
          .catch((error) => {
            console.error("Video play error:", error);
            // Try again with simulated user interaction
            setTimeout(() => {
              videoRef.current
                .play()
                .then(() => {
                  setIsPlaying(true);
                  socket.emit("content_started", { contentId: id });
                })
                .catch((err) =>
                  console.error("Second play attempt failed:", err)
                );
            }, 100);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      socket.emit("content_paused", {
        contentId: id,
        currentTime: videoRef.current.currentTime,
      });
    }
  };

  // Video progress tracking
  useEffect(() => {
    if (!videoRef.current || !socket) return;

    const handleTimeUpdate = () => {
      socket.emit("content_progress", {
        contentId: id,
        currentTime: videoRef.current.currentTime,
      });
    };

    videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [socket, id]);

  if (isLoading) {
    return (
      <div className="text-white py-40 min-h-screen container mx-auto flex items-center justify-center">
        <div className="text-xl">Loading content...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-white py-40 min-h-screen container mx-auto flex items-center justify-center">
        <div className="text-xl">Content not found</div>
      </div>
    );
  }

  return (
    <div className="text-white py-40 min-h-screen xl:px-16 lg:px-10 px-6 container mx-auto">
      {/* Video Preview Section */}
      <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden md:p-12">
        <video
          controls
          download={false}
          controlsList="nodownload"
          ref={videoRef}
          src={content.video_url}
          className="w-full h-full object-cover"
          poster={content.thumbnail_url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {!isPlaying && (
          <button
            onClick={togglePlayPause}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <img
              src="/assets/images/playButton.png"
              alt="Play"
              className="w-30 h-30 opacity-80 hover:opacity-100 transition-opacity"
            />
          </button>
        )}
      </div>

      {/* Tags */}
      {/* <div className="flex gap-2 text-gray-400 text-sm mb-2">
        {content.tags?.map((tag, index) => (
          <span key={index}>#{tag}</span>
        ))}
      </div> */}

      {/* Title and Stats */}
      <div className="flex lg:flex-row flex-col lg:items-center lg:justify-between mb-4">
        <h1 className="text-2xl font-bold">{content.title}</h1>
        <div className="flex mt-5 lg:mt-0 items-center gap-4">
          <button
            onClick={() => handleReaction("like")}
            className="flex items-center gap-2"
          >
            <img
              src={contentReactionRef.current === "like" ? Liked : Like}
              className="w-10 h-10"
              alt="Like"
            />
            <span className="text-purple-400">{reactions.likes}</span>
          </button>
          <button
            onClick={() => handleReaction("dislike")}
            className="cursor-pointer"
          >
            <img
              src={
                contentReactionRef.current === "dislike" ? Disliked : Dislike
              }
              alt="Dislike"
              className="w-10 h-10"
            />
          </button>
        </div>
      </div>

      {/* Author and Duration */}
      <div className="flex items-center gap-4 text-[#5DC9DE] text-sm mb-6">
        <span>{content.credit_name}</span>
        <span>•</span>
        <span className="font-bold">
          {content.duration_in_minutes || "--"} mins
        </span>
        <span>—</span>
        <span className="font-bold">
          {formatViews(parseInt(content.views || 0))}
        </span>
      </div>

      {/* Categories */}
            <div className="flex gap-4 mb-6">
        {content.keywords?.map((keyword, index) => (
          <span
            key={index}
            className="bg-purple-600 px-2 md:px-4 py-1 rounded-full text-xs md:text-sm"
          >
            {keyword}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-gray-400 mb-8">{content.description}</p>

      {/* CTA Button */}
      <button
        className="bg-[#5DC9DE] hover:font-bold text-black px-6 py-3 rounded-full font-medium transition-colors mb-12"
        onClick={() =>{window.location.href=import.meta.env.VITE_PORTAL_URL+'/auth/signup'}}
      >
        Book Your Spot - Sign Up Now
      </button>

      {/* Comments Section */}
      <div className="space-y-8 mt-12">
        <h2 className="text-xl font-bold">Add Your Comments:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Comment Input */}
          <div className="flex gap-4 col-span-1">
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name..."
              className="flex-1 bg-transparent p-2 md:p-4 focus:outline-none border-b-[1px] border-neutral-700"
            />
          </div>
          <div className="relative col-span-1 md:col-span-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comments..."
              className="w-full bg-transparent p-2 md:p-4 focus:outline-none min-h-[60px] md:min-h-[100px] border-b-[1px] border-neutral-700"
            />
            <button
              onClick={submitComment}
              disabled={!userName.trim() || !newComment.trim()}
              className={`absolute bottom-2 md:bottom-4 right-2 md:right-4 p-1 md:p-2 rounded-full ${
                !userName.trim() || !newComment.trim()
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              <img
                src="/assets/images/Send.png"
                alt="Send"
                className="w-4 h-4 md:w-5 md:h-5"
              />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <img
                src="/assets/images/pfp.png"
                alt={comment.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium mb-1">{comment.name}</h3>
                <p className="text-gray-400 text-sm">{comment.comment}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCommentReaction(comment.id, "like")}
                  className="flex items-center gap-2"
                >
                  <img
                    src={
                      commentsReactionRef.current[comment.id] === "like"
                        ? Liked
                        : Like
                    }
                    className="w-6 h-6"
                    alt="Like"
                  />
                  <span className="text-purple-400">{comment.likes || 0}</span>
                </button>
                <button
                  onClick={() => handleCommentReaction(comment.id, "dislike")}
                  className="cursor-pointer"
                >
                  <img
                    src={
                      commentsReactionRef.current[comment.id] === "dislike"
                        ? Disliked
                        : Dislike
                    }
                    alt="Dislike"
                    className="w-6 h-6"
                  />
                </button>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center text-gray-400">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualPodcast;
