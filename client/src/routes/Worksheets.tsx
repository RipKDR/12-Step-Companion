import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function Worksheets() {
  // TODO: Replace with actual worksheet templates from JSON files
  const mockWorksheets = [
    {
      id: 'triggers',
      title: 'Triggers & Cravings',
      description: 'Identify and understand your triggers',
      completed: 3,
      total: 10,
    },
    {
      id: 'halt',
      title: 'HALT Check-In',
      description: 'Hungry, Angry, Lonely, Tired assessment',
      completed: 0,
      total: 5,
    },
    {
      id: 'resentment',
      title: 'Resentment Inventory',
      description: 'Work through resentments and find freedom',
      completed: 0,
      total: 8,
    },
    {
      id: 'amends',
      title: 'Amends Planning',
      description: 'Plan and track your amends process',
      completed: 0,
      total: 12,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">Worksheets</h1>
        <p className="text-muted-foreground">
          Structured exercises to support your recovery
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {mockWorksheets.map((worksheet) => {
          const progress = worksheet.total > 0 ? (worksheet.completed / worksheet.total) * 100 : 0;

          return (
            <Card
              key={worksheet.id}
              className="cursor-pointer hover-elevate active-elevate-2 transition-all"
              onClick={() => console.log('Open worksheet:', worksheet.id)}
              data-testid={`worksheet-${worksheet.id}`}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>{worksheet.title}</CardTitle>
                  </div>
                  <CardDescription>{worksheet.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {worksheet.completed} / {worksheet.total}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                {worksheet.completed === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Start worksheet:', worksheet.id);
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
