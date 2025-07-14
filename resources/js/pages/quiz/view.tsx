import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function QuizView(props: any) {
    // quizId is passed as a prop from the Inertia route
    const quizId = props.quizId;
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`/quiz/api/list`)
            .then(res => res.json())
            .then(data => {
                const found = (data.quizzes || []).find((q: any) => q.id === quizId);
                if (found) setQuiz(found);
                else setError('Quiz not found.');
            })
            .catch(() => setError('Failed to load quiz.'))
            .finally(() => setLoading(false));
    }, [quizId]);

    const handleEdit = () => {
        window.location.href = `/quiz/global?edit=${quizId}`;
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        try {
            const res = await fetch(`/quiz/api/${quizId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            if (res.ok) {
                window.location.href = '/quiz/list';
            } else {
                alert('Failed to delete quiz.');
            }
        } catch (e) {
            alert('Failed to delete quiz.');
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Quiz List', href: '/quiz/list' }, { title: 'View Quiz', href: `/quiz/view/${quizId}` }]}> 
            <Head title="View Quiz" />
            <div className="flex flex-col items-center justify-center h-full p-8">
                <h1 className="text-3xl font-bold mb-4">View Quiz</h1>
                <div className="flex gap-2 mb-4">
                    <Button variant="outline" onClick={handleEdit}>Update</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500 mb-2">{error}</p>}
                {quiz && (
                    <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-lg shadow p-6 space-y-6">
                        <div>
                            <div className="font-semibold text-lg">{quiz.topic}</div>
                            <div className="text-sm text-muted-foreground mb-2">{quiz.description}</div>
                            <div className="text-xs text-muted-foreground mb-4">{quiz.questions.length} questions</div>
                        </div>
                        {quiz.questions.map((q: any, idx: number) => (
                            <div key={q.id} className="mb-6 border-b pb-4">
                                <div className="mb-2 font-medium">Q{idx + 1}: {q.question}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {q.options.map((opt: string, optIdx: number) => (
                                        <div key={optIdx} className="flex items-center gap-2">
                                            <span>{String.fromCharCode(65 + optIdx)}.</span>
                                            <span>{opt}</span>
                                            {q.correct_index === optIdx && <Badge variant="secondary">Correct</Badge>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
} 