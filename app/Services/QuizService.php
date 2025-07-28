<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/**
 * Service pour la gestion des quiz.
 * Implémente les principes POO : responsabilité unique, encapsulation, abstraction.
 */
class QuizService
{
    /**
     * Créer un nouveau quiz avec génération automatique du code et QR code.
     * 
     * @param array $data
     * @param User $creator
     * @return Quiz
     */
    public function createQuiz(array $data, User $creator): Quiz
    {
        try {
            DB::beginTransaction();
            
            // Debug logging
            \Log::info('QuizService: Starting quiz creation', [
                'data' => $data,
                'creator_id' => $creator->id
            ]);
            
            // Validation et préparation des données
            $quizData = $this->prepareQuizData($data, $creator);
            
            \Log::info('QuizService: Quiz data prepared', ['quiz_data' => $quizData]);
            
            // Création du quiz
            $quiz = Quiz::create($quizData);
            
            \Log::info('QuizService: Quiz created', ['quiz_id' => $quiz->id]);
            
            // Création des questions et réponses
            if (isset($data['questions']) && is_array($data['questions'])) {
                \Log::info('QuizService: Creating questions', ['count' => count($data['questions'])]);
                $this->createQuestions($quiz, $data['questions']);
            }
            
            // Génération du lien unique et QR code
            $this->generateQuizLinks($quiz);
            
            DB::commit();
            
            \Log::info('QuizService: Quiz creation completed', ['quiz_id' => $quiz->id]);
            
            return $quiz;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('QuizService: Quiz creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Créer une session de quiz.
     * 
     * @param Quiz $quiz
     * @param User $presenter
     * @param array $settings
     * @return QuizSession
     */
    public function createSession(Quiz $quiz, User $presenter, array $settings = []): QuizSession
    {
        return QuizSession::create([
            'quiz_id' => $quiz->id,
            'presenter_id' => $presenter->id,
            'code' => $this->generateSessionCode(),
            'status' => 'waiting',
            'settings' => $settings,
            'current_question_index' => 0,
        ]);
    }

    /**
     * Dupliquer un quiz existant.
     * 
     * @param Quiz $originalQuiz
     * @param User $newCreator
     * @return Quiz
     */
    public function duplicateQuiz(Quiz $originalQuiz, User $newCreator): Quiz
    {
        $duplicatedData = $originalQuiz->toArray();
        
        // Nettoyer les données pour la duplication
        unset($duplicatedData['id'], $duplicatedData['created_at'], $duplicatedData['updated_at']);
        
        $duplicatedData['title'] = $duplicatedData['title'] . ' (Copie)';
        $duplicatedData['creator_id'] = $newCreator->id;
        
        $duplicatedQuiz = $this->createQuiz($duplicatedData, $newCreator);
        
        // Dupliquer les questions
        $this->duplicateQuestions($originalQuiz, $duplicatedQuiz);
        
        return $duplicatedQuiz;
    }

    /**
     * Update an existing quiz
     */
    public function updateQuiz(Quiz $quiz, array $data): Quiz
    {
        DB::beginTransaction();
        
        try {
            // Update quiz basic info
            $quiz->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'category' => $data['category'] ?? null,
                'time_per_question' => $data['time_per_question'],
                'multiple_answers' => $data['multiple_answers'],
                'status' => $data['status'] ?? $quiz->status,
            ]);

            // Delete existing questions
            $quiz->questions()->delete();

            // Create new questions
            foreach ($data['questions'] as $questionData) {
                $question = $quiz->questions()->create([
                    'question_text' => $questionData['text'],
                    'points' => $questionData['points'] ?? 100,
                    'order_index' => $questionData['order'] ?? 1,
                    'multiple_answers' => $questionData['type'] === 'multiple' ? true : false,
                ]);

                // Create answers
                foreach ($questionData['answers'] as $answerData) {
                    $question->answers()->create([
                        'answer_text' => $answerData['text'],
                        'is_correct' => $answerData['is_correct'],
                    ]);
                }
            }

            DB::commit();
            return $quiz->fresh(['questions.answers']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a quiz and all related data
     */
    public function deleteQuiz(Quiz $quiz): bool
    {
        DB::beginTransaction();
        
        try {
            // Delete related data (sessions, participants, etc.)
            $quiz->sessions()->delete();
            $quiz->questions()->delete();
            
            // Delete the quiz
            $quiz->delete();
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Regenerate quiz unique link and QR code
     */
    public function regenerateQuizLink(Quiz $quiz): Quiz
    {
        $newCode = $this->generateUniqueCode();
        $newLink = config('app.url') . "/quiz/join/{$newCode}";
        
        $quiz->update([
            'unique_link' => $newLink,
            'qr_code' => $this->generateQRCode($newLink),
        ]);
        
        return $quiz;
    }

    /**
     * Préparer les données du quiz avant création.
     * Méthode privée suivant le principe d'encapsulation.
     * 
     * @param array $data
     * @param User $creator
     * @return array
     */
    private function prepareQuizData(array $data, User $creator): array
    {
        $code = $this->generateUniqueCode();
        $joinCode = $this->generateJoinCode();
        
        \Log::info('QuizService: Generated codes', [
            'code' => $code,
            'join_code' => $joinCode
        ]);
        
        return [
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'creator_id' => $creator->id,
            'code' => $code,
            'status' => ($data['is_active'] ?? false) ? 'active' : 'draft',
            'allow_anonymous' => $data['is_public'] ?? true,
            'join_code' => $joinCode,
            'time_per_question' => $data['time_per_question'] ?? 30,
            'base_points' => $data['points_per_question'] ?? 1000,
            'multiple_answers' => false, // Default for now
            'time_penalty' => 10, // Default
            'divide_points_multiple' => $data['show_correct_answer'] ?? true,
            'total_sessions' => 0,
            'total_participants' => 0,
            'average_score' => null,
        ];
    }

    /**
     * Générer un code unique pour le quiz.
     * 
     * @return string
     */
    private function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (Quiz::where('code', $code)->exists());
        
        return $code;
    }

    /**
     * Générer un code de session unique.
     * 
     * @return string
     */
    private function generateSessionCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (QuizSession::where('code', $code)->exists());
        
        return $code;
    }

    /**
     * Générer un code de participation.
     * 
     * @return string
     */
    private function generateJoinCode(): string
    {
        return strtoupper(Str::random(6));
    }

    /**
     * Générer les liens et QR codes pour un quiz.
     * 
     * @param Quiz $quiz
     * @return void
     */
    private function generateQuizLinks(Quiz $quiz): void
    {
        try {
            // Générer le lien unique avec timestamp pour garantir unicité
            $uniqueLink = url("/join/{$quiz->code}");
            
            \Log::info('QuizService: Generating quiz links', [
                'quiz_id' => $quiz->id,
                'code' => $quiz->code,
                'unique_link' => $uniqueLink
            ]);
            
            // Générer le QR code
            $qrCodePath = $this->generateQrCode($quiz->code, $uniqueLink);
            
            // Mettre à jour le quiz
            $quiz->update([
                'unique_link' => $uniqueLink,
                'qr_code_path' => $qrCodePath,
            ]);
            
            \Log::info('QuizService: Quiz links generated successfully', [
                'quiz_id' => $quiz->id,
                'unique_link' => $uniqueLink,
                'qr_code_path' => $qrCodePath
            ]);
        } catch (\Exception $e) {
            \Log::error('QuizService: Failed to generate quiz links', [
                'quiz_id' => $quiz->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Générer un QR code pour le quiz.
     * 
     * @param string $code
     * @param string $url
     * @return string
     */
    private function generateQrCode(string $code, string $url): string
    {
        $qrCodeContent = QrCode::format('png')
            ->size(200)
            ->generate($url);
        
        $fileName = "qr-codes/quiz-{$code}.png";
        Storage::disk('public')->put($fileName, $qrCodeContent);
        
        return $fileName;
    }

    /**
     * Créer les questions et réponses pour un quiz.
     * 
     * @param Quiz $quiz
     * @param array $questionsData
     * @return void
     */
    private function createQuestions(Quiz $quiz, array $questionsData): void
    {
        foreach ($questionsData as $index => $questionData) {
            $question = $quiz->questions()->create([
                'question_text' => $questionData['text'],
                'points' => $questionData['points'] ?? 1000,
                'order_index' => $index + 1,
                'multiple_answers' => $questionData['type'] === 'multiple' ? true : false,
            ]);
            
            // Créer les réponses
            foreach ($questionData['answers'] as $answerData) {
                $question->answers()->create([
                    'answer_text' => $answerData['text'],
                    'is_correct' => $answerData['is_correct'],
                ]);
            }
        }
    }

    /**
     * Dupliquer les questions d'un quiz.
     * 
     * @param Quiz $originalQuiz
     * @param Quiz $duplicatedQuiz
     * @return void
     */
    private function duplicateQuestions(Quiz $originalQuiz, Quiz $duplicatedQuiz): void
    {
        foreach ($originalQuiz->questions as $question) {
            $newQuestion = $duplicatedQuiz->questions()->create([
                'question_text' => $question->question_text,
                'points' => $question->points,
                'order_index' => $question->order_index,
                'multiple_answers' => $question->multiple_answers,
            ]);
            
            // Dupliquer les réponses
            foreach ($question->answers as $answer) {
                $newQuestion->answers()->create([
                    'answer_text' => $answer->answer_text,
                    'is_correct' => $answer->is_correct,
                    'explanation' => $answer->explanation,
                ]);
            }
        }
    }
} 