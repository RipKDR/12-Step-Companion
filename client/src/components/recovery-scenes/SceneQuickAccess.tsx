import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Play, Clock, Sparkles } from 'lucide-react';
import { ScenePlaybook } from './ScenePlaybook';
import { SceneEditor } from './SceneEditor';
import type { RecoveryScene } from '@/types';

interface SceneQuickAccessProps {
  variant?: 'button' | 'fab';
}

export function SceneQuickAccess({ variant = 'fab' }: SceneQuickAccessProps) {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const getActiveRecoveryScenes = useAppStore((state) => state.getActiveRecoveryScenes);
  const getScenesForTime = useAppStore((state) => state.getScenesForTime);
  const activateScene = useAppStore((state) => state.activateScene);

  // Get scene lists
  const allScenes = getActiveRecoveryScenes();
  const suggestedScenes = getScenesForTime(new Date());

  const handleSceneSelect = React.useCallback((sceneId: string) => {
    try {
      activateScene(sceneId, 'manual');
      setSelectedSceneId(sceneId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to activate scene:', error);
      // Could add toast notification here if needed
    }
  }, [activateScene]);

  const triggerButton = (
    <Button
      size={variant === 'fab' ? 'lg' : 'default'}
      className={variant === 'fab' ? 'fixed bottom-24 right-4 z-50 rounded-full shadow-lg' : ''}
    >
      <Sparkles className="h-5 w-5 mr-2" />
      I'm in a scene
    </Button>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Recovery Scenes</SheetTitle>
            <SheetDescription>
              Select a scene that matches your current situation
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 overflow-y-auto">
            {/* Suggested Scenes */}
            {suggestedScenes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Suggested for Right Now</h3>
                </div>
                <div className="space-y-2">
                  {suggestedScenes.map((scene) => (
                    <Card
                      key={scene.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSceneSelect(scene.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{scene.label}</CardTitle>
                          <Badge variant="default">Suggested</Badge>
                        </div>
                        {scene.description && (
                          <CardDescription className="text-sm">{scene.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {scene.triggers.slice(0, 3).map((trigger, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                        <Button variant="default" size="sm" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Use This Scene
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Active Scenes */}
            {allScenes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">All Active Scenes</h3>
                <div className="space-y-2">
                  {allScenes
                    .filter((scene) => !suggestedScenes.find((s) => s.id === scene.id))
                    .map((scene) => (
                      <Card
                        key={scene.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSceneSelect(scene.id)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{scene.label}</CardTitle>
                          {scene.description && (
                            <CardDescription className="text-sm">{scene.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {scene.triggers.slice(0, 3).map((trigger, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {scene.actions.length} action{scene.actions.length !== 1 ? 's' : ''} • Used{' '}
                            {scene.usageCount} time{scene.usageCount !== 1 ? 's' : ''}
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            Use This Scene
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {allScenes.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No active scenes yet. Create your first recovery scene to get started!
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      setShowEditor(true);
                    }}
                  >
                    Create Scene
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Scene Playbook */}
      {selectedSceneId && (
        <ScenePlaybook
          sceneId={selectedSceneId}
          open={!!selectedSceneId}
          onOpenChange={(open) => !open && setSelectedSceneId(null)}
        />
      )}

      {/* Scene Editor */}
      <SceneEditor
        open={showEditor}
        onOpenChange={setShowEditor}
      />
    </>
  );
}

