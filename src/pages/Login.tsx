import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SignUp, useUser } from '@clerk/clerk-react';
import axios, { AxiosError } from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003';

interface InvitationValidation {
  valid: boolean;
  invitation?: {
    id: string;
    code: string;
    expiresAt: string | null;
    usesCount: number;
    maxUses: number;
  };
  message?: string;
}

const Login: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateCode = async () => {
      if (!code) {
        setError('No invitation code provided');
        setValidating(false);
        return;
      }

      try {
        const response = await axios.get<InvitationValidation>(
          `${API_URL}/invitations/validate/${code}`
        );

        if (response.data.valid) {
          setIsValid(true);
        } else {
          setError(response.data.message || 'Invalid or expired invitation code');
        }
      } catch (err) {
        const error = err as AxiosError;
        setError('Failed to validate invitation code');
        console.error('Validation error:', error);
      } finally {
        setValidating(false);
      }
    };

    validateCode();
  }, [code]);

  // If already signed in, mark invitation as used and redirect to home
  useEffect(() => {
    if (isSignedIn && code) {
      // Mark invitation as used
      axios.post(`${API_URL}/invitations/use`, { code })
        .then(() => {
          console.log('Invitation marked as used');
        })
        .catch((err) => {
          console.error('Failed to mark invitation as used:', err);
          // Don't block the user from proceeding even if this fails
        })
        .finally(() => {
          navigate('/');
        });
    }
  }, [isSignedIn, code, navigate]);

  if (validating) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading-spinner"></div>
          <p>Validating invitation code...</p>
        </div>
      </div>
    );
  }

  if (!isValid || error) {
    return (
      <div className="login-container">
        <div className="login-card error">
          <h2>Invalid Invitation</h2>
          <p>{error}</p>
          <p className="help-text">
            Please contact an administrator for a valid invitation link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome!</h1>
        <p className="invitation-message">
          You've been invited to join. Please create your account to continue.
        </p>
        <div className="clerk-signin-wrapper">
          <SignUp
            routing="hash"
            signInUrl={`/login/${code}#/sign-in`}
            afterSignUpUrl="/"
            afterSignInUrl="/"
            appearance={{
              elements: {
                rootBox: {
                  margin: '0 auto',
                },
                card: {
                  boxShadow: 'none',
                  border: 'none',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
