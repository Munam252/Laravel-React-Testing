import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function QuizList() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchQuizzes = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/quiz/api/list');
            const data = await res.json();
            setQuizzes(data.quizzes || []);
        } catch (e) {
            setError('Failed to load quizzes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`/quiz/api/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });
            if (!res.ok) {
                setError('Failed to delete quiz.');
            } else {
                setSuccess('Quiz deleted successfully.');
                setQuizzes(qs => qs.filter(q => q.id !== id));
            }
        } catch (e) {
            setError('Failed to delete quiz.');
        }
    };

    const handleEdit = (id: number) => {
        window.location.href = `/quiz/global?edit=${id}`;
    };

    const handleView = (id: number) => {
        window.location.href = `/quiz/view/${id}`;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Quiz List', href: '/quiz/list' }]}> 
            <Head title="My Quizzes" />
            <div className="flex flex-col items-center justify-center h-full p-8">
                <h1 className="text-3xl font-bold mb-4">My Quizzes</h1>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500 mb-2">{error}</p>}
                {success && <p className="text-green-600 mb-2">{success}</p>}
                <div className="w-full max-w-2xl space-y-4">
                    {quizzes.length === 0 && !loading && <p>No quizzes found.</p>}
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="font-semibold text-lg">{quiz.topic}</div>
                                <div className="text-sm text-muted-foreground mb-2">{quiz.description}</div>
                                <div className="text-xs text-muted-foreground">{quiz.questions.length} questions</div>
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0">
                                <Button variant="outline" onClick={() => handleView(quiz.id)}>View</Button>
                                <Button variant="outline" onClick={() => handleEdit(quiz.id)}>Update</Button>
                                <Button variant="destructive" onClick={() => handleDelete(quiz.id)}>Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
} 