// TypeScript interfaces for Quiz and Question
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

import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

export default function AvailableQuizzes() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [attemptedQuizIds, setAttemptedQuizIds] = useState<number[]>([]);
    const [quizScores, setQuizScores] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        setLoading(true);
        setError('');
        fetch('/quiz/api/available')
            .then(res => res.json())
            .then(data => {
                setQuizzes(data.quizzes || []);
                setAttemptedQuizIds(data.attemptedQuizIds || []);
                setQuizScores(data.quizScores || {});
            })
            .catch(() => setError('Failed to load available quizzes.'))
            .finally(() => setLoading(false));
    }, []);

    const handleTakeQuiz = (id: number) => {
        window.location.href = `/quiz/take/${id}`;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Available Quizzes', href: '/quiz/available' }]}> 
            <Head title="Available Quizzes" />
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 p-4">
                <div className="w-full max-w-4xl">
                    <h1 className="text-3xl font-bold mb-6">Available Quizzes</h1>
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    {!loading && quizzes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Eye className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-lg text-muted-foreground">No quizzes available to attempt right now.</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quizzes.map((quiz) => {
                            const attempted = attemptedQuizIds.includes(quiz.id);
                            const score = quizScores[quiz.id];
                            return (
                                <Card key={quiz.id} className="shadow-lg border border-gray-200 dark:border-neutral-800">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {quiz.topic}
                                            {attempted && <Badge variant="secondary">Attempted</Badge>}
                                        </CardTitle>
                                        <CardDescription>{quiz.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-2 text-xs text-muted-foreground">{quiz.questions.length} questions</div>
                                        {attempted && (
                                            <div className="mb-2 text-green-600 font-semibold">Your Score: {score} / {quiz.questions.length}</div>
                                        )}
                                        <Button onClick={() => handleTakeQuiz(quiz.id)} variant={attempted ? 'outline' : 'default'}>
                                            {attempted ? 'Retake Quiz' : 'Take Quiz'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 