import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useUser } from '@clerk/clerk-react';
import './InvitationsManager.css';

const API_URL = process.env.REACT_APP_API_URL;

interface Invitation {
  id: string;
  code: string;
  maxUses: number;
  usesCount: number;
  createdById: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const InvitationsManager: React.FC = () => {
  const { user } = useUser();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<Invitation[]>(`${API_URL}/invitations`);
      setInvitations(response.data);
    } catch (err) {
      const error = err as AxiosError;
      setError('Failed to load invitations: ' + error.message);
      console.error('Error fetching invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (): Promise<void> => {
    try {
      setCreating(true);
      setError(null);
      await axios.post(`${API_URL}/invitations`, {
        createdById: user?.id,
      });
      await fetchInvitations();
    } catch (err) {
      const error = err as AxiosError;
      setError('Failed to create invitation: ' + error.message);
      console.error('Error creating invitation:', err);
    } finally {
      setCreating(false);
    }
  };

  const deleteInvitation = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      setError(null);
      await axios.delete(`${API_URL}/invitations/${id}`);
      await fetchInvitations();
    } catch (err) {
      const error = err as AxiosError;
      setError('Failed to delete invitation: ' + error.message);
      console.error('Error deleting invitation:', err);
    }
  };

  const showQRCode = async (code: string): Promise<void> => {
    try {
      setError(null);
      setSelectedCode(code);
      const response = await axios.get<Blob>(`${API_URL}/invitations/${code}/qr`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      setQrCodeUrl(url);
    } catch (err) {
      const error = err as AxiosError;
      setError('Failed to generate QR code: ' + error.message);
      console.error('Error generating QR code:', err);
    }
  };

  const closeQRCode = (): void => {
    if (qrCodeUrl) {
      URL.revokeObjectURL(qrCodeUrl);
    }
    setQrCodeUrl(null);
    setSelectedCode(null);
  };

  const copyToClipboard = (code: string): void => {
    const inviteUrl = `${window.location.origin}/login/${code}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('Invite link copied to clipboard!');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading invitations...</div>;
  }

  return (
    <div className="invitations-manager">
      <div className="manager-header">
        <h2>Invitation Management</h2>
        <button
          className="create-button"
          onClick={createInvitation}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create New Invitation'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="invitations-list">
        {invitations.length === 0 ? (
          <div className="empty-state">
            <p>No invitations yet. Create your first invitation to get started.</p>
          </div>
        ) : (
          <table className="invitations-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Uses</th>
                <th>Created</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td>
                    <code className="invite-code">{invitation.code}</code>
                  </td>
                  <td>
                    {invitation.usesCount} / {invitation.maxUses}
                  </td>
                  <td>{formatDate(invitation.createdAt)}</td>
                  <td>
                    {invitation.expiresAt
                      ? formatDate(invitation.expiresAt)
                      : 'Never'}
                  </td>
                  <td className="actions">
                    <button
                      className="action-button copy"
                      onClick={() => copyToClipboard(invitation.code)}
                      title="Copy code"
                    >
                      Copy
                    </button>
                    <button
                      className="action-button qr"
                      onClick={() => showQRCode(invitation.code)}
                      title="Show QR code"
                    >
                      QR
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => deleteInvitation(invitation.id)}
                      title="Delete invitation"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {qrCodeUrl && (
        <div className="qr-modal" onClick={closeQRCode}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>QR Code for: {selectedCode}</h3>
            <img src={qrCodeUrl} alt="QR Code" />
            <button className="close-button" onClick={closeQRCode}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationsManager;
