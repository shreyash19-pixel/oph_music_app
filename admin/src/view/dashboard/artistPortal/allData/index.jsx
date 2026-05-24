import React, { useState } from 'react';
import axiosApi from '../../../../conf/axios';
import ArtistSidebar from '../../../../components/ArtistSidebar';
import { useAuth } from '../../../../auth/AuthProvider';
import {
  ALL_DATA_EXPORT_KEYS,
  getAllDataExportAccess,
  canDownloadAllDataExport,
} from '../../../../utils/allDataPermissions';

const AllData = () => {
  const { user } = useAuth();
  const role = user?.role;
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  const downloadData = async (dataType, endpoint) => {
    setLoading(prev => ({ ...prev, [dataType]: true }));
    setError(prev => ({ ...prev, [dataType]: null }));

    try {
      const response = await axiosApi.get(endpoint, {
        responseType: 'blob'
      });

      // Get filename from response headers and add timestamp
      const contentDisposition = response.headers['content-disposition'];
      console.log('Content-Disposition header:', contentDisposition);
      console.log('All response headers:', response.headers);
      
      let filename = `${dataType}_data.xlsx`; // fallback filename
      
      if (contentDisposition) {
        // Try multiple patterns to extract filename
        let filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (!filenameMatch) {
          // Try alternative pattern
          filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        }
        if (!filenameMatch) {
          // Try without quotes
          filenameMatch = contentDisposition.match(/filename=([^;]+)/);
        }
        
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          console.log('Extracted filename:', filename);
        } else {
          console.log('Could not extract filename from:', contentDisposition);
        }
      } else {
        console.log('No Content-Disposition header found');
      }
      
      console.log('Final filename to use:', filename);

      // Add human-readable timestamp and date to filename
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata' }).replace(/\//g, '-'); // DD-MM-YYYY format IST
      const timeStr = now.toLocaleTimeString('en-GB', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata'
      }).replace(/:/g, '-'); // HH-MM-SS format IST
      
      // Insert timestamp before the file extension
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
      const fileExt = filename.split('.').pop();
      const filenameWithTimestamp = `${nameWithoutExt}_${dateStr}_${timeStr}.${fileExt}`;

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filenameWithTimestamp);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(`Error downloading ${dataType}:`, err);
      setError(prev => ({ 
        ...prev, 
        [dataType]: err.response?.data?.message || `Failed to download ${dataType} data` 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [dataType]: false }));
    }
  };

  const downloadButtons = [
    {
      id: 'Complete Artist Status',
      exportKey: ALL_DATA_EXPORT_KEYS.COMPLETE_ARTIST_STATUS,
      label: ' Download Complete Artist Status',
      description: 'Complete list of all registered artists',
      endpoint: '/application-status',
      icon: '',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'Personal Details',
      exportKey: ALL_DATA_EXPORT_KEYS.PERSONAL_DETAILS,
      label: 'Download Personal Details',
      description: 'All registered personal details',
      endpoint: '/user-details',
      icon: '',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'Professional Details',
      exportKey: ALL_DATA_EXPORT_KEYS.PROFESSIONAL_DETAILS,
      label: 'Download Professional Details',
      description: 'Professional details for all registered users',
      endpoint: '/professional-details',
      icon: '',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'Documentation Details',
      exportKey: ALL_DATA_EXPORT_KEYS.DOCUMENTATION_DETAILS,
      label: 'Download Documentation Details',
      description: 'Documentation details for all registered users',
      endpoint: '/documentation-details',
      icon: '',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'All Payments',
      exportKey: ALL_DATA_EXPORT_KEYS.ALL_PAYMENTS,
      label: 'Download All Payments',
      description:
        'All rows from payments: songs, calendar/date booking, events, SA, EPK-related, with amounts and reject reasons',
      endpoint: '/All-payments',
      icon: '',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      id: 'Bookings',
      exportKey: ALL_DATA_EXPORT_KEYS.BOOKINGS,
      label: 'Download Bookings Data',
      description: 'Date booking and scheduling data',
      endpoint: '/bookings-excel',
      icon: '',
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      id: 'Songs Register',
      exportKey: ALL_DATA_EXPORT_KEYS.SONGS_REGISTER,
      label: 'Download Songs Register Data',
      description: 'Songs register data',
      endpoint: '/songs-register-excel',
      icon: '',
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      id: 'Audio Details',
      exportKey: ALL_DATA_EXPORT_KEYS.AUDIO_DETAILS,
      label: 'Download Audio Details',
      description: 'All song audio submission rows (language, genre, audio URL, status, etc.)',
      endpoint: '/audio-details-excel',
      icon: '',
      color: 'bg-cyan-500 hover:bg-cyan-600'
    },
    {
      id: 'Video Details',
      exportKey: ALL_DATA_EXPORT_KEYS.VIDEO_DETAILS,
      label: 'Download Video Details',
      description: 'All song video submission rows (credits, image/video URLs, status, etc.)',
      endpoint: '/video-details-excel',
      icon: '',
      color: 'bg-violet-500 hover:bg-violet-600'
    },
    {
      id: 'Song Registration Application Status',
      exportKey: ALL_DATA_EXPORT_KEYS.SONG_REGISTRATION_APPLICATION_STATUS,
      label: 'Download Song Registration Application Status',
      description: 'Song registration application status',
      endpoint: '/song-registration-details',
      icon: '',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'TV Publishing',
      exportKey: ALL_DATA_EXPORT_KEYS.TV_PUBLISHING,
      label: 'Download TV Publishing Data',
      description: 'Professional categories and roles',
      endpoint: '/tv-publishing-excel',
      icon: '',
      color: 'bg-teal-500 hover:bg-teal-600'
    },
    {
      id: 'Withdrawals',
      exportKey: ALL_DATA_EXPORT_KEYS.WITHDRAWALS,
      label: 'Download Withdrawals Data',
      description: 'Traffic counters and KPI metrics',
      endpoint: '/withdrawals-excel',
      icon: '',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      id: 'Tickets',
      exportKey: ALL_DATA_EXPORT_KEYS.TICKETS,
      label: 'Download Tickets Data',
      description: 'Tickets data',
      endpoint: '/tickets-excel',
      icon: '',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'Event Participants',
      exportKey: ALL_DATA_EXPORT_KEYS.EVENT_PARTICIPANTS,
      label: 'Download Event Participants Data',
      description: 'Event participants data',
      endpoint: '/event-participants-excel',
      icon: '',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'Contact Us',
      exportKey: ALL_DATA_EXPORT_KEYS.CONTACT_US,
      label: 'Download Contact Us Data',
      description: 'Contact us data',
      endpoint: '/contact-us-excel',
      icon: '',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'Special Artist Details',
      exportKey: ALL_DATA_EXPORT_KEYS.SPECIAL_ARTIST_DETAILS,
      label: 'Download Special Artist Details Data',
      description: 'Special artist details data',
      endpoint: '/special-artist-details-excel',
      icon: '',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'Special Artist Songs',
      exportKey: ALL_DATA_EXPORT_KEYS.SPECIAL_ARTIST_SONGS,
      label: 'Download Special Artist Songs',
      description:
        'Special artist songs only (oph_id contains -SA- or artist_type special): song name, type, status, proof, etc.',
      endpoint: '/special-artist-songs-excel',
      icon: '',
      color: 'bg-fuchsia-500 hover:bg-fuchsia-600'
    }
  ];

  const visibleButtons = downloadButtons.filter(
    (button) => getAllDataExportAccess(role, button.exportKey) !== 'hidden',
  );

  return (
    <ArtistSidebar>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Data Download Portal
            </h1>
            <p className="text-gray-600">
              Excel exports are limited by your role. Super Admin and
              Administrative Head (except Event Participants) receive full
              datasets; department heads receive scoped exports for their allowed
              categories; department members can view cards but cannot download.
            </p>
          </div>

          {visibleButtons.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-600">
              No data exports are available for your role.
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleButtons.map((button) => {
              const access = getAllDataExportAccess(role, button.exportKey);
              const canDownload = canDownloadAllDataExport(role, button.exportKey);
              return (
              <div
                key={button.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col"
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-start mb-6">
                    <span className="text-3xl mr-3 flex-shrink-0">{button.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {button.label}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {button.description}
                      </p>
                      {access === "show_only" && (
                        <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                          View only — download restricted to department heads
                        </p>
                      )}
                      {access === "download_scoped" && (
                        <p className="mt-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1 inline-block">
                          Scoped export (approved/completed artists only)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto">
                    {canDownload ? (
                    <button
                      onClick={() => downloadData(button.id, button.endpoint)}
                      disabled={loading[button.id]}
                      className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors duration-200 ${button.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading[button.id] ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Downloading...
                        </div>
                      ) : (
                        "Download Data"
                      )}
                    </button>
                    ) : (
                      <div className="w-full py-3 px-4 rounded-md bg-gray-100 text-gray-500 font-medium text-center border border-gray-200">
                        View only
                      </div>
                    )}

                    {error[button.id] && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">
                          {error[button.id]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Download Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>All downloads are in Excel (.xlsx) format</li>
                    <li>Files are automatically named with current date</li>
                    <li>Large datasets may take several minutes to process</li>
                    <li>
                      Super Admin &amp; Administrative Head: full exports (admin
                      head excludes Event Participants).
                    </li>
                    <li>
                      Department heads: scoped downloads for their department
                      only.
                    </li>
                    <li>
                      Department members: view-only on allowed cards (no Excel
                      download). Membership PDF: heads only.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ArtistSidebar>
  );
};

export default AllData;
