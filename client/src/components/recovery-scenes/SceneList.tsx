import React, { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Edit, Trash2, Play, Filter } from 'lucide-react';
import type { RecoveryScene } from '@/types';
import { SceneEditor } from './SceneEditor';
import { ScenePlaybook } from './ScenePlaybook';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SceneListProps {
  onSceneSelect?: (sceneId: string) => void;
  onCreateNew?: () => void;
}

export function SceneList({ onSceneSelect, onCreateNew }: SceneListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingScene, setEditingScene] = useState<RecoveryScene | null>(null);
  const [deletingSceneId, setDeletingSceneId] = useState<string | null>(null);
  const [activatingSceneId, setActivatingSceneId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const getAllRecoveryScenes = useAppStore((state) => state.getAllRecoveryScenes);
  const getActiveRecoveryScenes = useAppStore((state) => state.getActiveRecoveryScenes);
  const deleteRecoveryScene = useAppStore((state) => state.deleteRecoveryScene);
  const activateScene = useAppStore((state) => state.activateScene);

  // Get scene lists (these are already memoized in the store)
  const allScenes = getAllRecoveryScenes();
  const activeScenes = getActiveRecoveryScenes();

  // Memoize filtered scenes to avoid recalculating on every render
  const filteredScenes = useMemo(() => {
    return allScenes.filter((scene) => {
      // Filter by active/inactive
      if (filter === 'active' && !scene.active) return false;
      if (filter === 'inactive' && scene.active) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          scene.label.toLowerCase().includes(query) ||
          scene.description?.toLowerCase().includes(query) ||
          scene.triggers.some((t) => t.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [allScenes, filter, searchQuery]);

  const handleDelete = useCallback((sceneId: string) => {
    deleteRecoveryScene(sceneId);
    setDeletingSceneId(null);
  }, [deleteRecoveryScene]);

  const handleActivate = useCallback((sceneId: string) => {
    try {
      activateScene(sceneId, 'manual');
      setActivatingSceneId(sceneId);
    } catch (error) {
      console.error('Failed to activate scene:', error);
      // Could add toast notification here
    }
  }, [activateScene]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recovery Scenes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Situation-specific playbooks for high-risk moments
          </p>
        </div>
        <Button 
          onClick={() => {
            if (onCreateNew) {
              onCreateNew();
            } else {
              setShowCreateDialog(true);
            }
          }} 
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Scene
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scenes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({allScenes.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeScenes.length})</TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({allScenes.length - activeScenes.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Scene Cards */}
      {filteredScenes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No scenes match your search.'
                : filter === 'active'
                  ? 'No active scenes. Create one to get started!'
                  : 'No scenes yet. Create your first recovery scene!'}
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => {
                  if (onCreateNew) {
                    onCreateNew();
                  } else {
                    setShowCreateDialog(true);
                  }
                }} 
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Scene
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredScenes.map((scene) => (
            <Card key={scene.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{scene.label}</CardTitle>
                      {scene.active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {scene.description && (
                      <CardDescription className="mt-1">{scene.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Triggers */}
                  {scene.triggers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Triggers:</p>
                      <div className="flex flex-wrap gap-1">
                        {scene.triggers.map((trigger, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions count */}
                  <div className="text-sm text-muted-foreground">
                    {scene.actions.length} action{scene.actions.length !== 1 ? 's' : ''} • Used{' '}
                    {scene.usageCount} time{scene.usageCount !== 1 ? 's' : ''}
                    {scene.lastUsedISO && (
                      <> • Last used {new Date(scene.lastUsedISO).toLocaleDateString()}</>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleActivate(scene.id)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Use Scene
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingScene(scene)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingSceneId(scene.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingScene && (
        <SceneEditor
          scene={editingScene}
          open={!!editingScene}
          onOpenChange={(open) => !open && setEditingScene(null)}
        />
      )}

      {/* Create Dialog */}
      <SceneEditor
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Activate Dialog */}
      {activatingSceneId && (
        <ScenePlaybook
          sceneId={activatingSceneId}
          open={!!activatingSceneId}
          onOpenChange={(open) => !open && setActivatingSceneId(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSceneId} onOpenChange={(open) => !open && setDeletingSceneId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recovery Scene?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scene and all its usage history. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSceneId && handleDelete(deletingSceneId)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

