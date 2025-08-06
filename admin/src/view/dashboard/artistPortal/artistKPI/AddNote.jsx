import React, { useEffect, useState } from "react";
import axiosApi from "../../../../conf/axios";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const AddNote = () => {
  const { ophid } = useParams();
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  console.log(ophid);


  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const res = await axiosApi.get(`/notes/${ophid}`);

        if (res && res.data && res.data.length > 0) {
          const note = res.data[0].Notes;
          setNotes(note === "null" ? "" : note);
        } else {
          setNotes("");
        }
        
      } catch (err) {
        console.error("Failed to load note:", err);
        toast.error("Failed to fetch note.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (ophid) fetchNote();
  }, [ophid]);
  console.log(notes, "testing");

  const handleSave = async () => {
    if (!notes.trim()) {
      toast.error("Note cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await axiosApi.post(`/note/${ophid}`, { notes });
      if (res.status === 200) {
        toast.success("Note saved successfully!");
      } else {
        toast.error("Failed to save note.");
      }
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-[#0d3c44] border-b pb-2">
          Add / Update Note
        </h2>

        {isLoading ? (
          <p className="text-gray-600">Loading note...</p>
        ) : (
          <>
            <textarea
              className="w-full h-48 p-4 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0d3c44]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note not added"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-3 rounded-xl font-semibold shadow ${isSaving
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#0d3c44] text-white hover:bg-[#14565f]"
                  }`}
              >
                {isSaving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddNote;
