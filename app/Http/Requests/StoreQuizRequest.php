<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request de validation pour la création de quiz.
 * Implémente le principe de responsabilité unique en séparant la validation.
 */
class StoreQuizRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Vérifier que l'utilisateur peut créer des quiz
        return $this->user() && in_array($this->user()->role, ['presenter', 'admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'time_per_question' => 'integer|min:5|max:300',
            'points_per_question' => 'integer|min:1|max:10000',
            'show_correct_answer' => 'boolean',
            'randomize_questions' => 'boolean',
            'randomize_answers' => 'boolean',
            'allow_multiple_attempts' => 'boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'integer',
            'questions' => 'required|array|min:1',
            'questions.*.text' => 'required|string|max:500',
            'questions.*.type' => 'required|in:single,multiple',
            'questions.*.time_limit' => 'required|integer|min:5|max:300',
            'questions.*.points' => 'required|integer|min:1|max:1000',
            'questions.*.answers' => 'required|array|min:2',
            'questions.*.answers.*.text' => 'required|string|max:200',
            'questions.*.answers.*.is_correct' => 'required|boolean',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Le titre du quiz est obligatoire.',
            'title.max' => 'Le titre ne peut pas dépasser 100 caractères.',
            'description.max' => 'La description ne peut pas dépasser 500 caractères.',
            'time_per_question.min' => 'Le temps par question doit être d\'au moins 5 secondes.',
            'time_per_question.max' => 'Le temps par question ne peut pas dépasser 300 secondes.',
            'points_per_question.min' => 'Les points par question doivent être d\'au moins 1.',
            'points_per_question.max' => 'Les points par question ne peuvent pas dépasser 10000.',
            'tags.*.exists' => 'Un des tags sélectionnés n\'existe pas.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'titre',
            'description' => 'description',
            'category' => 'catégorie',
            'time_per_question' => 'temps par question',
            'multiple_answers' => 'réponses multiples',
            'questions' => 'questions',
            'questions.*.question_text' => 'texte de la question',
            'questions.*.answers' => 'réponses',
            'questions.*.answers.*.answer_text' => 'texte de la réponse',
            'questions.*.answers.*.is_correct' => 'réponse correcte',
        ];
    }
} 