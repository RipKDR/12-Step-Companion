import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { WorksheetTemplate, WorksheetField } from '@/types';
import { useToast } from '@/hooks/use-toast';

const WORKSHEET_IDS = ['triggers', 'halt'];

export default function Worksheets() {
  const [templates, setTemplates] = useState<WorksheetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WorksheetTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const getWorksheetResponses = useAppStore((state) => state.getWorksheetResponses);
  const saveWorksheetResponse = useAppStore((state) => state.saveWorksheetResponse);
  const { toast } = useToast();

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const loaded = await Promise.all(
          WORKSHEET_IDS.map(async (id) => {
            const response = await fetch(`/content/worksheets/${id}.json`);
            if (!response.ok) return null;
            return await response.json();
          })
        );
        setTemplates(loaded.filter((t): t is WorksheetTemplate => t !== null));
      } catch (error) {
        console.error('Failed to load worksheets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const openWorksheet = (template: WorksheetTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    setDialogOpen(true);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    if (!selectedTemplate) return;

    const requiredFields = selectedTemplate.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.id]);

    if (missingFields.length > 0) {
      toast({
        title: 'Required fields missing',
        description: `Please complete all required fields.`,
        variant: 'destructive',
      });
      return;
    }

    saveWorksheetResponse({
      templateId: selectedTemplate.id,
      responses: formData,
    });

    toast({
      title: 'Response saved',
      description: 'Your worksheet response has been saved.',
    });

    setDialogOpen(false);
    setFormData({});
  };

  const renderField = (field: WorksheetField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.help}
            data-testid={`field-${field.id}`}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.help}
            className="min-h-24"
            data-testid={`field-${field.id}`}
          />
        );
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger data-testid={`field-${field.id}`}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.help}
            min="1"
            max="10"
            data-testid={`field-${field.id}`}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading worksheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-2">Worksheets</h1>
        <p className="text-muted-foreground">
          Structured exercises to support your recovery
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => {
          const responses = getWorksheetResponses(template.id);
          const completed = responses.length;

          return (
            <Card
              key={template.id}
              className="cursor-pointer hover-elevate active-elevate-2 transition-all"
              onClick={() => openWorksheet(template)}
              data-testid={`worksheet-${template.id}`}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>{template.title}</CardTitle>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Completed</span>
                    <span>{completed} time{completed !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    openWorksheet(template);
                  }}
                  data-testid={`button-start-${template.id}`}
                >
                  {completed > 0 ? 'Complete Again' : 'Start Worksheet'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-worksheet">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedTemplate?.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
                {field.help && (
                  <p className="text-xs text-muted-foreground">{field.help}</p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save">
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
