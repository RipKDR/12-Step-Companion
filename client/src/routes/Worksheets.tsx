import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { loadWorksheetTemplate, getAvailableWorksheets } from '@/lib/contentLoader';
import { useAppStore } from '@/store/useAppStore';
import type { WorksheetTemplate } from '@/types';

export default function Worksheets() {
  const [worksheets, setWorksheets] = useState<Array<{
    id: string;
    template: WorksheetTemplate | null;
    completed: number;
    total: number;
  }>>([]);
  
  const getWorksheetResponses = useAppStore((state) => state.getWorksheetResponses);

  // Load worksheet templates on mount
  useEffect(() => {
    const worksheetIds = getAvailableWorksheets();
    
    Promise.all(
      worksheetIds.map(async (id) => {
        const template = await loadWorksheetTemplate(id);
        const responses = getWorksheetResponses(id);
        
        return {
          id,
          template,
          completed: responses.length,
          total: template?.fields.filter(f => f.required).length || 0,
        };
      })
    ).then(setWorksheets);
  }, [getWorksheetResponses]);

  const handleOpen = (id: string) => {
    console.log('Open worksheet:', id);
    // TODO: Implement worksheet form dialog
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">Worksheets</h1>
        <p className="text-muted-foreground">
          Structured exercises to support your recovery
        </p>
      </header>

      {worksheets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Loading worksheets...</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {worksheets.map((worksheet) => {
          if (!worksheet.template) {
            return (
              <Card key={worksheet.id} className="opacity-50">
                <CardHeader>
                  <CardTitle>Worksheet not available</CardTitle>
                  <CardDescription>Template file missing for {worksheet.id}</CardDescription>
                </CardHeader>
              </Card>
            );
          }

          const progress = worksheet.total > 0 ? (worksheet.completed / worksheet.total) * 100 : 0;

          return (
            <Card
              key={worksheet.id}
              className="cursor-pointer hover-elevate active-elevate-2 transition-all"
              onClick={() => handleOpen(worksheet.id)}
              data-testid={`worksheet-${worksheet.id}`}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>{worksheet.template.title}</CardTitle>
                  </div>
                  <CardDescription>{worksheet.template.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Responses</span>
                    <span>{worksheet.completed}</span>
                  </div>
                  {worksheet.completed > 0 && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                {worksheet.completed === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(worksheet.id);
                    }}
                  >
                    Start Worksheet
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
