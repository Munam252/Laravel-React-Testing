import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Question {
    id: number;
    quiz_id: number;
    question: string;
    options: string[];
    correct_index: number;
}
interface Quiz {
    id: number;
    user_id: number;
    topic: string;
    description: string;
    questions: Question[];
    created_at: string;
    updated_at: string;
}

interface TakeQuizProps {
    quizId: number;
}

export default function TakeQuiz(props: TakeQuizProps) {
    const quizId = props.quizId;
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        setLoading(true);
        fetch(`/quiz/api/available`)
            .then(res => res.json())
            .then(data => {
                const found = (data.quizzes || []).find((q: Quiz) => q.id === quizId);
                if (found) {
                    setQuiz(found);
                    setAnswers(Array(found.questions.length).fill(-1));
                } else setError('Quiz not found.');
            })
            .catch(() => setError('Failed to load quiz.'))
            .finally(() => setLoading(false));
    }, [quizId]);

    const handleOptionChange = (qIdx: number, optIdx: number) => {
        setAnswers(ans => ans.map((a, i) => (i === qIdx ? optIdx : a)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let correct = 0;
        quiz?.questions.forEach((q: Question, idx: number) => {
            if (answers[idx] === q.correct_index) correct++;
        });
        setScore(correct);
        setSubmitted(true);
        // Record the attempt in the backend
        try {
            await fetch('/quiz/api/attempt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ quiz_id: quizId, score: correct }),
            });
        } catch {
            // Optionally handle error
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Available Quizzes', href: '/quiz/available' }, { title: 'Take Quiz', href: `/quiz/take/${quizId}` }]}> 
            <Head title="Take Quiz" />
            <div className="flex flex-col items-center justify-center h-full p-8">
                <h1 className="text-3xl font-bold mb-4">Take Quiz</h1>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500 mb-2">{error}</p>}
                {quiz && !submitted && (
                    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-lg shadow p-6 space-y-8">
                        <div>
                            <div className="font-semibold text-lg">{quiz.topic}</div>
                            <div className="text-sm text-muted-foreground mb-2">{quiz.description}</div>
                            <div className="text-xs text-muted-foreground mb-4">{quiz.questions.length} questions</div>
                        </div>
                        {quiz.questions.map((q: Question, idx: number) => (
                            <div key={q.id} className="mb-6 border-b pb-4">
                                <div className="mb-2 font-medium">Q{idx + 1}: {q.question}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {q.options.map((opt: string, optIdx: number) => (
                                        <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`q-${idx}`}
                                                checked={answers[idx] === optIdx}
                                                onChange={() => handleOptionChange(idx, optIdx)}
                                                disabled={submitted}
                                            />
                                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <Button type="submit" className="w-full">Submit Quiz</Button>
                    </form>
                )}
                {quiz && submitted && (
                    <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-lg shadow p-6 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4">Quiz Results</h2>
                        <p className="text-green-600 mb-4">You scored {score} out of {quiz.questions.length}!</p>
                        {quiz.questions.map((q: Question, idx: number) => (
                            <div key={q.id} className="mb-6 border-b pb-4 w-full">
                                <div className="mb-2 font-medium">Q{idx + 1}: {q.question}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {q.options.map((opt: string, optIdx: number) => (
                                        <div key={optIdx} className="flex items-center gap-2">
                                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                            {q.correct_index === optIdx && <Badge variant="secondary">Correct</Badge>}
                                            {answers[idx] === optIdx && answers[idx] !== q.correct_index && <Badge variant="destructive">Your Answer</Badge>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <Button type="button" onClick={() => window.location.href = '/quiz/available'}>Back to Available Quizzes</Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
} 