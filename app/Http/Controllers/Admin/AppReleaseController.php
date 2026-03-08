<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppRelease;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AppReleaseController extends Controller
{
    public function index(): Response
    {
        $this->authorizeSuperAdmin();

        $releases = AppRelease::query()
            ->orderByDesc('version_code')
            ->paginate(15)
            ->through(fn ($release) => [
                'id' => $release->id,
                'version_name' => $release->version_name,
                'version_code' => $release->version_code,
                'apk_size' => $release->getFormattedSize(),
                'release_notes' => $release->release_notes,
                'force_update' => $release->force_update,
                'min_version_code' => $release->min_version_code,
                'is_active' => $release->is_active,
                'published_at' => $release->published_at?->diffForHumans(),
                'created_at' => $release->created_at->diffForHumans(),
            ]);

        $currentRelease = AppRelease::getCurrentRelease();

        return Inertia::render('admin/releases/index', [
            'releases' => $releases,
            'currentRelease' => $currentRelease ? [
                'id' => $currentRelease->id,
                'version_name' => $currentRelease->version_name,
                'version_code' => $currentRelease->version_code,
            ] : null,
        ]);
    }

    public function create(): Response
    {
        $this->authorizeSuperAdmin();

        // Get the next version code suggestion
        $lastVersionCode = AppRelease::max('version_code') ?? 0;

        return Inertia::render('admin/releases/form', [
            'suggestedVersionCode' => $lastVersionCode + 1,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'version_name' => ['required', 'string', 'max:50'],
            'version_code' => ['required', 'integer', 'min:1', 'unique:app_releases,version_code'],
            'apk_file' => ['required', 'file', 'max:204800'], // 200MB max
            'release_notes' => ['nullable', 'string', 'max:5000'],
            'force_update' => ['boolean'],
            'min_version_code' => ['required', 'integer', 'min:1'],
            'activate' => ['boolean'],
        ]);

        // Validate file extension manually (APK MIME type varies)
        $apkFile = $request->file('apk_file');
        if (strtolower($apkFile->getClientOriginalExtension()) !== 'apk') {
            return back()->withErrors(['apk_file' => 'The file must be an APK file.']);
        }

        // Upload APK to S3/Backblaze B2
        $filename = "exibi-v{$validated['version_name']}-{$validated['version_code']}.apk";
        $path = "releases/{$filename}";

        try {
            Log::info('Uploading APK to S3', [
                'filename' => $filename,
                'path' => $path,
                'size' => $apkFile->getSize(),
                'original_name' => $apkFile->getClientOriginalName(),
            ]);

            // Upload APK to S3 (visibility configured in filesystem config for B2 compatibility)
            $result = Storage::disk('s3')->put($path, file_get_contents($apkFile->getRealPath()));

            Log::info('S3 upload result', ['result' => $result, 'path' => $path]);

            if (! $result) {
                Log::error('APK upload failed - put() returned false');

                return back()->withErrors(['apk_file' => 'Failed to upload APK file. The storage returned an error.']);
            }

            // Verify the file exists in S3
            if (! Storage::disk('s3')->exists($path)) {
                Log::error('APK upload failed - file does not exist in S3 after upload', ['path' => $path]);

                return back()->withErrors(['apk_file' => 'Failed to upload APK file. The file was not found after upload.']);
            }

            Log::info('APK uploaded successfully', ['path' => $path]);
        } catch (\Exception $e) {
            Log::error('APK upload exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['apk_file' => 'Failed to upload APK file: '.$e->getMessage()]);
        }

        $release = AppRelease::create([
            'version_name' => $validated['version_name'],
            'version_code' => $validated['version_code'],
            'apk_path' => $path,
            'apk_size_bytes' => $apkFile->getSize(),
            'release_notes' => $validated['release_notes'],
            'force_update' => $validated['force_update'] ?? false,
            'min_version_code' => $validated['min_version_code'],
            'is_active' => false,
        ]);

        // Activate if requested
        if ($validated['activate'] ?? false) {
            $release->activate();
        }

        return redirect()
            ->route('admin.releases.index')
            ->with('success', "Release v{$release->version_name} created successfully.");
    }

    public function edit(AppRelease $release): Response
    {
        $this->authorizeSuperAdmin();

        return Inertia::render('admin/releases/form', [
            'release' => [
                'id' => $release->id,
                'version_name' => $release->version_name,
                'version_code' => $release->version_code,
                'apk_size' => $release->getFormattedSize(),
                'apk_url' => $release->getApkUrl(),
                'release_notes' => $release->release_notes,
                'force_update' => $release->force_update,
                'min_version_code' => $release->min_version_code,
                'is_active' => $release->is_active,
            ],
        ]);
    }

    public function update(Request $request, AppRelease $release): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $validated = $request->validate([
            'version_name' => ['required', 'string', 'max:50'],
            'release_notes' => ['nullable', 'string', 'max:5000'],
            'force_update' => ['boolean'],
            'min_version_code' => ['required', 'integer', 'min:1'],
        ]);

        $release->update([
            'version_name' => $validated['version_name'],
            'release_notes' => $validated['release_notes'],
            'force_update' => $validated['force_update'] ?? false,
            'min_version_code' => $validated['min_version_code'],
        ]);

        return redirect()
            ->route('admin.releases.index')
            ->with('success', "Release v{$release->version_name} updated successfully.");
    }

    public function destroy(AppRelease $release): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        if ($release->is_active) {
            return back()->withErrors([
                'delete' => 'Cannot delete the active release. Activate another release first.',
            ]);
        }

        // Delete APK from S3
        if ($release->apk_path) {
            Storage::disk('s3')->delete($release->apk_path);
        }

        $versionName = $release->version_name;
        $release->delete();

        return redirect()
            ->route('admin.releases.index')
            ->with('success', "Release v{$versionName} deleted successfully.");
    }

    public function activate(AppRelease $release): RedirectResponse
    {
        $this->authorizeSuperAdmin();

        $release->activate();

        return back()->with('success', "Release v{$release->version_name} is now active.");
    }

    protected function authorizeSuperAdmin(): void
    {
        if (! auth()->user()?->is_super_admin) {
            abort(403, 'This action is restricted to super administrators.');
        }
    }
}
