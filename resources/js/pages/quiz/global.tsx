import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Plus, Edit, Eye, Trash2 } from 'lucide-react';

interface Option {
    text: string;
}

interface Question {
    question: string;
    options: Option[];
    correctIndex: number;
    isManual?: boolean;
}

interface Quiz {
    id: number;
    user_id: number;
    topic: string;
    description: string;
    questions: {
        id: number;
        quiz_id: number;
        question: string;
        options: string[];
        correct_index: number;
    }[];
    created_at: string;
    updated_at: string;
}

export default function GlobalQuiz() {
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [step, setStep] = useState<'setup' | 'questions' | 'done'>('setup');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [editId, setEditId] = useState<number|null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const editParam = params.get('edit');
        if (editParam) {
            setEditId(Number(editParam));
            // Fetch quiz data
            fetch(`/quiz/api/list`)
                .then(res => res.json())
                .then(data => {
                    const quiz = (data.quizzes || []).find((q: Quiz) => q.id === Number(editParam));
                    if (quiz) {
                        setTopic(quiz.topic);
                        setDescription(quiz.description);
                        setQuestions(
                            quiz.questions.map((q: { question: string; options: string[]; correct_index: number }) => ({
                                question: q.question,
                                options: q.options.map((text: string) => ({ text })),
                                correctIndex: q.correct_index,
                            }))
                        );
                        setStep('questions');
                    }
                });
        }
    }, []);

    const generateQuestions = () => {
        const sampleQuestions: Question[] = Array.from({ length: numQuestions }, (_, i) => ({
            question: `Sample Question ${i + 1} about ${topic}?`,
            options: [
                { text: 'Option A' },
                { text: 'Option B' },
                { text: 'Option C' },
                { text: 'Option D' },
            ],
            correctIndex: 0,
        }));
        setQuestions(sampleQuestions);
    };

    const handleSetupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        generateQuestions();
        setStep('questions');
    };

    const handleOptionChange = (qIdx: number, optIdx: number) => {
        setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, correctIndex: optIdx } : q));
    };

    const handleQuestionTextChange = (qIdx: number, value: string) => {
        setQuestions((prev) => prev.map((q, i) => i === qIdx ? { ...q, question: value } : q));
    };

    const handleOptionTextChange = (qIdx: number, optIdx: number, value: string) => {
        setQuestions((prev) => prev.map((q, i) =>
            i === qIdx
                ? { ...q, options: q.options.map((opt, j) => j === optIdx ? { ...opt, text: value } : opt) }
                : q
        ));
    };

    const handleAddManualQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                question: '',
                options: [
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '' },
                ],
                correctIndex: 0,
                isManual: true,
            },
        ]);
    };

    const handleSaveQuiz = async () => {
        setSaving(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const payload = {
                topic,
                description,
                questions: questions.map(q => ({
                    question: q.question,
                    options: q.options.map(opt => opt.text),
                    correctIndex: q.correctIndex,
                })),
            };
            let response;
            if (editId) {
                response = await fetch(`/quiz/api/${editId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify(payload),
                });
            } else {
                response = await fetch('/quiz/api/store', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify(payload),
                });
            }
            if (!response.ok) {
                const err = await response.json();
                setErrorMsg(err.message || 'Failed to save quiz.');
            } else {
                setSuccessMsg('Quiz saved successfully!');
                setStep('done');
            }
        } catch {
            setErrorMsg('Failed to save quiz.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Global Quiz', href: '/quiz/global' }]}> 
            <Head title="Global Quiz" />
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 p-4">
                <div className="w-full max-w-2xl">
                    <Card className="shadow-xl border-2 border-blue-100 dark:border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold flex items-center gap-2">
                                <Edit className="h-6 w-6 text-blue-500" />
                                {editId ? 'Edit Quiz' : 'Create a Global Quiz'}
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                {editId ? 'Update your quiz details and questions below.' : 'Set up a new quiz by providing a topic, description, and number of questions.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {step === 'setup' && (
                                <form onSubmit={handleSetupSubmit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="topic">Quiz Topic</Label>
                                        <Input
                                            id="topic"
                                            type="text"
                                            value={topic}
                                            onChange={e => setTopic(e.target.value)}
                                            placeholder="Enter quiz topic (e.g. Science, History)"
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Quiz Description</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Enter a brief description about the quiz"
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="numQuestions">Number of MCQ Questions</Label>
                                        <Input
                                            id="numQuestions"
                                            type="number"
                                            min={1}
                                            max={50}
                                            value={numQuestions}
                                            onChange={e => setNumQuestions(Number(e.target.value))}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="submit"
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-600"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Generate Questions
                                        </Button>
                                    </div>
                                </form>
                            )}
                            {step === 'questions' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-blue-400" />
                                            Review & Edit Questions
                                        </h2>
                                        <Button variant="outline" onClick={handleAddManualQuestion} className="gap-2">
                                            <Plus className="h-4 w-4" /> Add Manual Question
                                        </Button>
                                    </div>
                                    <Separator className="mb-4" />
                                    {questions.map((q, qIdx) => (
                                        <div key={qIdx} className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-neutral-900/60 border border-blue-100 dark:border-neutral-800 shadow-sm">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Label className="text-base font-medium">Question {qIdx + 1}</Label>
                                            </div>
                                            <Input
                                                type="text"
                                                value={q.question}
                                                onChange={e => handleQuestionTextChange(qIdx, e.target.value)}
                                                placeholder="Enter question text"
                                                required
                                                className="mb-3"
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                                {q.options.map((opt, optIdx) => (
                                                    <div key={optIdx} className="flex items-center gap-2">
                                                        <Input
                                                            type="text"
                                                            value={opt.text}
                                                            onChange={e => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                                                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                                            required
                                                        />
                                                        <input
                                                            type="radio"
                                                            name={`correct-${qIdx}`}
                                                            checked={q.correctIndex === optIdx}
                                                            onChange={() => handleOptionChange(qIdx, optIdx)}
                                                        />
                                                        <span className="text-xs">Correct</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <Separator className="my-6" />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-600"
                                            onClick={handleSaveQuiz}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    {editId ? 'Update Quiz' : 'Save Quiz'}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
                                    {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
                                </div>
                            )}
                            {step === 'done' && (
                                <div className="w-full flex flex-col items-center py-12">
                                    <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
                                        <Save className="h-5 w-5" /> Quiz Saved!
                                    </h2>
                                    <p className="text-green-600 mb-4">Your quiz has been saved successfully.</p>
                                    <Button type="button" onClick={() => window.location.reload()} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-600">
                                        Create Another Quiz
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 