import React, { useEffect, useRef, useState } from "react";
import { Camera, ChevronDown } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PrimaryBtn from "../../../components/Button/PrimaryBtn";
import axiosApi from "../../../conf/axios";
import { useArtist } from "../../auth/API/ArtistContext";
// import { toast } from "react-hot-toast";
import Loading from "../../../components/Loading";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

function SecondaryArtistForm({ artistType, onClose, onArtistAdd }) {
  const [name, setName] = useState("");
  const [legal_name, setLegalName] = useState("");
  const [spotify, setSpotify] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [apple, setApple] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { contentId } = useParams();
  const { headers } = useArtist();

  const handleSubmitSecondary = async (e) => {
    e.preventDefault();

    // Regex for Instagram and Spotify URLs
    // const instagramRegex =
    //   /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/;
    // // const spotifyRegex = /^(https?:\/\/)?(open\.)?spotify\.com\/[a-zA-Z0-9._%+-]+\/?$/;
    // const spotifyRegex =
    //   /(?:https:\/\/open\.spotify\.com\/artist\/)([A-Za-z0-9]+)/;
    // // Validate URL fields
    // const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/;
    // if (spotify && !spotifyRegex.test(spotify)) {
    //   toast.error("Invalid Spotify URL");
    //   return;
    // }
    // if (facebook && !urlPattern.test(facebook)) {
    //   toast.error("Invalid Facebook URL");
    //   return;
    // }
    // if (instagram && !instagramRegex.test(instagram)) {
    //   toast.error("Invalid Instagram URL");
    //   return;
    // }
    // if (apple && !urlPattern.test(apple)) {
    //   toast.error("Invalid Apple Music URL");
    //   return;
    // }

    const data = {
      name,
      artistType,
      contentId,
      legal_name,
      spotify_url: spotify,
      facebook_url: facebook,
      instagram_url: instagram,
      apple_music_url: apple,
      profile_image: profileImage,
    };

    const formData = new FormData();

    formData.append("artist_name", data.name)
    formData.append("artist_type", data.artistType)
    formData.append("song_id", data.contentId)
    formData.append("legal_name", data.legal_name)
    formData.append("spotify_url", data.spotify_url)
    formData.append("facebook_url", data.facebook_url)
    formData.append("instagram_url", data.instagram_url)
    formData.append("apple_music_url", data.apple_music_url)

    if (data.profile_image) {

      formData.append("profile_image", data.profile_image)
    }


    try {

      const response = await axiosApi.post("/secondary-artist", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...headers
        }
      })

      if (response.data.success) {
        onArtistAdd(artistType, data);
        onClose();
      }

    }
    catch (error) {
      console.error("Error posting secondary artist")
    }

  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, and PNG files are allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setProfileImage(file);

  };

  return (
    <div className="mt-4 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-cyan-400">
          Add Secondary Artist
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
          ×
        </button>
      </div>

      <form onSubmit={handleSubmitSecondary} className="space-y-6">
        <div className="space-y-2">
          <label className="block">
            Artist name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Artist name"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block">
            Legal name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Legal name"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            onChange={(e) => setLegalName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block">
            Upload Artist Picture <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={URL.createObjectURL(profileImage)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="profile-image"
              accept="image/*"
              required
            />
            <label
              htmlFor="profile-image"
              className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              {uploading ? "Uploading..." : "Upload Artist Picture"}
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block">
            Add Instagram <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Instagram"
            className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
            onChange={(e) => setInstagram(e.target.value)}
            required
          />
        </div>

        {["Spotify", "Facebook", "Apple Music"].map((platform) => (
          <div key={platform} className="space-y-2">
            <label className="block">Add {platform}</label>
            <input
              type="text"
              placeholder={platform}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
              onChange={(e) => {
                switch (platform) {
                  case "Spotify":
                    setSpotify(e.target.value);
                    break;
                  case "Facebook":
                    setFacebook(e.target.value);
                    break;
                  case "Apple Music":
                    setApple(e.target.value);
                    break;
                  default:
                    break;
                }
              }}
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-cyan-400 text-gray-900 rounded-full p-3 font-semibold hover:bg-cyan-300 transition-colors"
        >
          Add Secondary Artist
        </button>
      </form>
    </div>
  );
}
export default function AudioMetadataForm() {
  const checkProjectType = localStorage.getItem("projectType");
  const navigate = useNavigate();
  const { contentId } = useParams();
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [langID, setLangID] = useState(null);
  const [genre, setGenre] = useState("");
  const [subGenre, setSubGenre] = useState("");
  const [mood, setMood] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [primary, setPrimary] = useState("");
  const [languages, setLanguages] = useState([{ name: "english", id: 1 }, { name: "hindi", id: 2 }, { name: "marathi", id: 3 }]);
  const [audioFileUrl, setAudioFileUrl] = useState(null);
  const location = useLocation()
  const [songName, setSongName] = useState(location.state.songName);
  const [showSecondaryForm, setShowSecondaryForm] = useState(false);
  const [selectedArtistType, setSelectedArtistType] = useState("");
  const [rejectReason, setRejectReason] = useState(null);
  const { headers, artist, user, ophid } = useArtist();

  const [featuringArtists, setFeaturingArtists] = useState([]);
  const [lyricistArtists, setLyricistArtists] = useState([]);
  const [composerArtists, setComposerArtists] = useState([]);
  const [producerArtists, setProducerArtists] = useState([]);

  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // const [subgenre, setSubgenre] = useState("");

  const genres = [
    "African",
    "Alternative",
    "Arabic",
    "Asian",
    "Blues",
    "Brazilian",
    "Children Music",
    "Christian & Gospel",
    "Classical",
    "Country",
    "Dance",
    "Easy Listening",
    "Electronic",
    "Folk",
    "Hip Hop / Rap",
    "Indian",
    "Jazz",
    "Latin",
    "Metal",
    "Pop",
    "R&B / Soul",
    "Reggae",
    "Relaxation",
    "Rock",
    "Various",
    "World Music / Regional Folklore",
  ];
  const subGenres = [
    "African",
    "Alternative",
    "Arabic",
    "Asian",
    "Blues",
    "Brazilian",
    "Children Music",
    "Christian & Gospel",
    "Classical",
    "Country",
    "Dance",
    "Easy Listening",
    "Electronic",
    "Folk",
    "Hip Hop / Rap",
    "Indian",
    "Jazz",
    "Latin",
    "Metal",
    "Pop",
    "R&B / Soul",
    "Reggae",
    "Relaxation",
    "Rock",
    "Various",
    "World Music / Regional Folklore",
  ];

  const moods = [
    "Patriotic",
    "Happy",
    "Chill",
    "Fusion",
    "Upbeat",
    "Calm",
    "Melodic",
    "Romantic",
    "Motivational",
    "Sad",
    "Bhakti",
    "Dark",
    "Energetic",
    "Nostalgic",
    "Acoustic",
    "Love",
  ];

  // Subgenre is based on the genre selected. Here, we'll map subgenres for each genre (you can fetch from an API if needed)
  // const subgenres = {
  //   "Hip Hop / Rap": ["Old School", "Trap", "Rap", "Lofi"],
  //   "Jazz": ["Smooth Jazz", "Bebop", "Big Band", "Cool Jazz"],
  //   "Rock": ["Alternative", "Indie", "Classic Rock", "Punk"],
  //   // Add other genre-based subgenres...
  // };

  // useEffect(() => {
  //   if (genre) {
  //     setSubgenre(""); // Reset subgenre when genre changes
  //   }
  // }, [genre]);

  const handleLanguageChange = (e) => {
    setLangID(e.target.value);
  };



  const handleGenreChange = (e) => {
    setGenre(e.target.value);
  };

  const handleMoodChange = (e) => {
    setMood(e.target.value);
  };

  const handleSubgenreChange = (e) => {
    setSubGenre(e.target.value);
  };

  const handleDivClick = () => {
    fileInputRef.current.click();
  };

  const handleArtistAdd = (artistType, artistData) => {
    switch (artistType) {
      case "Featuring Artist":
        setFeaturingArtists((prev) => [...prev, artistData]);
        break;
      case "Lyricist Artist":
        setLyricistArtists((prev) => [...prev, artistData]);
        break;
      case "Composer Artist":
        setComposerArtists((prev) => [...prev, artistData]);
        break;
      case "Producer Artist":
        setProducerArtists((prev) => [...prev, artistData]);
        break;
    }
    setShowSecondaryForm(false);
  };

  const handleArtistRemove = async (artistType, index, artistName, artistLegalName) => {

    const formData = new FormData()

    formData.append("song_id", contentId)
    formData.append("artist_type", artistType)
    formData.append("artist_name", artistName)
    formData.append("legal_name", artistLegalName)

    try {

      const response = await axiosApi.post("/remove-secondary-artist", formData, {
        headers: {
          "Content-Type": "application/json",
          ...headers
        }
      })

      if (response.data.success) {
        switch (artistType) {
          case "Featuring Artist":
            setFeaturingArtists((prev) => prev.filter((_, i) => i !== index));
            break;
          case "Lyricist Artist":
            setLyricistArtists((prev) => prev.filter((_, i) => i !== index));
            break;
          case "Composer Artist":
            setComposerArtists((prev) => prev.filter((_, i) => i !== index));
            break;
          case "Producer Artist":
            setProducerArtists((prev) => prev.filter((_, i) => i !== index));
            break;
        }

      }

    }
    catch (e) {
      console.log("Error removing artist");
    }


  };

  const handleSubmit = async (e) => {
    ;
    e.preventDefault();

    // setIsLoading(true);
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("OPH_ID", ophid);
      formData.append("song_id", contentId);
      formData.append("Song_name", songName);
      formData.append("languages", langID);
      formData.append("genre", genre);
      formData.append("sub_genre", subGenre);
      formData.append("project_type", checkProjectType)

      formData.append(
        "primary_artist",
        `${user?.userData?.artist.name} - ${user?.userData?.artist.stage_name
        }`
      );
      formData.append("mood", mood);
      formData.append("lyrics", lyrics);
      formData.append("next_step", "/dashboard/upload-song/video-metadata/")

      // Add secondary artists as objects
      // const addArtistsWithImages = (artists, type) => {
      //   artists.forEach((artist, index) => {
      //     formData.append(`${type}_artists[${index}][name]`, artist.name);
      //     formData.append(
      //       `${type}_artists[${index}][legal_name]`,
      //       artist.legal_name
      //     );
      //     formData.append(
      //       `${type}_artists[${index}][spotify_url]`,
      //       artist.spotify_url
      //     );
      //     formData.append(
      //       `${type}_artists[${index}][facebook_url]`,
      //       artist.facebook_url
      //     );
      //     formData.append(
      //       `${type}_artists[${index}][instagram_url]`,
      //       artist.instagram_url
      //     );
      //     formData.append(
      //       `${type}_artists[${index}][apple_music_url]`,
      //       artist.apple_music_url
      //     );

      //     if (artist.profile_image) {
      //       formData.append(`${type}_profile_images`, artist.profile_image); // Remove index for Multer
      //     }
      //   });
      // };

      // addArtistsWithImages(featuringArtists, "featuring");
      // addArtistsWithImages(lyricistArtists, "lyrics");
      // addArtistsWithImages(composerArtists, "composer");
      // addArtistsWithImages(producerArtists, "producer");

      // Add audio file if exists
      const manualFile = fileInputRef.current.files[0];

      if (manualFile || selectedFile) {
        formData.append("audio_file", manualFile || selectedFile);
      } else {
        toast.error("Audio file is required");
        setIsSubmitting(false);
        return;
      }

      const response = await axiosApi.post(
        `/audio-details`,
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setIsLoading(false);
        navigate(`/dashboard/upload-song/video-metadata/${response.data.song_id}`, {
          state: {
            SongName: location.state.songName
          }
        });
      }
    } catch (error) {
      console.error("Error submitting audio metadata:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {

    const fetchAudioMetadata = async () => {
      if (!contentId || !headers) {
        return;
      }

      try {
        const response = await axiosApi.get(
          `/audio-and-secondary-artist`,
          {
            headers: headers,
            params: { contentId, ophid }
          }
        );

        if (response.data.success) {
          const { audio_metadata, secondary_artists } =
            response.data.data;

          setSongName(audio_metadata[0]?.Song_name || location.state.songName);
          setLangID(audio_metadata[0]?.language || null);
          setGenre(audio_metadata[0]?.genre || "");
          setSubGenre(audio_metadata[0]?.sub_genre || "");
          setMood(audio_metadata[0]?.mood || "");
          setLyrics(audio_metadata[0]?.lyrics || "");
          setPrimary(audio_metadata[0]?.primary_artist || "");
          setLanguages(languages.find(lang => lang.id === audio_metadata[0]?.language) || languages);
          setRejectReason(audio_metadata[0]?.reject_reason || "");

          // Set audio file feedback
          if (audio_metadata[0]?.audio_url) {
            setAudioFileUrl(audio_metadata[0]?.audio_url);

            const blob = await getAudioAsBlob(audio_metadata[0]?.audio_url);
            const file = new File([blob], "audio.mp3", { type: blob.type });
            setSelectedFile(file);
            setUploadedFileName(
              audio_metadata[0]?.audio_url.split("/").pop()
            );

          }

          // Set secondary artists if they exist
          const parseArtist = (artist) => ({
            name: artist.artist_name,
            legal_name: artist.Legal_name,
            spotify_url: artist.SpotifyLink,
            facebook_url: artist.FacebookLink,
            instagram_url: artist.InstagramLink,
            apple_music_url: artist.AppleMusicLink,
            profile_image: artist.artistPictureUrl
              ? { name: "profile_image", url: artist.artistPictureUrl }
              : null,
          });

          setFeaturingArtists(
            secondary_artists
              .filter(artist => artist.artist_type === "Featuring Artist")
              .map(parseArtist)
          );

          setLyricistArtists(
            secondary_artists
              .filter(artist => artist.artist_type === "Lyricist Artist")
              .map(parseArtist)
          );

          setComposerArtists(
            secondary_artists
              .filter(artist => artist.artist_type === "Composer Artist")
              .map(parseArtist)
          );

          setProducerArtists(
            secondary_artists
              .filter(artist => artist.artist_type === "Producer Artist")
              .map(parseArtist)
          );

        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching audio metadata:", error);
          setError(`Failed to load audio metadata: ${error.message}`);
        }
      }
    };

    fetchAudioMetadata();

  }, [contentId, headers]);

  async function getAudioAsBlob(url) {
    const response = await fetch(url);
    const blob = await response.blob(); // File-like binary object
    return blob;
  }

  // Update the file input change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3"]; // Add allowed audio types
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only MP3, WAV, and MPEG files are allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setUploadedFileName(file.name);
    setAudioFileUrl(URL.createObjectURL(file)); // Preview the uploaded file
  };

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  // if (isSubmitting) {
  //   return <Loading />;
  // }

  return (

    <div className="min-h-[calc(100vh-70px)] text-gray-100 px-8 p-6">
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-2 text-cyan-400">Loading Analytics...</p>
        </div>
      )}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Primary Artist Form */}
          <div
            className={`max-w-xl col-span-1 ${showSecondaryForm ? "hidden lg:block" : ""
              }`}
          >
            <div className="">
              <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                Audio Metadata
              </h1>
              {
                rejectReason && <p className="text-red-700">Reason: {rejectReason}</p>
              }
              <div className="space-y-2 my-2">
                <label className="block">
                  Song Name <span className="text-red-500">*</span>
                </label>
                <input
                  disabled
                  type="text"
                  value={songName}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Language Dropdown */}
                <div className="space-y-2">

                  <label className="block">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={langID || ""}
                    onChange={handleLanguageChange}
                    className="w-full bg-black border text-white border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                    required
                  >
                    <option value="">Select Language</option>
                    {languages.map((lang) => (
                      <option key={lang.name} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Genre Dropdown */}
                <div className="space-y-2">
                  <label className="block">
                    Genre <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={genre}
                    onChange={handleGenreChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                    required
                  >
                    <option value="">Select Genre</option>
                    {genres.map((g, index) => (
                      <option key={index} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subgenre Dropdown - depends on Genre selection */}

                <div className="space-y-2">
                  <label className="block">
                    Subgenre <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subGenre}
                    onChange={handleSubgenreChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                    required
                  >
                    <option value="">Select Subgenre</option>
                    {subGenres.map((sub, index) => (
                      <option key={index} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mood Dropdown */}
                <div className="space-y-2">
                  <label className="block">
                    Mood <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={mood}
                    onChange={handleMoodChange}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                    required
                  >
                    <option value="">Select Mood</option>
                    {moods.map((m, index) => (
                      <option key={index} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Lyrics */}
                <div className="space-y-2">
                  <label className="block">Lyrics</label>
                  <textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-cyan-400 min-h-[150px]"
                  />
                </div>
                {/* Primary Artist */}
                <div className="space-y-2">
                  <label className="block">
                    Primary Artist <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={`${user?.userData?.artist.name
                      } - ${user?.userData?.artist
                        .stage_name
                      }`}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-full p-3 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                {/* Secondary Artists */}
                <div className="space-y-6">
                  {[
                    { type: "Featuring Artist", artists: featuringArtists },
                    { type: "Lyricist Artist", artists: lyricistArtists },
                    { type: "Composer Artist", artists: composerArtists },
                    { type: "Producer Artist", artists: producerArtists },
                  ].map(({ type, artists }) => (
                    <div key={type} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{type}s</h3>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedArtistType(type);
                            setShowSecondaryForm(true);
                          }}
                          className="bg-none border border-cyan-400 text-cyan-400 px-4 py-2 rounded-full hover:bg-cyan-300 hover:text-black transition-colors"
                        >
                          Add {type}
                        </button>
                      </div>
                      {artists.map((artist, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{artist.name}</p>
                              <p className="text-sm text-gray-400">
                                {artist.legal_name}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleArtistRemove(type, index, artist.name, artist.legal_name)}
                              className="text-red-500 hover:text-red-400"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>


                {/* Audio File Upload */}
                <div className="space-y-2">
                  <label className="block">
                    Audio File <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={handleDivClick}
                    className="p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors"
                  >
                    {uploadedFileName ? (
                      <div className="text-center">
                        <p className="text-cyan-400 font-medium">
                          {uploadedFileName}
                        </p>
                        <p className="text-sm text-gray-400">
                          Click to change the file
                        </p>
                      </div>
                    ) : (
                      <p className="text-center text-gray-400">
                        {audioFileUrl
                          ? "Audio file uploaded"
                          : "Click to upload audio file"}
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="audio/*"
                    onChange={handleFileChange}
                  />
                </div>
                {/* Submit Button */}
                <div className="flex justify-start">
                  <PrimaryBtn type="submit" className="w-full h-16">
                    Save and Continue
                  </PrimaryBtn>
                </div>
              </form>
            </div>
          </div>

          {/* Secondary Artist Form */}
          {showSecondaryForm && (
            <div className="col-span-1">
              <SecondaryArtistForm
                artistType={selectedArtistType}
                onClose={() => setShowSecondaryForm(false)}
                onArtistAdd={handleArtistAdd}
              />
            </div>
          )}
        </div>)}
      <ToastContainer />
    </div>
  );
}
