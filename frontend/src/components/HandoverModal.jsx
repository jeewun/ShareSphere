// frontend/src/components/HandoverModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, MapPin, User, Shield, CheckCircle2, 
  AlertCircle, Lock, RefreshCw, Phone
} from 'lucide-react';
import PropTypes from 'prop-types';

export default function HandoverModal({ reservationId, onClose, onHandoverUpdated }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [pickupInput, setPickupInput] = useState('');
  const [updatingPickup, setUpdatingPickup] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchHandoverData(true);

    // Poll every 3.5 seconds for incoming messages while modal is open
    pollIntervalRef.current = setInterval(() => {
      fetchHandoverData(false);
    }, 3500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [reservationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  async function fetchHandoverData(initial = false) {
    if (initial) setLoading(true);
    try {
      const res = await api.handover.get(reservationId);
      if (res.success) {
        setData(res);
        if (initial && res.reservation?.pickup_time) {
          setPickupInput(res.reservation.pickup_time);
        }
      }
    } catch (err) {
      if (initial) setError(err.message || 'Failed to load handover details');
    } finally {
      if (initial) setLoading(false);
    }
  }

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await api.handover.sendMessage(reservationId, text);
      if (res.success) {
        setInputMessage('');
        fetchHandoverData(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleUpdatePickupTime = async (e) => {
    e.preventDefault();
    if (!pickupInput.trim()) return;

    setUpdatingPickup(true);
    try {
      const res = await api.handover.updatePickupTime(reservationId, pickupInput.trim());
      if (res.success) {
        fetchHandoverData(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to update pickup time');
    } finally {
      setUpdatingPickup(false);
    }
  };

  const handleCloseSpace = async () => {
    if (!window.confirm('Mark this equipment as handed over and terminate this temporary coordination space?')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.handover.closeSpace(reservationId);
      if (res.success) {
        fetchHandoverData(false);
        if (onHandoverUpdated) onHandoverUpdated();
      }
    } catch (err) {
      alert(err.message || 'Failed to close space');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenSpace = async () => {
    setActionLoading(true);
    try {
      const res = await api.handover.reopenSpace(reservationId);
      if (res.success) {
        fetchHandoverData(false);
        if (onHandoverUpdated) onHandoverUpdated();
      }
    } catch (err) {
      alert(err.message || 'Failed to reopen space');
    } finally {
      setActionLoading(false);
    }
  };

  const quickPills = [
    "I've arrived at the pickup spot",
    "Running 5 mins late",
    "Item & accessories inspected",
    "Heading over now"
  ];

  const reservation = data?.reservation;
  const isOwner = reservation?.is_owner;
  const isClosed = reservation?.chat_status === 'closed';

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0 rounded-4 overflow-hidden" style={{ height: '88vh' }}>
          
          {/* Header */}
          <div className="modal-header bg-white border-bottom px-4 py-3 align-items-center">
            <h5 className="modal-title fw-bold text-dark mb-0">Handover Coordination</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-0 d-flex flex-column bg-light" style={{ flex: 1, minHeight: 0 }}>
            {loading ? (
              <div className="text-center py-5 m-auto">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-muted small">Connecting to handover space...</div>
              </div>
            ) : error ? (
              <div className="alert alert-danger m-4 d-flex align-items-center gap-2">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            ) : (
              <>
                {/* Coordination Top Card */}
                <div className="bg-white border-bottom p-3 shadow-sm">
                  <div className="row g-3 align-items-center">
                    
                    {/* Pickup Timing Window */}
                    <div className="col-12 col-md-7">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="small fw-bold text-dark">Agreed Pickup Timing:</span>
                        <span className={`small fw-semibold ${reservation.pickup_time ? 'text-success' : 'text-warning'}`}>
                          {reservation.pickup_time || 'Not yet agreed'}
                        </span>
                      </div>

                      {!isClosed && (
                        <form onSubmit={handleUpdatePickupTime} className="d-flex gap-2 mt-2">
                          <input
                            type="text"
                            className="form-control form-control-sm rounded-3"
                            placeholder="e.g., Oct 16 at 2:30 PM outside Lab 304"
                            value={pickupInput}
                            onChange={(e) => setPickupInput(e.target.value)}
                            disabled={updatingPickup}
                          />
                          <button 
                            type="submit" 
                            className="btn btn-outline-dark btn-sm flex-shrink-0 px-3 fw-semibold rounded-3"
                            disabled={updatingPickup || !pickupInput.trim()}
                          >
                            {updatingPickup ? 'Saving...' : 'Set Timing'}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Counterpart Contact & Location */}
                    <div className="col-12 col-md-5 border-start-md ps-md-3">
                      <div className="small text-muted mb-1">
                        {isOwner ? (
                          <>Borrower: <strong className="text-dark">{reservation.requester_name}</strong></>
                        ) : (
                          <>Owner: <strong className="text-dark">{reservation.owner_name}</strong></>
                        )}
                      </div>
                      <div className="small text-muted d-flex align-items-center gap-1">
                        <MapPin size={13} className="text-secondary" />
                        <span>{reservation.resource_location}</span>
                      </div>
                      {(reservation.owner_phone || reservation.requester_phone) && (
                        <div className="small text-muted d-flex align-items-center gap-1 mt-1">
                          <Phone size={13} className="text-secondary" />
                          <span>{isOwner ? reservation.requester_phone : reservation.owner_phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Stream */}
                <div 
                  className="p-3 d-flex flex-column gap-2 overflow-auto" 
                  style={{ flex: 1, minHeight: 0 }}
                >
                  <div className="text-center my-2">
                    <span className="badge bg-secondary bg-opacity-10 text-secondary small py-1 px-3 rounded-pill border">
                      Ephemeral space for handover coordination only.
                    </span>
                  </div>

                  {data.messages.length === 0 ? (
                    <div className="text-center text-muted my-auto py-4 small">
                      No messages yet. Say hello or propose a pickup meeting time!
                    </div>
                  ) : (
                    data.messages.map((m) => {
                      const isMe = Number(m.sender_id) === Number(user?.user_id);
                      const cleanText = m.message.replace(/^[🕒✅🔄🔒📍⏱️📦👋\s]+/u, '').trim();
                      const isSystem = m.message.includes('Pickup Timing Agreed:') || 
                                       m.message.includes('Handover Complete:') || 
                                       m.message.includes('Coordination space reopened') ||
                                       m.message.startsWith('🕒') || m.message.startsWith('✅') || m.message.startsWith('🔄');

                      if (isSystem) {
                        return (
                          <div key={m.message_id} className="text-center my-2">
                            <span className="badge bg-white text-dark shadow-sm border py-2 px-3 small rounded-3">
                              {cleanText}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={m.message_id} 
                          className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}
                        >
                          <div className="d-flex align-items-baseline gap-1 mb-1">
                            <span className="small text-muted" style={{ fontSize: '0.72rem' }}>
                              {isMe ? 'You' : m.sender_name}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                              {m.created_at?.substring(11, 16) || ''}
                            </span>
                          </div>
                          <div 
                            className={`p-3 rounded-4 shadow-sm text-break ${
                              isMe 
                                ? 'bg-primary text-white rounded-bottom-end-0' 
                                : 'bg-white text-dark border rounded-bottom-start-0'
                            }`}
                            style={{ maxWidth: '82%', fontSize: '0.9rem', lineHeight: '1.45' }}
                          >
                            {m.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Closed Notice or Input Form */}
                {isClosed ? (
                  <div className="bg-white border-top p-3 text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 text-muted small mb-2">
                      <Lock size={16} />
                      <span>This handover space was finalized and closed by the resource owner.</span>
                    </div>
                    {isOwner && (
                      <button 
                        type="button" 
                        onClick={handleReopenSpace}
                        disabled={actionLoading}
                        className="btn btn-sm btn-outline-secondary rounded-3"
                      >
                        {actionLoading ? 'Reopening...' : 'Reopen Coordination Space'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border-top p-3">
                    {/* Quick Response Pills */}
                    <div className="d-flex gap-2 flex-wrap mb-2">
                      {quickPills.map((pill, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="btn btn-sm btn-light border py-1 px-2 rounded-pill text-dark"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => handleSendMessage(pill)}
                        >
                          {pill}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input */}
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                      className="d-flex gap-2"
                    >
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Type a coordination message..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary px-3 rounded-3 flex-shrink-0 fw-semibold"
                        disabled={sending || !inputMessage.trim()}
                      >
                        Send
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer / Owner Handover Actions */}
          <div className="modal-footer bg-white border-top px-4 py-2 d-flex justify-content-between">
            <div>
              {isOwner && !isClosed && (
                <button
                  type="button"
                  onClick={handleCloseSpace}
                  disabled={actionLoading}
                  className="btn btn-sm btn-success d-flex align-items-center gap-2 rounded-3 fw-semibold shadow-sm"
                >
                  <CheckCircle2 size={16} />
                  <span>{actionLoading ? 'Closing...' : 'Confirm Handover & Close Space'}</span>
                </button>
              )}
            </div>

            <button type="button" className="btn btn-sm btn-outline-secondary px-3 rounded-3" onClick={onClose}>
              Close Window
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

HandoverModal.propTypes = {
  reservationId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onHandoverUpdated: PropTypes.func
};
