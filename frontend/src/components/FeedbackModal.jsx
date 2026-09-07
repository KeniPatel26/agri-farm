import { useState } from 'react';
import api from '../api/axiosInstance';
import { X, Send, HelpCircle, MessageSquareWarning } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    type: 'Suggestion',
    subject: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      toast.error('Please enter subject and description');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/complaints', formData);
      toast.success('Thank you! Your feedback/complaint has been submitted to AgriConnect administration.');
      setFormData({ type: 'Suggestion', subject: '', description: '' });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '10px', borderRadius: '12px' }}>
            <MessageSquareWarning size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
              Feedback &amp; Complaint Desk
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12.5px' }}>
              Submit a bug, grievance, report, or feature suggestion directly to AgriConnect.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Feedback Category</label>
            <select
              className="form-control"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="Suggestion">💡 Feature Suggestion / Feedback</option>
              <option value="Bug">🐞 Bug / Technical Issue Report</option>
              <option value="Complaint">⚠️ Service / Delivery Grievance</option>
              <option value="Report User">🚩 Report User / Trader / Retailer</option>
              <option value="Report Product">📦 Report Product Issue</option>
              <option value="Other">💬 Other Inquiry</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Brief summary of your feedback or issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Detailed Description *</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Provide specific details so our support team can assist you quickly..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ width: 'auto', padding: '10px 20px', background: '#f1f5f9', color: '#475569' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn"
              style={{ width: 'auto', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={15} /> {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
