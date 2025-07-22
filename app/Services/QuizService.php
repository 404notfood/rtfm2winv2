<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
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
        // Validation et préparation des données
        $quizData = $this->prepareQuizData($data, $creator);
        
        // Création du quiz
        $quiz = Quiz::create($quizData);
        
        // Génération du lien unique et QR code
        $this->generateQuizLinks($quiz);
        
        return $quiz;
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
                    'text' => $questionData['text'],
                    'type' => $questionData['type'],
                    'time_limit' => $questionData['time_limit'] ?? $data['time_per_question'],
                    'points' => $questionData['points'] ?? 100,
                    'order' => $questionData['order'] ?? 1,
                ]);

                // Create answers
                foreach ($questionData['answers'] as $answerData) {
                    $question->answers()->create([
                        'text' => $answerData['text'],
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
        return array_merge($data, [
            'creator_id' => $creator->id,
            'code' => $this->generateUniqueCode(),
            'status' => $data['status'] ?? 'draft',
            'allow_anonymous' => $data['allow_anonymous'] ?? true,
            'join_code' => $this->generateJoinCode(),
        ]);
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
        // Générer le lien unique
        $uniqueLink = route('quiz.join', ['code' => $quiz->code]);
        
        // Générer le QR code
        $qrCodePath = $this->generateQrCode($quiz->code, $uniqueLink);
        
        // Mettre à jour le quiz
        $quiz->update([
            'unique_link' => $uniqueLink,
            'qr_code_path' => $qrCodePath,
        ]);
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
                'text' => $question->text,
                'type' => $question->type,
                'points' => $question->points,
                'time_limit' => $question->time_limit,
                'order' => $question->order,
            ]);
            
            // Dupliquer les réponses
            foreach ($question->answers as $answer) {
                $newQuestion->answers()->create([
                    'text' => $answer->text,
                    'is_correct' => $answer->is_correct,
                    'explanation' => $answer->explanation,
                ]);
            }
        }
    }
} 