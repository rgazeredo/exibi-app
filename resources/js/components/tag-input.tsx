import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useT } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { Check, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color: string;
}

interface TagInputProps {
    value: Tag[];
    onChange: (tags: Tag[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    allowCreate?: boolean;
}

export function TagInput({
    value,
    onChange,
    placeholder,
    disabled = false,
    className,
    allowCreate = true,
}: TagInputProps) {
    const { t } = useT();
    const [open, setOpen] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    const displayPlaceholder = placeholder ?? t('tags.selectTags');

    // Fetch tags from API
    const fetchTags = useCallback(async (searchTerm = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);

            const { data } = await axios.get(`/api/tags?${params.toString()}`);
            setAvailableTags(data);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load tags on mount
    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTags(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchTags]);

    const toggleTag = (tag: Tag) => {
        const isSelected = value.some((t) => t.id === tag.id);
        if (isSelected) {
            onChange(value.filter((t) => t.id !== tag.id));
        } else {
            onChange([...value, tag]);
        }
        // Fechar o dropdown após selecionar
        setOpen(false);
    };

    const removeTag = (tagId: string) => {
        onChange(value.filter((t) => t.id !== tagId));
    };

    const createTag = async (name: string) => {
        if (!name.trim() || creating) return;

        setCreating(true);
        try {
            const { data: newTag } = await axios.post<Tag>('/api/tags', { name: name.trim() });
            // Add the new tag to selected tags
            onChange([...value, newTag]);
            // Clear search and refresh available tags
            setSearch('');
            fetchTags();
            // Fechar o dropdown após criar
            setOpen(false);
        } catch (error) {
            console.error('Failed to create tag:', error);
        } finally {
            setCreating(false);
        }
    };

    // Filter out already selected tags from the list
    const unselectedTags = availableTags.filter((tag) => !value.some((v) => v.id === tag.id));

    // Check if we should show "Create tag" option
    const trimmedSearch = search.trim();
    const exactMatchExists =
        trimmedSearch &&
        availableTags.some((tag) => tag.name.toLowerCase() === trimmedSearch.toLowerCase());
    const alreadySelected =
        trimmedSearch &&
        value.some((tag) => tag.name.toLowerCase() === trimmedSearch.toLowerCase());
    const showCreateOption = allowCreate && trimmedSearch && !exactMatchExists && !alreadySelected;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {/* Tag selector */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between"
                        disabled={disabled}
                    >
                        {displayPlaceholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={t('tags.searchOrCreate')}
                            value={search}
                            onValueChange={setSearch}
                        />
                        <CommandList>
                            {!loading && unselectedTags.length === 0 && !showCreateOption && (
                                <CommandEmpty>{t('tags.noTagsFoundInput')}</CommandEmpty>
                            )}
                            {loading && unselectedTags.length === 0 && !showCreateOption && (
                                <CommandEmpty>{t('tags.loading')}</CommandEmpty>
                            )}

                            {/* Create new tag option */}
                            {showCreateOption && (
                                <CommandGroup heading={t('tags.createNew')}>
                                    <CommandItem
                                        value={`create-${trimmedSearch}`}
                                        onSelect={() => createTag(trimmedSearch)}
                                        disabled={creating}
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            {creating ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Plus className="h-4 w-4" />
                                            )}
                                            <span>
                                                {t('tags.create', { name: trimmedSearch })}
                                            </span>
                                        </div>
                                    </CommandItem>
                                </CommandGroup>
                            )}

                            {/* Existing tags */}
                            {unselectedTags.length > 0 && (
                                <CommandGroup heading={showCreateOption ? t('tags.existingTags') : undefined}>
                                    {unselectedTags.map((tag) => (
                                        <CommandItem
                                            key={tag.id}
                                            value={tag.id}
                                            onSelect={() => toggleTag(tag)}
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: tag.color }}
                                                />
                                                <span>{tag.name}</span>
                                            </div>
                                            <Check
                                                className={cn(
                                                    'h-4 w-4',
                                                    value.some((t) => t.id === tag.id) ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected tags */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((tag) => (
                        <Badge
                            key={tag.id}
                            style={{ backgroundColor: tag.color, color: '#fff' }}
                            className="pr-1 gap-1"
                        >
                            {tag.name}
                            <button
                                type="button"
                                onClick={() => removeTag(tag.id)}
                                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                                disabled={disabled}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

// Display-only component for showing tags
interface TagBadgesProps {
    tags: Tag[];
    className?: string;
}

export function TagBadges({ tags, className }: TagBadgesProps) {
    if (tags.length === 0) return null;

    return (
        <div className={cn('flex flex-wrap gap-1', className)}>
            {tags.map((tag) => (
                <Badge
                    key={tag.id}
                    style={{ backgroundColor: tag.color, color: '#fff' }}
                    className="text-xs"
                >
                    {tag.name}
                </Badge>
            ))}
        </div>
    );
}
