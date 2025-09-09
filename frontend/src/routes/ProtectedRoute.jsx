import { useArtist } from '../pages/auth/API/ArtistContext';
import { Navigate } from 'react-router-dom';
import React from 'react';

const ProtectedRoute = ({ children }) => {
  const { artist } = useArtist();

  if (!artist) {    
    return <Navigate to="/auth/login" />;
  }

  if (artist.onboarding_status !== 4) {
    return <Navigate to="/auth/profile-status" />;
  }

  return children;
};

export default ProtectedRoute; 