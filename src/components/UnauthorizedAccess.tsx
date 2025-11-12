import React from 'react';
import './UnauthorizedAccess.css';

const UnauthorizedAccess: React.FC = () => {
  return (
    <div className="unauthorized">
      <h2>Access Denied</h2>
      <p>You do not have permission to access this admin panel.</p>
      <p>Only authorized administrators can view this page.</p>
    </div>
  );
};

export default UnauthorizedAccess;
