import React, { useEffect, useRef } from 'react';
import { UserProfile, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const inviteMarkedRef = useRef(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Mark invitation as used when user lands on profile page after signup
  useEffect(() => {
    const markInviteAsUsed = async () => {
      if (isSignedIn && !inviteMarkedRef.current) {
        const pendingCode = sessionStorage.getItem('pendingInviteCode');

        if (pendingCode) {
          inviteMarkedRef.current = true;

          try {
            await axios.post(`${API_URL}/invitations/use`, { code: pendingCode });
            console.log('✅ Invitation marked as used successfully');
            sessionStorage.removeItem('pendingInviteCode');
          } catch (err) {
            console.error('❌ Failed to mark invitation as used:', err);
            // Don't block user, but log the error
          }
        }
      }
    };

    markInviteAsUsed();
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Welcome to the SMESJ World!</h1>
        <p className="completion-message">
          Your account has been created successfully. Please take a moment to set up your profile information, especially your profile picture.
        </p>
        <p className="close-message">
          Once you're done, you can close this window/tab.
        </p>
      </div>

      <div className="profile-content">
        <UserProfile
          appearance={{
            elements: {
              rootBox: {
                margin: '0 auto',
                width: '100%',
              },
              card: {
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                borderRadius: '0.5rem',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Profile;
