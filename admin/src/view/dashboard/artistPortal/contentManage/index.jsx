import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios"; // Adjust if needed
import { Lock, Unlock } from "lucide-react";
import toast from "react-hot-toast";

const ContentManage = () => {
  const { ophid, songId } = useParams();

  const [loading, setLoading] = useState(true);
  const hasInteracted = useRef({ Content: false, Audio: false, Video: false });

  const languages = [
    { name: "English", id: 1 },
    { name: "Hindi", id: 2 },
    { name: "Marathi", id: 3 },
  ];

  const [content, setContent] = useState({
    project_type: "",
    video_type: "",
    release_date: "",
  });

  const [audio, setAudio] = useState({
    song_name: "",
    language: "",
    genre: "",
    sub_genre: "",
    mood: "",
    lyrics: "",
    primary_artist: "",
    secondary_artists: [],
    audio_url: "",
    audio_file: null, // For new file uploads
  });

  const [secondaryArtists, setSecondaryArtists] = useState([]);

  const [video, setVideo] = useState({
    credits: "",
    image: "",
    video: "",
    images: [], // Array to store multiple images
    video_file: null, // For new video file uploads
    image_files: [], // For new image file uploads
  });

  useEffect(() => {
    const fetchSongData = async () => {
      setLoading(true);
      try {
        const res = await axiosApi.get(`/song-approved/${ophid}/${songId}`);
        const song = res.data.song;

        // Convert to yyyy-mm-dd format for input[type=date]
        const formattedReleaseDate = song.release_date
          ? new Date(song.release_date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "";

        if (!hasInteracted.current.Content) {
          setContent({
            project_type: song.project_type || "",
            CP_Line: song.primary_artist || "",
            PLine: song.primary_artist || "",
            release_date: formattedReleaseDate,
          });
        }

        if (!hasInteracted.current.Audio) {
          setAudio({
            song_name: song.audio_song_name || "",
            language: song.language || "",
            genre: song.genre || "",
            sub_genre: song.sub_genre || "",
            mood: song.mood || "",
            lyrics: song.lyrics || "",
            primary_artist: song.primary_artist || "",
            secondary_artists: [],
            audio_url: song.audio_url || "",
          });
        }

        // Fetch secondary artists separately
        try {
          const secondaryRes = await axiosApi.get(`/secondary-artists-by-song/${songId}`);
          if (secondaryRes.data.success && secondaryRes.data.data) {
            setSecondaryArtists(secondaryRes.data.data);
          }
        } catch (err) {
          console.error("Error fetching secondary artists:", err);
          setSecondaryArtists([]);
        }

        let parsedImages = [];
        let parsedImage = "";
        try {
          const imgArray = JSON.parse(song.image_url);
          if (Array.isArray(imgArray)) {
            parsedImages = imgArray;
            parsedImage = imgArray[0] || "";
          }
        } catch (err) {
          console.error("Failed to parse image_url", err);
          // If it's not JSON, treat as single image
          if (song.image_url) {
            parsedImage = song.image_url;
            parsedImages = [song.image_url];
          }
        }

        if (!hasInteracted.current.Video) {
          setVideo({
            credits: song.credits || "",
            image: parsedImage || "",
            video: song.video_url || "",
            images: parsedImages,
          });
        }
      } catch (err) {
        console.error("Error fetching approved song:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongData();
  }, [ophid, songId]);

  const handleSectionChange = (section, setStateFn) => (e) => {
    hasInteracted.current[section] = true;
    const { name, value } = e.target;
    setStateFn((prev) => ({ ...prev, [name]: value }));
  };

  const updateAudioSection = async (audioData) => {
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('Song_name', audioData.song_name);
      formData.append('language', audioData.language);
      formData.append('genre', audioData.genre);
      formData.append('sub_genre', audioData.sub_genre || '');
      formData.append('mood', audioData.mood || '');
      formData.append('lyrics', audioData.lyrics || '');
      formData.append('primary_artist', audioData.primary_artist);
      
      // Add existing audio URL if no new file is being uploaded
      if (audioData.audio_url && !audioData.audio_file) {
        formData.append('audio_url', audioData.audio_url);
      }

      // Add audio file if provided
      if (audioData.audio_file) {
        formData.append('audio_file', audioData.audio_file);
      }

      const response = await axiosApi.put(`/audio/${songId}/${ophid}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("✅ Audio section updated successfully!");
        console.log("Audio update response:", response.data);
        
        // Update the audio_url in state if a new file was uploaded
        if (response.data.audio_url) {
          setAudio(prev => ({ ...prev, audio_url: response.data.audio_url }));
        }
      } else {
        throw new Error(response.data.message || "Audio update failed");
      }
    } catch (error) {
      console.error("Audio update error:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  };

  const updateVideoSection = async (videoData) => {
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('credits', videoData.credits);
      
      // Add existing video URL if no new file is being uploaded
      if (videoData.video && !videoData.video_file) {
        formData.append('video_url', videoData.video);
      }

      // Add video file if provided
      if (videoData.video_file) {
        formData.append('video_file', videoData.video_file);
      }

      // Handle existing images - always send current list (can be empty)
      formData.append('image_url', JSON.stringify(videoData.images || []));

      // Add new image files if provided
      if (videoData.image_files && videoData.image_files.length > 0) {
        // Validate max 3 images total
        const existingImages = videoData.images || [];
        const totalImages = existingImages.length + videoData.image_files.length;
        if (totalImages > 3) {
          toast.error("❌ Maximum 3 images allowed for video section");
          return;
        }

        // Add each image file
        videoData.image_files.forEach((file) => {
          formData.append('thumbnails', file);
        });
      }

      const response = await axiosApi.put(`/video/${songId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success("✅ Video section updated successfully!");
        console.log("Video update response:", response.data);
        
        // Update the video_url and images in state if new files were uploaded
        if (response.data.video_url) {
          setVideo(prev => ({ ...prev, video: response.data.video_url }));
        }
        if (response.data.image_urls) {
          setVideo(prev => ({ ...prev, images: response.data.image_urls, image_files: [] }));
        }
      } else {
        throw new Error(response.data.message || "Video update failed");
      }
    } catch (error) {
      console.error("Video update error:", error);
      if (error.response?.data?.message?.includes("Maximum 3 images allowed")) {
        toast.error("❌ Maximum 3 images allowed for video section");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw error;
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-10">
        <div className="mb-6 text-lg text-gray-600">
          <strong>OphID:</strong> {ophid} &nbsp; | &nbsp;{" "}
          <strong>SongID:</strong> {songId}
        </div>

        <SectionBlock
          section="Content"
          data={content}
          fields={["project_type", "CP_Line", "PLine", "release_date"]}
          onChange={handleSectionChange("Content", setContent)}
          updateFunction={null}
        />

        <SectionBlock
          section="Audio"
          data={audio}
          fields={[
            "song_name",
            "language",
            "genre",
            "sub_genre",
            "mood",
            "lyrics",
            "primary_artist",
            "audio_url",
          ]}
          onChange={handleSectionChange("Audio", setAudio)}
          updateFunction={updateAudioSection}
          languages={languages}
          renderExtra={() => (
            <div className="mt-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Secondary Artists</h3>
              {secondaryArtists.length > 0 ? (
                <div className="space-y-4">
                  {secondaryArtists.map((artist, idx) => (
                    <div
                      key={idx}
                      className="p-4 border rounded-lg bg-gray-50 space-y-3"
                    >
                      <div className="flex items-start gap-4">
                        {artist.artistPictureUrl && (
                          <img
                            src={artist.artistPictureUrl}
                            alt={artist.artist_name || "Artist"}
                            className="w-20 h-20 object-cover rounded-lg border"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/80?text=No+Image";
                            }}
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <strong className="text-gray-700">Artist Type:</strong>
                              <div className="text-gray-900">{artist.artist_type || "—"}</div>
                            </div>
                            <div>
                              <strong className="text-gray-700">Artist Name:</strong>
                              <div className="text-gray-900">{artist.artist_name || "—"}</div>
                            </div>
                            <div>
                              <strong className="text-gray-700">Legal Name:</strong>
                              <div className="text-gray-900">{artist.Legal_name || "—"}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 pt-2 border-t">
                            {artist.SpotifyLink && (
                              <a
                                href={artist.SpotifyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                Spotify ↗
                              </a>
                            )}
                            {artist.InstagramLink && (
                              <a
                                href={artist.InstagramLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                              >
                                Instagram ↗
                              </a>
                            )}
                            {artist.FacebookLink && (
                              <a
                                href={artist.FacebookLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Facebook ↗
                              </a>
                            )}
                            {artist.AppleMusicLink && (
                              <a
                                href={artist.AppleMusicLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Apple Music ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No secondary artists.</p>
              )}
            </div>
          )}
        />

        <SectionBlock
          section="Video"
          data={video}
          fields={["credits"]}
          onChange={handleSectionChange("Video", setVideo)}
          updateFunction={updateVideoSection}
          renderExtra={() => (
            <div className="space-y-4">
              {/* Multiple Images Display */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Images ({video.images?.length || 0}/3)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {video.images?.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-24 object-cover rounded shadow"
                      />
                      <button
                        onClick={() => {
                          const newImages = video.images.filter((_, i) => i !== index);
                          setVideo(prev => ({ ...prev, images: newImages }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {video.images?.length < 3 && (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          const totalImages = (video.images?.length || 0) + files.length;
                          if (totalImages > 3) {
                            toast.error("❌ Maximum 3 images allowed total");
                            return;
                          }
                          setVideo(prev => ({ ...prev, image_files: files }));
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center h-24 p-3 text-sm font-medium text-gray-700 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0d3c44] hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      >
                        <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">Upload Images</span>
                      </label>
                    </div>
                  )}
                </div>
                {video.images?.length >= 3 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum 3 images reached
                  </p>
                )}
                
                {/* New Image Files Preview */}
                {video.image_files && video.image_files.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">New Images Selected:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {video.image_files.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded shadow"
                          />
                          <button
                            onClick={() => {
                              const newFiles = video.image_files.filter((_, i) => i !== index);
                              setVideo(prev => ({ ...prev, image_files: newFiles }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            title="Remove file"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Display and Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Video</h3>
                {video.video && (
                  <video
                    src={video.video}
                    controls
                    className="w-full rounded border mb-4"
                  />
                )}
                
                {/* Custom File Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setVideo(prev => ({ ...prev, video_file: file }));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0d3c44] hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {video.video_file ? 'Change Video File' : 'Upload Video File'}
                  </label>
                </div>
                
                {video.video_file && (
                  <div className="mt-3 space-y-3">
                    {/* Video Preview */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Video Preview</h4>
                      <video
                        src={URL.createObjectURL(video.video_file)}
                        controls
                        className="w-full rounded border"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                    
                    {/* File Info */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-green-700 font-medium">
                            New video selected: {video.video_file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setVideo(prev => ({ ...prev, video_file: null }));
                            // Reset the file input
                            const fileInput = document.getElementById('video-upload');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="Remove video"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        File size: {(video.video_file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        />
      </div>
    </div>
  );
};

const SectionBlock = ({ section, data, fields, onChange, updateFunction, renderExtra, languages = [] }) => {
  const [unlockFields, setunlockFields] = useState({
    Content: {},
    Audio: {},
    Video: {},
  });

  const showConfirmationToast = (onConfirm) => {
    toast(
      (t) => (
        <div>
          <div className="text-sm text-gray-900">
            Are you sure you want to save?
          </div>
          <div className="mt-3 flex justify-center gap-4">
            <button
              className="bg-[#0d3c44] text-white px-6 py-2 rounded-md hover:bg-[#0a2d33] transition"
              onClick={() => {
                onConfirm();
                toast.dismiss(t.id);
              }}
            >
              Yes
            </button>
            <button
              className="bg-gray-300 px-6 py-2 rounded-md hover:bg-gray-400 transition"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    );
  };

  const [initialData] = useState({ 
    ...data,
    audio_file: null,
    video_file: null,
    image_files: [],
    images: data.images || [] // Include images array for Video section
  });

  const toggleLock = (field) => {
    setunlockFields((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section]?.[field],
      },
    }));
  };

  // const handleSubmit = () => {
  //   const changes = {};
  //   for (const key of fields) {
  //     if (initialData[key] !== data[key]) {
  //       changes[key] = {
  //         old: initialData[key],
  //         new: data[key],
  //       };
  //     }
  //   }
  //   console.log(`🔄 [${section}] Changes Submitted:`, changes);
  // };

  //   const handleSubmit = () => {
  //   console.log(`📤 [${section}] Submitted Data:`, data);
  // };

  const handleSubmit = async () => {
    let hasChanges = false;

    // Check for changes in regular fields
    for (const key of fields) {
      if (initialData[key] !== data[key]) {
        hasChanges = true;
        break;
      }
    }

    // Check for file changes (audio_file, video_file, image_files)
    if (!hasChanges) {
      if (data.audio_file || data.video_file || (data.image_files && data.image_files.length > 0)) {
        hasChanges = true;
      }
    }

    // Check for image array changes (for Video section)
    if (!hasChanges && section === "Video" && data.images) {
      const initialImages = initialData.images || [];
      const currentImages = data.images || [];
      
      // Check if arrays are different length or have different content
      if (initialImages.length !== currentImages.length) {
        hasChanges = true;
      } else {
        // Check if any image URLs are different
        for (let i = 0; i < initialImages.length; i++) {
          if (initialImages[i] !== currentImages[i]) {
            hasChanges = true;
            break;
          }
        }
      }
    }

    if (!hasChanges) {
      toast.success(`✅ [${section}] No changes to save`);
      return;
    }

    if (!updateFunction) {
      console.log(`⚠️ [${section}] Update not implemented yet`);
      toast.info(`⚠️ [${section}] Update functionality not implemented yet`);
      return;
    }

    showConfirmationToast(async () => {
      try {
        console.log(`📤 [${section}] Submitted Data:`, data);
        await updateFunction(data);
      } catch (error) {
        console.error(`❌ [${section}] Update failed:`, error);
        toast.error(`❌ [${section}] Update failed: ${error.message}`);
      }
    });
  };

  return (
    <div className="bg-gray-50 rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-2xl font-bold text-[#0d3c44] mb-2 border-b pb-1">
        {section} Details
      </h2>

      {fields.map((field) => {
        const isReadOnly =
          field === "release_date" ||
          (section === "Audio" && field === "secondary_artists") ||
          !unlockFields?.[section]?.[field];

        return (
          <Field key={field} label={field}>
            <div className="flex items-center gap-2">
              {field === "lyrics" || field === "credits" ? (
                <textarea
                  name={field}
                  value={data[field]}
                  onChange={onChange}
                  readOnly={isReadOnly}
                  className={`w-full p-2 border rounded-md text-black bg-white ${
                    isReadOnly ? "bg-gray-100" : ""
                  }`}
                />
              ) : field.includes("audio_url") ? (
                <div className="space-y-3">
                  <audio controls className="w-full max-w-xs rounded border mb-3">
                    <source src={data[field]} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  
                  {/* Custom Audio File Upload Button */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          onChange({ target: { name: 'audio_file', value: file } });
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="audio-upload"
                    />
                    <label
                      htmlFor="audio-upload"
                      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0d3c44] hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    >
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {data.audio_file ? 'Change Audio File' : 'Upload Audio File'}
                    </label>
                  </div>
                  
                  {data.audio_file && (
                    <div className="mt-3 space-y-3">
                      {/* Audio Preview */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Audio Preview</h4>
                        <audio
                          src={URL.createObjectURL(data.audio_file)}
                          controls
                          className="w-full"
                        />
                      </div>
                      
                      {/* File Info */}
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-green-700 font-medium">
                              New audio selected: {data.audio_file.name}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              onChange({ target: { name: 'audio_file', value: null } });
                              // Reset the file input
                              const fileInput = document.getElementById('audio-upload');
                              if (fileInput) fileInput.value = '';
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Remove audio"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          File size: {(data.audio_file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Special handling: show language name based on id for Audio section
                section === "Audio" && field === "language" ? (
                  <input
                    type="text"
                    name={field}
                    value={(languages.find(l => String(l.id) === String(data.language))?.name) || data.language || ""}
                    readOnly={true}
                    className={`w-full p-2 border rounded-md text-black bg-gray-100`}
                  />
                ) : (
                <input
                  type="text"
                  name={field}
                  value={data[field]}
                  onChange={onChange}
                  readOnly={isReadOnly}
                  className={`w-full p-2 border rounded-md text-black ${
                    isReadOnly ? "bg-gray-100" : "bg-white"
                  }`}
                />
                )
              )}

              {field !== "release_date" && (
                <button
                  onClick={() => toggleLock(field)}
                  type="button"
                  className="text-gray-600 hover:text-gray-800"
                  title={isReadOnly ? "Unlock to edit" : "Lock"}
                >
                  {isReadOnly ? <Lock size={18} /> : <Unlock size={18} />}
                </button>
              )}
            </div>
          </Field>
        );
      })}

      {renderExtra && renderExtra()}

      <div className="pt-4 text-right">
        <button
          onClick={handleSubmit}
          className="bg-[#0d3c44] text-white px-6 py-2 rounded-md hover:bg-[#0a2d33] transition"
        >
          Save {section} Details
        </button>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-gray-700 text-sm font-semibold mb-1 capitalize">
      {label.replace(/_/g, " ")}
    </label>
    {children}
  </div>
);

export default ContentManage;
