import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Eye, User } from 'lucide-react';

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
interface Attempt {
    id: number;
    user_id: number;
    quiz_id: number;
    score: number;
    created_at: string;
    user?: {
        name: string;
        email: string;
    };
}

interface QuizViewProps {
    quizId: number;
}

export default function QuizView(props: QuizViewProps) {
    const quizId = props.quizId;
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [attemptsLoading, setAttemptsLoading] = useState(false);
    const [attemptsError, setAttemptsError] = useState('');
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/quiz/api/list`)
            .then(res => res.json())
            .then(data => {
                const found = (data.quizzes || []).find((q: Quiz) => q.id === quizId);
                let userId = undefined;
                if (typeof window !== 'undefined' && (window as any).Laravel && (window as any).Laravel.user) {
                    userId = (window as any).Laravel.user.id;
                }
                if (found) {
                    setQuiz(found);
                    setIsOwner(found.user_id === userId);
                }
                else setError('Quiz not found.');
            })
            .catch(() => setError('Failed to load quiz.'))
            .finally(() => setLoading(false));
    }, [quizId]);

    useEffect(() => {
        if (isOwner) {
            setAttemptsLoading(true);
            fetch(`/quiz/api/${quizId}/attempts`)
                .then(res => res.json())
                .then(data => setAttempts(data.attempts || []))
                .catch(() => setAttemptsError('Failed to load attempts.'))
                .finally(() => setAttemptsLoading(false));
        }
    }, [isOwner, quizId]);

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
        } catch {
            alert('Failed to delete quiz.');
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Quiz List', href: '/quiz/list' }, { title: 'View Quiz', href: `/quiz/view/${quizId}` }]}> 
            <Head title="View Quiz" />
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 p-4">
                <div className="w-full max-w-3xl">
                    <Card className="shadow-xl border-2 border-blue-100 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold flex items-center gap-2">
                                <Eye className="h-6 w-6 text-blue-500" />
                                Quiz Details
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                View all details and questions for this quiz.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <Button variant="outline" onClick={handleEdit} className="gap-2">
                                    <Edit className="h-4 w-4" /> Update
                                </Button>
                                <Button variant="destructive" onClick={handleDelete} className="gap-2">
                                    <Trash2 className="h-4 w-4" /> Delete
                                </Button>
                            </div>
                            {loading && <p>Loading...</p>}
                            {error && <p className="text-red-500 mb-2">{error}</p>}
                            {quiz && (
                                <div className="w-full">
                                    <div className="mb-6">
                                        <div className="font-semibold text-lg mb-1">{quiz.topic}</div>
                                        <div className="text-sm text-muted-foreground mb-2">{quiz.description}</div>
                                        <div className="text-xs text-muted-foreground mb-4">{quiz.questions.length} questions</div>
                                    </div>
                                    <Separator className="mb-4" />
                                    {quiz.questions.map((q: Question, idx: number) => (
                                        <div key={q.id} className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-neutral-900/60 border border-blue-100 dark:border-neutral-800 shadow-sm">
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
                            {quiz && isOwner && (
                                <div className="w-full bg-white dark:bg-neutral-900 rounded-lg shadow p-6 mt-8 border border-blue-100 dark:border-neutral-800">
                                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-400" /> Quiz Attempts
                                    </h2>
                                    <Separator className="mb-4" />
                                    {attemptsLoading && <p>Loading attempts...</p>}
                                    {attemptsError && <p className="text-red-500 mb-2">{attemptsError}</p>}
                                    {attempts.length === 0 && !attemptsLoading && <p>No attempts yet.</p>}
                                    {attempts.length > 0 && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm border rounded-lg">
                                                <thead className="bg-blue-100 dark:bg-neutral-800">
                                                    <tr>
                                                        <th className="text-left p-2">User</th>
                                                        <th className="text-left p-2">Email</th>
                                                        <th className="text-left p-2">Score</th>
                                                        <th className="text-left p-2">Attempted At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attempts.map((a: Attempt) => {
                                                        const user = a.user as { name?: string; email?: string } | undefined;
                                                        return (
                                                            <tr key={a.id} className="border-b last:border-b-0">
                                                                <td className="p-2">{user?.name || 'Unknown'}</td>
                                                                <td className="p-2">{user?.email || ''}</td>
                                                                <td className="p-2 font-semibold text-blue-700 dark:text-blue-300">{a.score}</td>
                                                                <td className="p-2">{new Date(a.created_at).toLocaleString()}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 