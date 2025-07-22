<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::withCount('quizzes')
            ->when(!Auth::user()->isAdmin(), function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('tags/index', [
            'tags' => $tags,
        ]);
    }

    public function create()
    {
        $this->authorize('create', Tag::class);

        return Inertia::render('tags/create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Tag::class);

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:tags,name',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_active' => 'boolean',
        ]);

        $tag = Tag::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'color' => $validated['color'] ?? '#3B82F6',
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => Auth::id(),
        ]);

        return redirect()
            ->route('tags.show', $tag)
            ->with('success', 'Tag créé avec succès.');
    }

    public function show(Tag $tag)
    {
        if (!$tag->is_active && !Auth::user()->isAdmin()) {
            abort(404);
        }

        $quizzes = $tag->quizzes()
            ->with(['creator', 'sessions'])
            ->withCount('sessions')
            ->when(!Auth::user()->isAdmin(), function ($query) {
                $query->where('is_active', true);
            })
            ->paginate(12);

        $relatedTags = Tag::where('id', '!=', $tag->id)
            ->whereHas('quizzes', function ($query) use ($tag) {
                $query->whereHas('tags', function ($subQuery) use ($tag) {
                    $subQuery->where('tags.id', $tag->id);
                });
            })
            ->withCount('quizzes')
            ->limit(10)
            ->get();

        return Inertia::render('tags/show', [
            'tag' => $tag,
            'quizzes' => $quizzes,
            'relatedTags' => $relatedTags,
        ]);
    }

    public function edit(Tag $tag)
    {
        $this->authorize('update', $tag);

        return Inertia::render('tags/edit', [
            'tag' => $tag,
        ]);
    }

    public function update(Request $request, Tag $tag)
    {
        $this->authorize('update', $tag);

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:tags,name,' . $tag->id,
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_active' => 'boolean',
        ]);

        $tag->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'],
            'color' => $validated['color'] ?? $tag->color,
            'is_active' => $validated['is_active'] ?? $tag->is_active,
        ]);

        return redirect()
            ->route('tags.show', $tag)
            ->with('success', 'Tag mis à jour avec succès.');
    }

    public function destroy(Tag $tag)
    {
        $this->authorize('delete', $tag);

        $quizCount = $tag->quizzes()->count();
        
        if ($quizCount > 0) {
            return back()->withErrors([
                'tag' => "Impossible de supprimer ce tag car il est utilisé par {$quizCount} quiz."
            ]);
        }

        $tag->delete();

        return redirect()
            ->route('tags.index')
            ->with('success', 'Tag supprimé avec succès.');
    }

    public function search(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:1|max:100',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $tags = Tag::where('name', 'LIKE', '%' . $validated['query'] . '%')
            ->where('is_active', true)
            ->limit($validated['limit'] ?? 10)
            ->get(['id', 'name', 'color']);

        return response()->json(['tags' => $tags]);
    }

    public function popular()
    {
        $tags = Tag::withCount('quizzes')
            ->where('is_active', true)
            ->having('quizzes_count', '>', 0)
            ->orderBy('quizzes_count', 'desc')
            ->limit(20)
            ->get();

        return Inertia::render('tags/popular', [
            'tags' => $tags,
        ]);
    }

    public function attachToQuiz(Request $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        $validated = $request->validate([
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        // Vérifier que tous les tags sont actifs (sauf pour les admins)
        if (!Auth::user()->isAdmin()) {
            $inactiveTags = Tag::whereIn('id', $validated['tag_ids'])
                ->where('is_active', false)
                ->exists();

            if ($inactiveTags) {
                return back()->withErrors(['tags' => 'Certains tags sélectionnés ne sont pas actifs.']);
            }
        }

        $quiz->tags()->sync($validated['tag_ids']);

        return back()->with('success', 'Tags mis à jour pour ce quiz.');
    }

    public function detachFromQuiz(Quiz $quiz, Tag $tag)
    {
        $this->authorize('update', $quiz);

        $quiz->tags()->detach($tag->id);

        return back()->with('success', 'Tag retiré du quiz.');
    }

    public function getQuizzesByTag(Tag $tag)
    {
        if (!$tag->is_active && !Auth::user()->isAdmin()) {
            abort(404);
        }

        $quizzes = $tag->quizzes()
            ->with(['creator:id,name', 'tags:id,name,color'])
            ->withCount(['sessions', 'questions'])
            ->when(!Auth::user()->isAdmin(), function ($query) {
                $query->where('is_active', true);
            })
            ->latest()
            ->get();

        return response()->json(['quizzes' => $quizzes]);
    }

    public function bulkAction(Request $request)
    {
        $this->authorize('create', Tag::class);

        $validated = $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'tag_ids' => 'required|array',
            'tag_ids.*' => 'exists:tags,id',
        ]);

        $tags = Tag::whereIn('id', $validated['tag_ids']);

        if ($validated['action'] === 'activate') {
            $tags->update(['is_active' => true]);
            $message = 'Tags activés avec succès.';
        } elseif ($validated['action'] === 'deactivate') {
            $tags->update(['is_active' => false]);
            $message = 'Tags désactivés avec succès.';
        } else {
            // Vérifier qu'aucun tag n'est utilisé avant suppression
            $tagsWithQuizzes = Tag::whereIn('id', $validated['tag_ids'])
                ->has('quizzes')
                ->count();

            if ($tagsWithQuizzes > 0) {
                return back()->withErrors([
                    'tags' => 'Impossible de supprimer des tags qui sont utilisés par des quiz.'
                ]);
            }

            $tags->delete();
            $message = 'Tags supprimés avec succès.';
        }

        return back()->with('success', $message);
    }

    public function merge(Request $request)
    {
        $this->authorize('create', Tag::class);

        $validated = $request->validate([
            'source_tag_ids' => 'required|array|min:2',
            'source_tag_ids.*' => 'exists:tags,id',
            'target_tag_id' => 'required|exists:tags,id',
        ]);

        $targetTag = Tag::findOrFail($validated['target_tag_id']);
        $sourceTags = Tag::whereIn('id', $validated['source_tag_ids'])
            ->where('id', '!=', $targetTag->id)
            ->get();

        if ($sourceTags->isEmpty()) {
            return back()->withErrors(['tags' => 'Aucun tag source valide trouvé.']);
        }

        foreach ($sourceTags as $sourceTag) {
            // Transférer tous les quiz vers le tag cible
            $quizIds = $sourceTag->quizzes()->pluck('quiz_id')->toArray();
            
            foreach ($quizIds as $quizId) {
                $targetTag->quizzes()->syncWithoutDetaching([$quizId]);
            }

            // Supprimer le tag source
            $sourceTag->delete();
        }

        return back()->with('success', 'Tags fusionnés avec succès.');
    }

    public function suggest(Request $request)
    {
        $validated = $request->validate([
            'quiz_title' => 'required|string|max:255',
            'quiz_description' => 'nullable|string|max:1000',
        ]);

        // Logique simple de suggestion basée sur les mots-clés
        $keywords = str_word_count(
            strtolower($validated['quiz_title'] . ' ' . ($validated['quiz_description'] ?? '')), 
            1,
            'àáâãäåçèéêëìíîïðñòóôõöùúûüýÿ'
        );

        $suggestedTags = Tag::where('is_active', true)
            ->where(function ($query) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if (strlen($keyword) >= 3) { // Mots d'au moins 3 caractères
                        $query->orWhere('name', 'LIKE', '%' . $keyword . '%')
                              ->orWhere('description', 'LIKE', '%' . $keyword . '%');
                    }
                }
            })
            ->withCount('quizzes')
            ->orderBy('quizzes_count', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'color', 'description']);

        return response()->json(['suggested_tags' => $suggestedTags]);
    }
}