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
            'category' => 'nullable|string|max:50',
            'time_per_question' => 'integer|min:5|max:300',
            'multiple_answers' => 'boolean',
            'allow_anonymous' => 'boolean',
            'base_points' => 'integer|min:1|max:1000',
            'time_penalty' => 'boolean',
            'divide_points_multiple' => 'boolean',
            'questions' => 'required|array|min:1',
            'questions.*.question_text' => 'required|string|max:500',
            'questions.*.type' => 'required|in:single,multiple',
            'questions.*.points' => 'integer|min:1|max:100',
            'questions.*.time_limit' => 'integer|min:5|max:300',
            'questions.*.answers' => 'required|array|min:2|max:6',
            'questions.*.answers.*.answer_text' => 'required|string|max:200',
            'questions.*.answers.*.is_correct' => 'required|boolean',
            'questions.*.answers.*.explanation' => 'nullable|string|max:300',
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
            'questions.required' => 'Le quiz doit contenir au moins une question.',
            'questions.min' => 'Le quiz doit contenir au moins une question.',
            'questions.*.question_text.required' => 'Le texte de la question est obligatoire.',
            'questions.*.question_text.max' => 'Le texte de la question ne peut pas dépasser 500 caractères.',
            'questions.*.answers.required' => 'Chaque question doit avoir des réponses.',
            'questions.*.answers.min' => 'Chaque question doit avoir au moins 2 réponses.',
            'questions.*.answers.max' => 'Chaque question ne peut pas avoir plus de 6 réponses.',
            'questions.*.answers.*.answer_text.required' => 'Le texte de la réponse est obligatoire.',
            'questions.*.answers.*.answer_text.max' => 'Le texte de la réponse ne peut pas dépasser 200 caractères.',
            'questions.*.answers.*.is_correct.required' => 'Il faut indiquer si la réponse est correcte ou non.',
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