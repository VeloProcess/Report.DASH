import './AIFeedbackCard.css';

function AIFeedbackCard({ feedback }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ai-feedback-card">
      <div className="feedback-header">
        <span className="feedback-label">Feedback I.A</span>
        <span className="feedback-date">{formatDate(feedback.generated_at)}</span>
      </div>
      <div className="feedback-text">
        {feedback.feedback_text}
      </div>
    </div>
  );
}

export default AIFeedbackCard;

