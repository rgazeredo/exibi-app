import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useT } from '@/hooks/use-translations';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Film,
    Image,
    Pause,
    Play,
    SkipBack,
    SkipForward,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MediaItem {
    id: string;
    title: string;
    type: 'video' | 'image';
    url: string | null;
    thumbnail_url: string | null;
    duration: number;
    position: number;
}

interface Playlist {
    id: string;
    name: string;
    total_duration: number;
    media: MediaItem[];
}

interface PlaylistPreviewProps {
    playlist: Playlist;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlaylistPreview({ playlist }: PlaylistPreviewProps) {
    const { t } = useT();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const currentMedia = playlist.media[currentIndex];
    const hasNext = currentIndex < playlist.media.length - 1;
    const hasPrev = currentIndex > 0;

    const goToNext = useCallback(() => {
        if (hasNext) {
            setCurrentIndex((prev) => prev + 1);
            setProgress(0);
            setElapsedTime(0);
        } else {
            // Loop back to start
            setCurrentIndex(0);
            setProgress(0);
            setElapsedTime(0);
        }
    }, [hasNext]);

    const goToPrev = useCallback(() => {
        if (hasPrev) {
            setCurrentIndex((prev) => prev - 1);
            setProgress(0);
            setElapsedTime(0);
        }
    }, [hasPrev]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    // Handle image timer
    useEffect(() => {
        if (!currentMedia || currentMedia.type === 'video' || !isPlaying) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const duration = currentMedia.duration;
        const startTime = Date.now() - elapsedTime * 1000;

        intervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const newProgress = (elapsed / duration) * 100;

            if (elapsed >= duration) {
                goToNext();
            } else {
                setProgress(newProgress);
                setElapsedTime(elapsed);
            }
        }, 100);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [currentMedia, isPlaying, goToNext, elapsedTime]);

    // Handle video events
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !currentMedia || currentMedia.type !== 'video') return;

        const handleTimeUpdate = () => {
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
                setElapsedTime(video.currentTime);
            }
        };

        const handleEnded = () => {
            goToNext();
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
        };
    }, [currentMedia, goToNext]);

    // Handle video play/pause
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !currentMedia || currentMedia.type !== 'video') return;

        if (isPlaying) {
            video.play().catch(() => { });
        } else {
            video.pause();
        }
    }, [isPlaying, currentMedia]);

    // Reset video when changing media
    useEffect(() => {
        const video = videoRef.current;
        if (video && currentMedia?.type === 'video') {
            video.currentTime = 0;
            if (isPlaying) {
                video.play().catch(() => { });
            }
        }
    }, [currentIndex, currentMedia?.type, isPlaying]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
                case 'ArrowLeft':
                    goToPrev();
                    break;
                case 'Escape':
                    window.history.back();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlayPause, goToNext, goToPrev]);

    if (!currentMedia) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-center">
                    <p>{t('playlists.noMediaItems') || 'No media in this playlist'}</p>
                    <Link href={`/playlists/${playlist.id}`} className="text-primary mt-4 block">
                        {t('common.back') || 'Go back'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title={`Preview: ${playlist.name}`} />
            <div className="min-h-screen bg-black flex flex-col">
                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" asChild>
                                <Link href={`/playlists/${playlist.id}`}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-white font-semibold">{playlist.name}</h1>
                                <p className="text-white/60 text-sm">
                                    {t('playlists.previewMode') || 'Preview Mode'} - {currentIndex + 1} / {playlist.media.length}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Current media info */}
                            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                                {currentMedia.type === 'video' ? (
                                    <Film className="h-4 w-4 text-white/70" />
                                ) : (
                                    <Image className="h-4 w-4 text-white/70" />
                                )}
                                <span className="text-white/90 text-sm max-w-[200px] truncate">{currentMedia.title}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" asChild>
                                <Link href={`/playlists/${playlist.id}`}>
                                    <X className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex-1 flex items-center justify-center relative">
                    {currentMedia.type === 'video' ? (
                        <video
                            ref={videoRef}
                            src={currentMedia.url || ''}
                            className="max-h-[calc(100vh-200px)] max-w-full object-contain"
                            playsInline
                            muted={false}
                        />
                    ) : (
                        <img
                            src={currentMedia.url || currentMedia.thumbnail_url || ''}
                            alt={currentMedia.title}
                            className="max-h-[calc(100vh-200px)] max-w-full object-contain"
                        />
                    )}
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* Progress bar */}
                    <div className="mb-4">
                        <Progress value={progress} className="h-1" />
                        <div className="flex justify-between text-white/60 text-xs mt-1">
                            <span>{formatTime(elapsedTime)}</span>
                            <span>{formatTime(currentMedia.duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={goToPrev}
                            disabled={!hasPrev}
                        >
                            <SkipBack className="h-6 w-6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="text-white hover:bg-white/20 h-14 w-14 rounded-full"
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? (
                                <Pause className="h-8 w-8" />
                            ) : (
                                <Play className="h-8 w-8 ml-1" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={goToNext}
                        >
                            <SkipForward className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Playlist queue */}
                    <div className="mt-4 flex gap-2 overflow-x-auto pt-2 pb-2 px-4 -mx-4">
                        {playlist.media.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setProgress(0);
                                    setElapsedTime(0);
                                }}
                                className={`flex-shrink-0 w-24 rounded overflow-hidden transition-all ${index === currentIndex
                                        ? 'ring-2 ring-primary scale-105'
                                        : 'opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <div className="relative aspect-video bg-white/10">
                                    {item.thumbnail_url ? (
                                        <img
                                            src={item.thumbnail_url}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {item.type === 'video' ? (
                                                <Film className="h-6 w-6 text-white/40" />
                                            ) : (
                                                <Image className="h-6 w-6 text-white/40" />
                                            )}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 truncate">
                                        {index + 1}. {item.title}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Keyboard shortcuts hint */}
                    <div className="text-center text-white/40 text-xs mt-2">
                        {t('playlists.keyboardHints') || 'Space: Play/Pause | Arrow keys: Navigate | Esc: Exit'}
                    </div>
                </div>
            </div>
        </>
    );
}
