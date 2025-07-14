import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Eye } from 'lucide-react';

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

export default function QuizList() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
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
        } catch {
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
        } catch {
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
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 p-4">
                <div className="w-full max-w-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">My Quizzes</h1>
                    </div>
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    {success && <p className="text-green-600 mb-2">{success}</p>}
                    <div className="space-y-6">
                        {quizzes.length === 0 && !loading && (
                            <Card className="shadow border-2 border-blue-100 dark:border-neutral-800">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No quizzes yet</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        Click the "Global Quiz" menu to create your first quiz.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        {quizzes.map((quiz) => (
                            <Card key={quiz.id} className="shadow-md border border-blue-100 dark:border-neutral-800 hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-blue-500" />
                                            {quiz.topic}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground mt-1">
                                            {quiz.description}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleView(quiz.id)} className="gap-1">
                                            <Eye className="h-4 w-4" /> View
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(quiz.id)} className="gap-1">
                                            <Edit className="h-4 w-4" /> Update
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(quiz.id)} className="gap-1">
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </Button>
                                    </div>
                                </CardHeader>
                                <Separator className="mb-2" />
                                <CardContent>
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div className="text-xs text-muted-foreground">
                                            {quiz.questions.length} questions
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 