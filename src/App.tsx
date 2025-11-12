import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import InvitationsManager from './components/InvitationsManager';
import UnauthorizedAccess from './components/UnauthorizedAccess';
import Login from './pages/Login';

const AdminPanel: React.FC = () => {
  const { user, isLoaded } = useUser();
  const adminUserId: string | undefined = process.env.REACT_APP_ADMIN_USER_ID;

  if (!isLoaded) {
    return (
      <div className="App">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const isAdmin: boolean = user?.id === adminUserId;

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Admin Panel</h1>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="App-main">
        <SignedOut>
          <div className="sign-in-prompt">
            <h2>Welcome to the Admin Panel</h2>
            <p>Please sign in to continue</p>
            <SignInButton mode="modal">
              <button className="sign-in-button">Sign In</button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          {isAdmin ? (
            <InvitationsManager />
          ) : (
            <UnauthorizedAccess />
          )}
        </SignedIn>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminPanel />} />
        <Route path="/login/:code" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
