'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { NotesList } from '@/components/notes/NotesList';
import { NotebooksList } from '@/components/notebooks/NotebooksList';
import { TrashView } from '@/components/trash/TrashView';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { ImportModal } from '@/components/import/ImportModal';
import { AISummaryPanel } from '@/components/ai/AISummaryPanel';
import { useAppData, useAppDataMutations } from '@/hooks/useAppData';
import { useNoteSWR, useCreateNoteSWR } from '@/hooks/useNoteSWR';
import { useNotebookActions } from '@/hooks/useNotebooks';
import { useTagActions, useTags } from '@/hooks/useTags';
import { useToggleFavorite } from '@/hooks/useNotes';
import { useAISummary } from '@/hooks/useAISummary';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function Home() {
  // State
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [showTrashView, setShowTrashView] = useState(false);
  const [mobileShowEditor, setMobileShowEditor] = useState(false);
  const [showNotebooksView, setShowNotebooksView] = useState(false);
  const [selectedNotebookInGrid, setSelectedNotebookInGrid] = useState<string | null>(null); // For notebooks view split mode
  const [trashCount, setTrashCount] = useState(0);

  // Optimized hooks with SWR caching
  // When showing notebooks view, fetch all notes (not filtered by notebook) for previews
  const { notebooks, tags, notes, loading: appDataLoading, refetch: refetchAppData } = useAppData({
    notebookId: showNotebooksView ? null : selectedNotebookId,
    tagId: selectedTagId,
    isTrash: showTrash,
  });

  const { refetchAll, optimisticUpdateNote, optimisticAddNote, optimisticAddNotebook, optimisticUpdateNotebook } = useAppDataMutations();
  const { createNotebook, deleteNotebook, loading: creatingNotebook } = useNotebookActions();
  const { deleteTag } = useTagActions();
  const { tags: allAvailableTags, refetch: refetchTags } = useTags();
  const { createNote } = useCreateNoteSWR();
  const { toggleFavorite } = useToggleFavorite();

  // AI Summary hook
  const aiSummary = useAISummary({
    onSaveAsNote: async (content, title, notebookId) => {
      // Find a notebook to create the note in
      let targetNotebookId = notebookId || selectedNotebookId;

      if (!targetNotebookId && notebooks.length > 0) {
        const defaultNotebook = notebooks.find((nb) => nb.isDefault) || notebooks[0];
        targetNotebookId = defaultNotebook?.id || null;
      }

      if (targetNotebookId) {
        await createNote({
          title,
          content,
          notebookId: targetNotebookId,
        });
        await refetchAll();
      }
    },
  });

  // Note detail with SWR
  const {
    note: selectedNote,
    loading: noteLoading,
    updateNote,
    updateNoteTags,
    deleteNote,
    restoreNote,
    refetch: refetchNote,
  } = useNoteSWR(selectedNoteId);

  // Filter notes by search query (client-side for instant results)
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.preview.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  // Memoized notes for NotesList to prevent unnecessary re-renders
  const mappedNotes = useMemo(() =>
    filteredNotes.map((n) => ({
      id: n.id,
      title: n.title,
      icon: n.icon,
      cardColor: n.cardColor,
      preview: n.preview,
      updatedAt: n.updatedAt,
      tags: n.tags,
      isTrash: n.isTrash,
      isFavorite: n.isFavorite, // For favorites filtering
      notebookId: n.notebookId, // For notebook previews
    })),
    [filteredNotes]
  );

  // Memoized notebooks for sidebar
  const notebooksWithCount = useMemo(() =>
    notebooks.map((nb) => ({
      id: nb.id,
      name: nb.name,
      icon: nb.icon,
      cardColor: nb.cardColor,
      noteCount: nb.noteCount,
      isDefault: nb.isDefault,
    })),
    [notebooks]
  );

  // Memoized tags for sidebar
  const tagsWithCount = useMemo(() =>
    tags.map((t) => ({
      id: t.id,
      name: t.name,
      noteCount: t.noteCount,
    })),
    [tags]
  );

  // Handlers
  const handleNotebookSelect = useCallback((id: string | null) => {
    setSelectedNotebookId(id);
    setSelectedTagId(null);
    setSelectedNoteId(null);
    setShowTrash(false);
    setShowTrashView(false);
    setShowNotebooksView(false); // Switch to notes view when selecting from sidebar
    setSelectedNotebookInGrid(null); // Clear grid selection to prevent blank screen
  }, []);

  const handleTagSelect = useCallback((id: string | null) => {
    setSelectedTagId(id);
    setSelectedNotebookId(null);
    setSelectedNoteId(null);
    setShowTrash(false);
    setShowTrashView(false);
    setShowNotebooksView(false); // Switch to notes view when selecting tag
    setSelectedNotebookInGrid(null); // Clear grid selection to prevent blank screen
  }, []);

  const handleNoteSelect = useCallback((id: string) => {
    // Toggle deselection: if clicking the already selected note, deselect it
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setMobileShowEditor(false);
    } else {
      setSelectedNoteId(id);
      setMobileShowEditor(true);
    }
  }, [selectedNoteId]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // AI Search Insights handler
  const handleGenerateSearchInsights = useCallback(() => {
    if (searchQuery && filteredNotes.length >= 2) {
      const noteIds = filteredNotes.map(n => n.id);
      aiSummary.generateSearchInsights(searchQuery, noteIds);
    }
  }, [searchQuery, filteredNotes, aiSummary]);

  // Notebook summarization handler
  const [summarizingNotebookId, setSummarizingNotebookId] = useState<string | null>(null);
  const handleSummarizeNotebook = useCallback((notebookId: string, notebookName: string) => {
    setSummarizingNotebookId(notebookId);
    aiSummary.summarizeNotebook(notebookId, notebookName);
  }, [aiSummary]);

  const handleNewNote = useCallback(async () => {
    // Find a notebook to create the note in
    let targetNotebookId = selectedNotebookId;

    if (!targetNotebookId && notebooks.length > 0) {
      // Use the default notebook or first available
      const defaultNotebook = notebooks.find((nb) => nb.isDefault) || notebooks[0];
      targetNotebookId = defaultNotebook?.id || null;
    }

    if (!targetNotebookId) {
      // No notebooks exist - create a default one first
      const tempNotebookId = `temp-notebook-${Date.now()}`;
      const tempNotebook = {
        id: tempNotebookId,
        name: 'My Notes',
        isDefault: true,
        noteCount: 0,
        icon: '📓',
        cardColor: '#2C2C2C',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newNotebook = await optimisticAddNotebook(tempNotebook, async () => {
        return await createNotebook({
          name: 'My Notes',
          isDefault: true,
          icon: '📓',
          cardColor: '#2C2C2C'
        });
      });

      if (newNotebook) {
        targetNotebookId = newNotebook.id;
      } else {
        return; // Failed to create notebook
      }
    }

    // Create a temporary note ID for optimistic update
    const tempNoteId = `temp-note-${Date.now()}`;
    const tempNote = {
      id: tempNoteId,
      title: 'Untitled',
      preview: '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isTrash: false,
      isFavorite: false,
      tags: [],
      notebookId: targetNotebookId,
    };

    // Show the temp note immediately
    setSelectedNoteId(tempNoteId);
    setMobileShowEditor(true);

    // Create the real note in the background
    const note = await optimisticAddNote(tempNote, async () => {
      const created = await createNote({
        title: 'Untitled',
        content: '',
        notebookId: targetNotebookId!,
      });
      return created ? {
        ...created,
        preview: created.contentPlaintext?.substring(0, 200) || '',
      } : null;
    });

    // Update selection to the real note ID
    if (note) {
      setSelectedNoteId(note.id);
    }
  }, [createNote, createNotebook, selectedNotebookId, notebooks, optimisticAddNote, optimisticAddNotebook]);

  const handleSaveNote = useCallback(async (data: { title: string; content: string }) => {
    await updateNote(data);
  }, [updateNote]);

  const handleDeleteNote = useCallback(async () => {
    const isPermanentDelete = selectedNote?.isTrash;

    // Clear the editor immediately before the delete to prevent showing trashed note state
    setSelectedNoteId(null);
    setMobileShowEditor(false);

    if (isPermanentDelete) {
      await deleteNote(true); // Permanent delete
      // Decrement trash count
      setTrashCount(prev => Math.max(0, prev - 1));
    } else {
      await deleteNote(false); // Move to trash
      // Increment trash count
      setTrashCount(prev => prev + 1);
    }
  }, [deleteNote, selectedNote]);

  const handleRestoreNote = useCallback(async () => {
    await restoreNote();
    setSelectedNoteId(null);
    setMobileShowEditor(false);
    // Decrement trash count
    setTrashCount(prev => Math.max(0, prev - 1));
  }, [restoreNote]);

  const handleImportComplete = useCallback(async () => {
    await refetchAll();
  }, [refetchAll]);

  const handleCreateNotebook = useCallback(async () => {
    if (!newNotebookName.trim()) return;

    const tempNotebookId = `temp-notebook-${Date.now()}`;
    const tempNotebook = {
      id: tempNotebookId,
      name: newNotebookName.trim(),
      isDefault: false,
      noteCount: 0,
      icon: null,
      cardColor: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Close modal and clear input immediately for responsiveness
    const notebookName = newNotebookName.trim();
    setNewNotebookName('');
    setShowNewNotebookModal(false);
    setSelectedNotebookId(tempNotebookId); // Optimistically select temp notebook

    const notebook = await optimisticAddNotebook(tempNotebook, async () => {
      return await createNotebook({ name: notebookName });
    });

    // Update selection to the real notebook ID
    if (notebook) {
      setSelectedNotebookId(notebook.id);
    }
  }, [createNotebook, newNotebookName, optimisticAddNotebook]);

  const handleMobileBack = useCallback(() => {
    setMobileShowEditor(false);
  }, []);

  // Handle trash view click from sidebar
  const handleTrashClick = useCallback(() => {
    setShowTrashView(true);
    setShowNotebooksView(false);
    setSelectedNotebookId(null);
    setSelectedTagId(null);
    setSelectedNoteId(null);
    setSelectedNotebookInGrid(null); // Clear grid selection to prevent blank screen
    setShowTrash(true); // This filters to only show trash notes
    setMobileShowEditor(false);
  }, []);

  // Handle close trash view
  const handleCloseTrashView = useCallback(() => {
    setShowTrashView(false);
    setShowTrash(false);
  }, []);

  // Handle empty trash (delete all trashed notes)
  const handleEmptyTrash = useCallback(async () => {
    try {
      const response = await fetch('/api/notes/trash/clear', {
        method: 'DELETE',
      });
      if (response.ok) {
        await refetchAppData();
        // Immediately update trash count
        setTrashCount(0);
      }
    } catch (error) {
      console.error('Failed to empty trash:', error);
    }
  }, [refetchAppData]);

  // Handle restore note from trash view
  const handleRestoreFromTrash = useCallback(async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrash: false }),
      });
      if (response.ok) {
        await refetchAppData();
        // Decrement trash count immediately
        setTrashCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to restore note:', error);
    }
  }, [refetchAppData]);

  // Handle permanent delete from trash view
  const handleDeleteFromTrash = useCallback(async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}?permanent=true`, {
        method: 'DELETE',
      });
      if (response.ok) {
        // Clear selectedNoteId if the deleted note was selected
        // This prevents SWR from trying to fetch a deleted note
        if (selectedNoteId === noteId) {
          setSelectedNoteId(null);
        }
        await refetchAppData();
        // Decrement trash count immediately
        setTrashCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete note permanently:', error);
    }
  }, [refetchAppData, selectedNoteId]);

  // Fetch trash count - as a reusable callback
  const fetchTrashCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notes?isTrash=true');
      if (response.ok) {
        const data = await response.json();
        // Use pagination.total for accurate count (notes.length is limited by page size)
        setTrashCount(data.pagination?.total ?? data.notes?.length ?? 0);
      }
    } catch (error) {
      console.error('Failed to fetch trash count:', error);
    }
  }, []);

  // Fetch trash count on initial load and when notes change
  useEffect(() => {
    fetchTrashCount();
  }, [notes, fetchTrashCount]);

  // Note: We no longer auto-select the first note to allow full panel view by default

  // Handle notebook icon change (optimistic)
  const handleNotebookIconChange = useCallback(async (id: string, icon: string | null) => {
    try {
      await optimisticUpdateNotebook(id, { icon }, async () => {
        await fetch(`/api/notebooks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icon }),
        });
      });
    } catch (error) {
      console.error('Failed to update notebook icon:', error);
    }
  }, [optimisticUpdateNotebook]);


  // Handle note icon change (optimistic)
  const handleNoteIconChange = useCallback(async (noteId: string, icon: string | null) => {
    try {
      await optimisticUpdateNote(noteId, { icon }, async () => {
        await fetch(`/api/notes/${noteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icon }),
        });
      });
      await refetchNote(); // Also refresh the selected note to update the icon in the editor
    } catch (error) {
      console.error('Failed to update note icon:', error);
    }
  }, [optimisticUpdateNote, refetchNote]);

  // Handle note card color change (optimistic)
  const handleNoteColorChange = useCallback(async (noteId: string, cardColor: string | null) => {
    try {
      await optimisticUpdateNote(noteId, { cardColor }, async () => {
        await fetch(`/api/notes/${noteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardColor }),
        });
      });
    } catch (error) {
      console.error('Failed to update note card color:', error);
    }
  }, [optimisticUpdateNote]);

  // Handle note favorite toggle (optimistic)
  const handleToggleFavorite = useCallback(async (noteId: string) => {
    try {
      // Find the note to get its current favorite status
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      const newFavoriteStatus = !note.isFavorite;
      await optimisticUpdateNote(noteId, { isFavorite: newFavoriteStatus }, async () => {
        await toggleFavorite(noteId, newFavoriteStatus);
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [notes, toggleFavorite, optimisticUpdateNote]);

  // Handle notebook card color change (optimistic)
  const handleNotebookColorChange = useCallback(async (notebookId: string, cardColor: string | null) => {
    try {
      await optimisticUpdateNotebook(notebookId, { cardColor }, async () => {
        await fetch(`/api/notebooks/${notebookId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardColor }),
        });
      });
    } catch (error) {
      console.error('Failed to update notebook card color:', error);
    }
  }, [optimisticUpdateNotebook]);

  // Handle notebook delete
  const handleNotebookDelete = useCallback(async (notebookId: string) => {
    const success = await deleteNotebook(notebookId);
    if (success) {
      // If we deleted the currently selected notebook, clear selection
      if (selectedNotebookId === notebookId) {
        setSelectedNotebookId(null);
      }
      await refetchAppData();
    }
  }, [deleteNotebook, selectedNotebookId, refetchAppData]);

  // Handle notebooks view toggle from sidebar
  const handleNotebooksViewToggle = useCallback(() => {
    setShowNotebooksView((prev) => !prev);
    setShowTrashView(false);
    setShowTrash(false);
    // When switching to notebooks view, clear note selection and notebook grid selection
    if (!showNotebooksView) {
      setSelectedNoteId(null);
      setSelectedNotebookInGrid(null);
      setMobileShowEditor(false);
    }
  }, [showNotebooksView]);

  // Handle "All Notes" click from sidebar - show all notes
  const handleAllNotesClick = useCallback(() => {
    setSelectedNotebookId(null);
    setSelectedTagId(null);
    setSelectedNoteId(null);
    setShowTrash(false);
    setShowTrashView(false);
    setShowNotebooksView(false); // Always switch to notes view
    setSelectedNotebookInGrid(null); // Clear grid selection to prevent blank screen
    setMobileShowEditor(false);
  }, []);

  // Handle notebook selection from notebooks grid view with toggle deselect
  const handleNotebookSelectFromGrid = useCallback((id: string | null) => {
    // Toggle deselection: if clicking the already selected notebook, deselect it
    if (selectedNotebookInGrid === id) {
      setSelectedNotebookInGrid(null);
      setSelectedNotebookId(null);
      setSelectedNoteId(null);
    } else {
      setSelectedNotebookInGrid(id);
      setSelectedNotebookId(id);
      setSelectedTagId(null);
      setSelectedNoteId(null);
      setShowTrash(false);
      setShowTrashView(false);
    }
  }, [selectedNotebookInGrid]);

  return (
    <AppLayout
      notebooks={notebooksWithCount}
      tags={tagsWithCount}
      selectedNotebookId={selectedNotebookId}
      selectedTagId={selectedTagId}
      onNotebookSelect={handleNotebookSelect}
      onTagSelect={handleTagSelect}
      onNewNotebook={() => setShowNewNotebookModal(true)}
      onNotebookIconChange={handleNotebookIconChange}
      onNotebooksViewToggle={handleNotebooksViewToggle}
      onAllNotesClick={handleAllNotesClick}
      onImportClick={() => setShowImportModal(true)}
      onSearch={handleSearch}
      onTagDelete={async (tagId) => {
        const success = await deleteTag(tagId);
        if (success) {
          // Clear selection if the deleted tag was selected
          if (selectedTagId === tagId) {
            setSelectedTagId(null);
          }
          // Refetch to update tag counts
          await refetchAppData();
          // Refetch tags for the tags filter sub-row
          await refetchTags();
        }
      }}
      onTrashClick={handleTrashClick}
      trashCount={trashCount}
      showNotebooksView={showNotebooksView}
    >
      {/* Trash View - Full page view replacing notes list and editor */}
      {showTrashView ? (
        <div className="flex-1 min-w-0">
          <TrashView
            trashedNotes={mappedNotes.map(n => ({
              ...n,
              trashedAt: new Date().toISOString(),
            }))}
            loading={appDataLoading}
            onNoteSelect={handleNoteSelect}
            onNoteRestore={handleRestoreFromTrash}
            onNoteDelete={handleDeleteFromTrash}
            onEmptyTrash={handleEmptyTrash}
            onClose={handleCloseTrashView}
          />
        </div>
      ) : (
        <>
          {/* Notes List or Notebooks Grid */}
          {/* Hide on mobile when editor is showing, always show on desktop */}
          {/* In full panel mode (no note selected), takes full width */}
          {/* Hide notebooks list when a notebook is selected in grid view */}
          {!selectedNotebookInGrid && (
            <div className={`${mobileShowEditor ? 'hidden' : 'flex'} md:flex w-full md:w-auto ${(!selectedNoteId && !showNotebooksView) || (showNotebooksView && !selectedNotebookInGrid) ? 'flex-1' : ''}`}>
              {showNotebooksView ? (
                <NotebooksList
                  notebooks={notebooksWithCount}
                  notes={mappedNotes}
                  selectedNotebookId={selectedNotebookInGrid}
                  onNotebookSelect={handleNotebookSelectFromGrid}
                  onNotebookColorChange={handleNotebookColorChange}
                  onNotebookDelete={handleNotebookDelete}
                  onSummarizeNotebook={handleSummarizeNotebook}
                  isSummarizing={aiSummary.isLoading && aiSummary.summaryType === 'notebook'}
                  summarizingNotebookId={summarizingNotebookId}
                  onNewNotebook={() => setShowNewNotebookModal(true)}
                  loading={appDataLoading}
                  fullPanel={!selectedNotebookInGrid}
                />
              ) : (
                <NotesList
                  notes={mappedNotes}
                  selectedNoteId={selectedNoteId}
                  onNoteSelect={handleNoteSelect}
                  onNewNote={handleNewNote}
                  onNoteColorChange={handleNoteColorChange}
                  onToggleFavorite={handleToggleFavorite}
                  loading={appDataLoading}
                  fullPanel={!selectedNoteId}
                  searchQuery={searchQuery}
                  onGenerateSearchInsights={handleGenerateSearchInsights}
                  isGeneratingInsights={aiSummary.isLoading && aiSummary.summaryType === 'search'}
                  emptyMessage={
                    showTrash
                      ? 'Trash is empty'
                      : selectedNotebookId
                        ? 'No notes in this notebook'
                        : selectedTagId
                          ? 'No notes with this tag'
                          : 'No notes yet'
                  }
                  notebookName={selectedNotebookId ? notebooksWithCount.find(nb => nb.id === selectedNotebookId)?.name : undefined}
                  notebookId={selectedNotebookId || undefined}
                  onBack={selectedNotebookId ? () => setSelectedNotebookId(null) : undefined}
                  onSummarizeNotebook={handleSummarizeNotebook}
                  isSummarizingNotebook={aiSummary.isLoading && aiSummary.summaryType === 'notebook' && summarizingNotebookId === selectedNotebookId}
                  allTags={allAvailableTags}
                />
              )}
            </div>
          )}

          {/* Notes List for Selected Notebook - Only show when a notebook is selected in notebooks view */}
          {showNotebooksView && selectedNotebookInGrid && (
            <div className={`${mobileShowEditor ? 'hidden' : 'flex'} md:flex flex-1 min-w-0`}>
              <NotesList
                notes={mappedNotes}
                selectedNoteId={selectedNoteId}
                onNoteSelect={handleNoteSelect}
                onNewNote={handleNewNote}
                onNoteColorChange={handleNoteColorChange}
                onToggleFavorite={handleToggleFavorite}
                loading={appDataLoading}
                fullPanel={!selectedNoteId}
                emptyMessage="No notes in this notebook"
                notebookName={notebooksWithCount.find(nb => nb.id === selectedNotebookInGrid)?.name}
                notebookId={selectedNotebookInGrid}
                onBack={() => setSelectedNotebookInGrid(null)}
                onSummarizeNotebook={handleSummarizeNotebook}
                isSummarizingNotebook={aiSummary.isLoading && aiSummary.summaryType === 'notebook' && summarizingNotebookId === selectedNotebookInGrid}
                allTags={allAvailableTags}
              />
            </div>
          )}

          {/* Note Editor - Only show when a note is selected */}
          {selectedNoteId && (
            <div className={`${mobileShowEditor ? 'flex' : 'hidden'} md:flex flex-1 min-w-0`}>
              <NoteEditor
                note={selectedNote}
                loading={noteLoading}
                saving={false}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
                onRestore={handleRestoreNote}
                onIconChange={handleNoteIconChange}
                onTagsChange={(_noteId, tags) => updateNoteTags(tags)}
                onBack={handleMobileBack}
                showBackButton={mobileShowEditor}
                onSummarize={selectedNote ? () => aiSummary.summarizeNote(selectedNote.id, selectedNote.title) : undefined}
                isSummarizing={aiSummary.isLoading && aiSummary.summaryType === 'note'}
              />
            </div>
          )}
        </>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />

      {/* New Notebook Modal */}
      <Modal
        isOpen={showNewNotebookModal}
        onClose={() => setShowNewNotebookModal(false)}
        title="New Notebook"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Notebook Name"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            placeholder="My Notebook"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowNewNotebookModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateNotebook}
              disabled={!newNotebookName.trim() || creatingNotebook}
              isLoading={creatingNotebook}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Summary Panel */}
      <AISummaryPanel
        isOpen={aiSummary.isOpen}
        onClose={aiSummary.closePanel}
        type={aiSummary.summaryType}
        title={aiSummary.summaryTitle}
        data={aiSummary.data}
        isLoading={aiSummary.isLoading}
        error={aiSummary.error}
        onRetry={aiSummary.retry}
        onSaveAsNote={() => aiSummary.saveAsNote()}
      />
    </AppLayout>
  );
}
