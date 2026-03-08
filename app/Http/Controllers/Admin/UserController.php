<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/users/index');
    }

    public function search(Request $request): \Illuminate\Http\JsonResponse
    {
        $this->authorizeSuperAdmin();

        $sortField = $request->input('sort', 'name');
        $sortDirection = $request->input('direction', 'asc');

        $allowedSortFields = ['name', 'email', 'created_at'];
        if (! in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        $perPage = min((int) $request->input('per_page', 10), 100);

        $query = User::query()
            ->where('is_super_admin', true);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $users = $query->orderBy($sortField, $sortDirection)
            ->paginate($perPage);

        return response()->json([
            'data' => $users->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->toISOString(),
                'created_at_human' => $user->created_at->diffForHumans(),
                'is_current_user' => $user->id === auth()->id(),
            ]),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/users/form');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_super_admin' => true,
            'email_verified_at' => now(),
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Administrator created successfully.');
    }

    public function edit(User $user): Response
    {
        $this->authorizeSuperAdmin();

        if (! $user->is_super_admin) {
            abort(404);
        }

        return Inertia::render('admin/users/form', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        if (! $user->is_super_admin) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', Password::defaults()],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Administrator updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        if (! $user->is_super_admin) {
            abort(404);
        }

        // Cannot delete yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors([
                'delete' => 'You cannot delete your own account.',
            ]);
        }

        // Ensure at least one super admin remains
        $superAdminCount = User::where('is_super_admin', true)->count();
        if ($superAdminCount <= 1) {
            return back()->withErrors([
                'delete' => 'Cannot delete the last super administrator.',
            ]);
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Administrator deleted successfully.');
    }

    protected function authorizeSuperAdmin(): void
    {
        if (! auth()->user()?->is_super_admin) {
            abort(403, 'This action is restricted to super administrators.');
        }
    }
}
