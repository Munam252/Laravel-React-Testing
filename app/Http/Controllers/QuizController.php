<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\QuizAttempt;

class QuizController extends Controller
{
    /**
     * Generate quiz questions based on topic, description, and number of questions (manual, not AI).
     */
    public function generate(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'numQuestions' => 'required|integer|min:1|max:50',
        ]);

        $topic = $request->input('topic');
        $description = $request->input('description');
        $numQuestions = $request->input('numQuestions');

        $questions = [];
        for ($i = 1; $i <= $numQuestions; $i++) {
            $questions[] = [
                'question' => "Sample Question $i about $topic: $description?",
                'options' => [
                    'Option A',
                    'Option B',
                    'Option C',
                    'Option D',
                ],
                'correctIndex' => 0,
            ];
        }

        return response()->json(['questions' => $questions]);
    }

    /**
     * Store a new quiz and its questions in the database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'topic' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.options' => 'required|array|size:4',
            'questions.*.options.*' => 'required|string',
            'questions.*.correctIndex' => 'required|integer|min:0|max:3',
        ]);

        $quiz = Quiz::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'topic' => $request->input('topic'),
            'description' => $request->input('description'),
        ]);

        foreach ($request->input('questions') as $q) {
            $quiz->questions()->create([
                'question' => $q['question'],
                'options' => $q['options'],
                'correct_index' => $q['correctIndex'],
            ]);
        }

        return response()->json([
            'quiz' => $quiz->load('questions'),
            'message' => 'Quiz and questions saved successfully.'
        ], 201);
    }

    /**
     * Update an existing quiz and its questions in the database.
     */
    public function update(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);
        if ($request->user() && $quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'topic' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.options' => 'required|array|size:4',
            'questions.*.options.*' => 'required|string',
            'questions.*.correctIndex' => 'required|integer|min:0|max:3',
        ]);

        $quiz->update([
            'topic' => $request->input('topic'),
            'description' => $request->input('description'),
        ]);

        // Remove old questions and add new ones
        $quiz->questions()->delete();
        foreach ($request->input('questions') as $q) {
            $quiz->questions()->create([
                'question' => $q['question'],
                'options' => $q['options'],
                'correct_index' => $q['correctIndex'],
            ]);
        }

        return response()->json([
            'quiz' => $quiz->load('questions'),
            'message' => 'Quiz and questions updated successfully.'
        ], 200);
    }

    /**
     * List all quizzes for the authenticated user.
     */
    public function index(Request $request)
    {
        $quizzes = Quiz::where('user_id', $request->user()->id)
            ->with('questions')
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['quizzes' => $quizzes]);
    }

    /**
     * List all quizzes NOT created by the authenticated user (for taking quizzes).
     */
    public function available(Request $request)
    {
        $userId = $request->user()->id;
        $quizzes = Quiz::where('user_id', '!=', $userId)
            ->with('questions')
            ->orderByDesc('created_at')
            ->get();
        $attempts = QuizAttempt::where('user_id', $userId)->get(['quiz_id', 'score']);
        $attemptedQuizIds = $attempts->pluck('quiz_id')->toArray();
        $quizScores = $attempts->pluck('score', 'quiz_id')->toArray();
        return response()->json([
            'quizzes' => $quizzes,
            'attemptedQuizIds' => $attemptedQuizIds,
            'quizScores' => $quizScores,
        ]);
    }

    /**
     * Delete a quiz and its questions if the user owns it.
     */
    public function destroy(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);
        if ($request->user() && $quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }
        $quiz->delete();
        return response()->json(['message' => 'Quiz deleted successfully.']);
    }

    /**
     * Get all attempts for a quiz, including user details, attempt time, and score. Only the quiz owner can access.
     */
    public function attempts(Request $request, $quizId)
    {
        $quiz = Quiz::findOrFail($quizId);
        if ($quiz->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }
        $attempts = \App\Models\QuizAttempt::with('user')
            ->where('quiz_id', $quizId)
            ->orderByDesc('created_at')
            ->get();
        return response()->json(['attempts' => $attempts]);
    }

    /**
     * Record a quiz attempt for the current user.
     */
    public function attempt(Request $request)
    {
        $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
            'score' => 'required|integer',
        ]);
        $userId = $request->user()->id;
        $quizId = $request->input('quiz_id');
        $score = $request->input('score');
        \App\Models\QuizAttempt::updateOrCreate(
            [
                'user_id' => $userId,
                'quiz_id' => $quizId,
            ],
            [
                'score' => $score,
            ]
        );
        return response()->json(['message' => 'Quiz attempt recorded.']);
    }
} 