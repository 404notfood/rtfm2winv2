<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Quiz;
use App\Models\Answer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class QuestionController extends Controller
{
    public function index(Quiz $quiz)
    {
        $this->authorize('view', $quiz);
        
        $questions = $quiz->questions()
            ->with('answers')
            ->orderBy('order_index')
            ->paginate(10);

        return Inertia::render('quiz/questions/index', [
            'quiz' => $quiz,
            'questions' => $questions,
        ]);
    }

    public function create(Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        return Inertia::render('quiz/questions/create', [
            'quiz' => $quiz,
        ]);
    }

    public function store(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'text' => 'required|string|max:1000',
            'type' => 'required|in:single,multiple',
            'time_limit' => 'nullable|integer|min:5|max:300',
            'points' => 'nullable|integer|min:100|max:5000',
            'answers' => 'required|array|min:2|max:6',
            'answers.*.text' => 'required|string|max:500',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        // Vérifier qu'il y a au moins une bonne réponse
        $correctAnswers = collect($validated['answers'])->where('is_correct', true);
        if ($correctAnswers->isEmpty()) {
            return back()->withErrors(['answers' => 'Au moins une réponse doit être correcte.']);
        }

        // Pour les questions à choix unique, vérifier qu'il n'y a qu'une seule bonne réponse
        if ($validated['type'] === 'single' && $correctAnswers->count() > 1) {
            return back()->withErrors(['answers' => 'Pour un choix simple, une seule réponse peut être correcte.']);
        }

        $question = $quiz->questions()->create([
            'question_text' => $validated['text'],
            'multiple_answers' => $validated['type'] === 'multiple',
            'points' => $validated['points'] ?? 1000,
            'order_index' => $quiz->questions()->max('order_index') + 1,
        ]);

        foreach ($validated['answers'] as $answerData) {
            $question->answers()->create([
                'answer_text' => $answerData['text'],
                'is_correct' => $answerData['is_correct'],
            ]);
        }

        return redirect()
            ->route('quiz.questions.index', $quiz)
            ->with('success', 'Question créée avec succès.');
    }

    public function show(Quiz $quiz, Question $question)
    {
        $this->authorize('view', $quiz);

        $question->load('answers');

        return Inertia::render('quiz/questions/show', [
            'quiz' => $quiz,
            'question' => $question,
        ]);
    }

    public function edit(Quiz $quiz, Question $question)
    {
        $this->authorize('update', $quiz);

        $question->load('answers');

        return Inertia::render('quiz/questions/edit', [
            'quiz' => $quiz,
            'question' => $question,
        ]);
    }

    public function update(Request $request, Quiz $quiz, Question $question)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'text' => 'required|string|max:1000',
            'type' => 'required|in:single,multiple',
            'time_limit' => 'nullable|integer|min:5|max:300',
            'points' => 'nullable|integer|min:100|max:5000',
            'answers' => 'required|array|min:2|max:6',
            'answers.*.id' => 'nullable|exists:answers,id',
            'answers.*.text' => 'required|string|max:500',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        // Vérifier qu'il y a au moins une bonne réponse
        $correctAnswers = collect($validated['answers'])->where('is_correct', true);
        if ($correctAnswers->isEmpty()) {
            return back()->withErrors(['answers' => 'Au moins une réponse doit être correcte.']);
        }

        // Pour les questions à choix unique, vérifier qu'il n'y a qu'une seule bonne réponse
        if ($validated['type'] === 'single' && $correctAnswers->count() > 1) {
            return back()->withErrors(['answers' => 'Pour un choix simple, une seule réponse peut être correcte.']);
        }

        $question->update([
            'question_text' => $validated['text'],
            'multiple_answers' => $validated['type'] === 'multiple',
            'points' => $validated['points'] ?? 1000,
        ]);

        // Gérer les réponses
        $existingAnswerIds = [];
        foreach ($validated['answers'] as $answerData) {
            if (isset($answerData['id']) && $answerData['id']) {
                // Mettre à jour la réponse existante
                $answer = $question->answers()->find($answerData['id']);
                if ($answer) {
                    $answer->update([
                        'answer_text' => $answerData['text'],
                        'is_correct' => $answerData['is_correct'],
                    ]);
                    $existingAnswerIds[] = $answer->id;
                }
            } else {
                // Créer une nouvelle réponse
                $answer = $question->answers()->create([
                    'answer_text' => $answerData['text'],
                    'is_correct' => $answerData['is_correct'],
                ]);
                $existingAnswerIds[] = $answer->id;
            }
        }

        // Supprimer les réponses qui ne sont plus présentes
        $question->answers()->whereNotIn('id', $existingAnswerIds)->delete();

        return redirect()
            ->route('quiz.questions.index', $quiz)
            ->with('success', 'Question mise à jour avec succès.');
    }

    public function destroy(Quiz $quiz, Question $question)
    {
        $this->authorize('update', $quiz);

        $question->delete();

        return redirect()
            ->route('quiz.questions.index', $quiz)
            ->with('success', 'Question supprimée avec succès.');
    }

    public function reorder(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'required|exists:questions,id',
            'questions.*.order_index' => 'required|integer|min:1',
        ]);

        foreach ($validated['questions'] as $questionData) {
            Question::where('id', $questionData['id'])
                ->where('quiz_id', $quiz->id)
                ->update(['order_index' => $questionData['order_index']]);
        }

        return back()->with('success', 'Ordre des questions mis à jour.');
    }

    public function duplicate(Quiz $quiz, Question $question)
    {
        $this->authorize('update', $quiz);

        $duplicatedQuestion = $question->replicate();
        $duplicatedQuestion->question_text = $question->question_text . ' (Copie)';
        $duplicatedQuestion->order_index = $quiz->questions()->max('order_index') + 1;
        $duplicatedQuestion->save();

        // Dupliquer les réponses
        foreach ($question->answers as $answer) {
            $duplicatedQuestion->answers()->create([
                'answer_text' => $answer->answer_text,
                'is_correct' => $answer->is_correct,
            ]);
        }

        return redirect()
            ->route('quiz.questions.index', $quiz)
            ->with('success', 'Question dupliquée avec succès.');
    }

    public function import(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
            'format' => 'required|in:csv,kahoot',
        ]);

        $file = $request->file('file');
        $content = file_get_contents($file->getRealPath());

        if ($validated['format'] === 'csv') {
            $this->importFromCsv($quiz, $content);
        } elseif ($validated['format'] === 'kahoot') {
            $this->importFromKahoot($quiz, $content);
        }

        return redirect()
            ->route('quiz.questions.index', $quiz)
            ->with('success', 'Questions importées avec succès.');
    }

    private function importFromCsv(Quiz $quiz, string $content)
    {
        $lines = explode("\n", $content);
        $maxOrder = $quiz->questions()->max('order_index') ?? 0;

        foreach ($lines as $line) {
            $data = str_getcsv($line);
            if (count($data) >= 6) { // Question + au moins 4 réponses + index de la bonne réponse
                $questionText = $data[0];
                $correctIndex = (int) $data[count($data) - 1];
                $answers = array_slice($data, 1, -1);

                if (!empty($questionText) && !empty($answers)) {
                    $question = $quiz->questions()->create([
                        'question_text' => $questionText,
                        'multiple_answers' => false,
                        'points' => 1000,
                        'order_index' => ++$maxOrder,
                    ]);

                    foreach ($answers as $index => $answerText) {
                        if (!empty($answerText)) {
                            $question->answers()->create([
                                'answer_text' => $answerText,
                                'is_correct' => ($index + 1) === $correctIndex,
                            ]);
                        }
                    }
                }
            }
        }
    }

    private function importFromKahoot(Quiz $quiz, string $content)
    {
        // Placeholder pour l'import format Kahoot
        // À implémenter selon le format spécifique
    }
}