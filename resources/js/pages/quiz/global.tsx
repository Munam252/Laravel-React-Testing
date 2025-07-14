import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Option {
    text: string;
}

interface Question {
    question: string;
    options: Option[];
    correctIndex: number;
    isManual?: boolean;
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
                    const quiz = (data.quizzes || []).find((q: any) => q.id === Number(editParam));
                    if (quiz) {
                        setTopic(quiz.topic);
                        setDescription(quiz.description);
                        setQuestions(
                            quiz.questions.map((q: any) => ({
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

    // Mock AI generation for now
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
        } catch (e) {
            setErrorMsg('Failed to save quiz.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Global Quiz', href: '/quiz/global' }]}> 
            <Head title="Global Quiz" />
            <div className="flex flex-col items-center justify-center h-full p-8">
                <h1 className="text-3xl font-bold mb-4">Global Quiz</h1>
                {step === 'setup' && (
                    <form onSubmit={handleSetupSubmit} className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-lg shadow p-6 space-y-6">
                        <div>
                            <Label htmlFor="topic">Quiz Topic</Label>
                            <Input
                                id="topic"
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="Enter quiz topic (e.g. Science, History)"
                                required
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
                            />
                        </div>
                        <Button type="submit" className="w-full">Generate Questions</Button>
                    </form>
                )}
                {step === 'questions' && (
                    <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-lg shadow p-6 space-y-8 mt-4">
                        <h2 className="text-2xl font-semibold mb-2">AI Generated Questions</h2>
                        {questions.map((q, qIdx) => (
                            <div key={qIdx} className="mb-6 border-b pb-4">
                                <div className="mb-2">
                                    <Label>Question {qIdx + 1}</Label>
                                    <Input
                                        type="text"
                                        value={q.question}
                                        onChange={e => handleQuestionTextChange(qIdx, e.target.value)}
                                        placeholder="Enter question text"
                                        required
                                    />
                                </div>
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
                        <Button type="button" variant="outline" onClick={handleAddManualQuestion} className="mt-2">+ Add Manual Question</Button>
                        <Button type="button" className="w-full mt-6" onClick={handleSaveQuiz} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Quiz'}
                        </Button>
                        {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
                        {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
                    </div>
                )}
                {step === 'done' && (
                    <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-lg shadow p-6 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4">Quiz Saved!</h2>
                        <p className="text-green-600 mb-4">Your quiz has been saved successfully.</p>
                        <Button type="button" onClick={() => window.location.reload()}>Create Another Quiz</Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
} 