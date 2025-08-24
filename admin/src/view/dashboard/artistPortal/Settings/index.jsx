import React, { useState, useEffect } from 'react';
import axiosApi from '../../../../conf/axios';
import ArtistSidebar from '../../../../components/ArtistSidebar';

const Settings = () => {
  const [audioPlatforms, setAudioPlatforms] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddProfessionForm, setShowAddProfessionForm] = useState(false);
  const [collapsedPlatforms, setCollapsedPlatforms] = useState(true);
  const [collapsedProfessions, setCollapsedProfessions] = useState(true);
  const [newPlatform, setNewPlatform] = useState({ name: '' });
  const [newProfession, setNewProfession] = useState({ name: '' });
  const [platformsLoaded, setPlatformsLoaded] = useState(false);
  const [professionsLoaded, setProfessionsLoaded] = useState(false);

  useEffect(() => {
    fetchAudioPlatforms();
    fetchProfessions();
  }, []);

  const fetchAudioPlatforms = async () => {
    try {
      const response = await axiosApi.get('/get_audio_platforms');
      if (response.data?.success) {
        setAudioPlatforms(response.data.data || []);
        setError(null);
      } else {
        setError('Failed to fetch audio platforms');
      }
    } catch (err) {
      console.error('Error fetching audio platforms:', err);
      setError('Failed to fetch audio platforms');
    } finally {
      setPlatformsLoaded(true);
    }
  };

  const fetchProfessions = async () => {
    try {
      const response = await axiosApi.get('/get_professions');
      if (response.data?.success) {
        setProfessions(response.data.data || []);
        setError(null);
      } else {
        setError('Failed to fetch professions');
      }
    } catch (err) {
      console.error('Error fetching professions:', err);
      setError('Failed to fetch professions');
    } finally {
      setProfessionsLoaded(true);
    }
  };

  const handleAddPlatform = async (e) => {
    e.preventDefault();

    if (!newPlatform.name.trim()) {
      setError('Platform name is required');
      return;
    }

    try {
      const response = await axiosApi.post('/new_audio_platform', {
        name: newPlatform.name.trim()
      });

      if (response.data?.success) {
        // Refresh the audio platforms list
        await fetchAudioPlatforms();
        setNewPlatform({ name: '' });
        setShowAddForm(false);
        setError(null);
      } else {
        setError('Failed to add audio platform');
      }
    } catch (err) {
      console.error('Error adding audio platform:', err);
      setError('Failed to add audio platform');
    }
  };

  const handleAddProfession = async (e) => {
    e.preventDefault();

    if (!newProfession.name.trim()) {
      setError('Profession name is required');
      return;
    }

    try {
      const response = await axiosApi.post('/new_profession', {
        name: newProfession.name.trim()
      });

      if (response.data?.success) {
        // Refresh the professions list
        await fetchProfessions();
        setNewProfession({ name: '' });
        setShowAddProfessionForm(false);
        setError(null);
      } else {
        setError('Failed to add profession');
      }
    } catch (err) {
      console.error('Error adding profession:', err);
      setError('Failed to add profession');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlatform((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfessionInputChange = (e) => {
    const { name, value } = e.target;
    setNewProfession((prev) => ({ ...prev, [name]: value }));
  };

  // Optional: local delete handlers (since no backend endpoint provided)
  const handleDeletePlatform = async (id) => {
    try {
      const response = await axiosApi.delete(`/delete_audio_platform/${id}`);
      
      if (response.data?.success) {
        // Refresh the audio platforms list
        await fetchAudioPlatforms();
        setError(null);
      } else {
        setError('Failed to delete audio platform');
      }
    } catch (err) {
      console.error('Error deleting audio platform:', err);
      setError('Failed to delete audio platform');
    }
  };

  const handleDeleteProfession = async (id) => {
    try {
      const response = await axiosApi.delete(`/delete_profession/${id}`);
      
      if (response.data?.success) {
        // Refresh the professions list
        await fetchProfessions();
        setError(null);
      } else {
        setError('Failed to delete profession');
      }
    } catch (err) {
      console.error('Error deleting profession:', err);
      setError('Failed to delete profession');
    }
  };

  if (!platformsLoaded || !professionsLoaded) {
    return (
      <div className="h-screen flex overflow-hidden relative bg-gray-50">
        <ArtistSidebar>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d3c44] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          </div>
        </ArtistSidebar>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden relative bg-gray-50">
      <ArtistSidebar>
        <div className="flex-1 overflow-auto flex justify-center">
          <div className="w-[1600px]">
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-[#0d3c44] to-[#145058] text-white rounded-none shadow-lg mb-6">
              <h2 className="text-3xl font-extrabold tracking-wide leading-tight drop-shadow-sm">
                Settings
              </h2>
              <p className="mt-2 text-gray-200">
                Manage your music distribution platforms and professions
              </p>
            </div>

            <div className="px-8 space-y-8">
          {/* Audio Platforms Section */}
          <div>
            {/* Section Header with Collapse */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCollapsedPlatforms(!collapsedPlatforms)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg
                    className={`w-5 h-5 transform transition-transform ${collapsedPlatforms ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <h3 className="text-xl font-semibold text-gray-800">
                  Audio Platforms ({audioPlatforms.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  if (collapsedPlatforms) {
                    setCollapsedPlatforms(false);
                  }
                  setShowAddForm(!showAddForm);
                }}
                className="px-6 py-3 bg-[#0d3c44] hover:bg-[#145058] text-white font-medium rounded-lg transition-colors duration-200 shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {showAddForm ? 'Cancel' : 'Add Platform'}
              </button>
            </div>

            {/* Collapsible Content */}
            {!collapsedPlatforms && (
              <>
                {/* Add Platform Form */}
                {showAddForm && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Add New Music Platform</h4>
                    <form onSubmit={handleAddPlatform} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Platform Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={newPlatform.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3c44] focus:border-transparent transition-colors"
                          placeholder="e.g., Spotify, Apple Music, YouTube Music"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#0d3c44] hover:bg-[#145058] text-white font-medium rounded-lg transition-colors duration-200"
                        >
                          Add Platform
                        </button>
                                              <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setCollapsedPlatforms(true);
                        }}
                        className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Platforms Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Platform Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {audioPlatforms.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="text-lg font-medium">No platforms found</p>
                                <p className="text-sm">Get started by adding your first music platform</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          audioPlatforms.map((platform) => (
                            <tr key={platform.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {platform.name || 'N/A'}
                                </div>
                              </td>
                                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {platform.created_at ? new Date(platform.created_at).toLocaleDateString('en-GB', {
                                 day: '2-digit',
                                 month: 'long',
                                 year: 'numeric'
                               }) : 'N/A'}
                             </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleDeletePlatform(platform.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Professions Section */}
          <div>
            {/* Section Header with Collapse */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCollapsedProfessions(!collapsedProfessions)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg
                    className={`w-5 h-5 transform transition-transform ${collapsedProfessions ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <h3 className="text-xl font-semibold text-gray-800">
                  Professions ({professions.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  if (collapsedProfessions) {
                    setCollapsedProfessions(false);
                  }
                  setShowAddProfessionForm(!showAddProfessionForm);
                }}
                className="px-6 py-3 bg-[#0d3c44] hover:bg-[#145058] text-white font-medium rounded-lg transition-colors duration-200 shadow-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {showAddProfessionForm ? 'Cancel' : 'Add Profession'}
              </button>
            </div>

            {/* Collapsible Content */}
            {!collapsedProfessions && (
              <>
                {/* Add Profession Form */}
                {showAddProfessionForm && (
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Add New Profession</h4>
                    <form onSubmit={handleAddProfession} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profession Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={newProfession.name}
                          onChange={handleProfessionInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3c44] focus:border-transparent transition-colors"
                          placeholder="e.g., Sound Engineer, Music Director"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#0d3c44] hover:bg-[#145058] text-white font-medium rounded-lg transition-colors duration-200"
                        >
                          Add Profession
                        </button>
                                              <button
                        type="button"
                        onClick={() => {
                          setShowAddProfessionForm(false);
                          setCollapsedProfessions(true);
                        }}
                        className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      </div>
                    </form>
                  </div>
                )}

                                   {/* Professions Table */}
                   <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
                     <div className="overflow-x-auto">
                       <table className="w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                           <tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               Profession Name
                             </th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               Created
                             </th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               Actions
                             </th>
                           </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                           {professions.length === 0 ? (
                             <tr>
                               <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                 <div className="flex flex-col items-center">
                                   <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                   </svg>
                                   <p className="text-lg font-medium">No professions found</p>
                                   <p className="text-sm">Get started by adding your first profession</p>
                                 </div>
                               </td>
                             </tr>
                           ) : (
                             professions.map((profession) => (
                               <tr key={profession.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 whitespace-nowrap">
                                   <div className="text-sm font-medium text-gray-900">
                                     {profession.name}
                                   </div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                   {profession.created_at ? new Date(profession.created_at).toLocaleDateString('en-GB', {
                                     day: '2-digit',
                                     month: 'long',
                                     year: 'numeric'
                                   }) : 'N/A'}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                   <button
                                     onClick={() => handleDeleteProfession(profession.id)}
                                     className="text-red-600 hover:text-red-900"
                                   >
                                     Delete
                                   </button>
                                 </td>
                               </tr>
                             ))
                           )}
                         </tbody>
                       </table>
                     </div>
                   </div>
              </>
            )}
          </div>

                     {/* Error Message */}
           {error && (
             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
               {error}
             </div>
           )}
         </div>
       </div>
     </div>
   </ArtistSidebar>
 </div>
);
};

export default Settings;
