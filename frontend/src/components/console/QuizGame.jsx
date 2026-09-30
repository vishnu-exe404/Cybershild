import React, { useEffect, useState } from 'react';
import { getQuizQuestions, submitQuiz } from '../../services/api.js';
import { useToast } from '../../services/toast.jsx';
import { SkeletonCard } from '../Skeleton.jsx';

export default function QuizGame() {
  const { showToast } = useToast();
  const [questions, setQuestions] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [graded, setGraded] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuizQuestions().then((d) => setQuestions(d.questions)).catch(() => setQuestions([]));
  }, []);

  async function answer(isScam) {
    const q = questions[step];
    const next = [...answers, { questionId: q.id, answerIsScam: isScam }];
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitQuiz(next);
      setGraded(result);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setStep(0);
    setAnswers([]);
    setGraded(null);
  }

  if (!questions) return <SkeletonCard />;
  if (questions.length === 0) return <p className="field-error">Could not load the quiz right now.</p>;

  if (graded) {
    return (
      <div className="card glass-card card-in">
        <h3 style={{ marginTop: 0 }}>You scored {graded.score} / {graded.total}</h3>
        <div className="quiz-review">
          {graded.results.map((r, i) => (
            <div key={r.questionId} className={r.correct ? 'quiz-review-item correct' : 'quiz-review-item wrong'}>
              <p><strong>Q{i + 1}:</strong> {r.correct ? '✓ Correct' : '✕ Incorrect'} — this was {r.correctAnswer ? 'a scam' : 'safe'}.</p>
              <p className="muted">{r.explanation}</p>
            </div>
          ))}
        </div>
        <button type="button" className="btn" onClick={restart}>Try again</button>
      </div>
    );
  }

  const q = questions[step];
  return (
    <div className="card glass-card card-in">
      <div className="quiz-progress"><span>Scenario {step + 1} of {questions.length}</span></div>
      <div className="quiz-mock">
        <p className="quiz-mock-sender">FROM: {q.sender}</p>
        <p className="quiz-mock-body">{q.body}</p>
      </div>
      <p style={{ fontWeight: 700 }}>Scam or safe?</p>
      <div className="analyze-actions">
        <button type="button" className="btn btn-danger" disabled={submitting} onClick={() => answer(true)}>🚨 Scam</button>
        <button type="button" className="btn-outline" disabled={submitting} onClick={() => answer(false)}>✓ Safe</button>
      </div>
    </div>
  );
}
