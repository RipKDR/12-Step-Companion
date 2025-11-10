import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, CheckCircle2 } from 'lucide-react';
import { loadWorksheetTemplate, getAvailableWorksheets } from '@/lib/contentLoader';
import { useAppStore } from '@/store/useAppStore';
import { useToast } from '@/hooks/use-toast';
import type { WorksheetTemplate, WorksheetField } from '@/types';

export default function Worksheets() {
  const [worksheetTemplates, setWorksheetTemplates] = useState<Array<{
    id: string;
    template: WorksheetTemplate | null;
  }>>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<WorksheetTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const worksheetResponsesMap = useAppStore((state) => state.worksheetResponses);
  const saveWorksheetResponse = useAppStore((state) => state.saveWorksheetResponse);
  const { toast } = useToast();

  useEffect(() => {
    loadWorksheetTemplates();
  }, []);

  const loadWorksheetTemplates = async () => {
    const worksheetIds = getAvailableWorksheets();
    
    const templateData = await Promise.all(
      worksheetIds.map(async (id) => {
        const template = await loadWorksheetTemplate(id);
        return {
          id,
          template,
        };
      })
    );
    
    setWorksheetTemplates(templateData);
  };

  const getWorksheetData = (id: string, template: WorksheetTemplate | null) => {
    const responses = Object.values(worksheetResponsesMap).filter(r => r.templateId === id);
    return {
      id,
      template,
      completed: responses.length,
      total: template?.fields.filter(f => f.required).length || 0,
    };
  };

  const handleOpen = (id: string) => {
    const worksheet = worksheetTemplates.find(w => w.id === id);
    if (worksheet?.template) {
      setSelectedWorksheet(worksheet.template);
      setFormData({});
      setIsDialogOpen(true);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedWorksheet(null);
    setFormData({});
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!selectedWorksheet) return false;

    const requiredFields = selectedWorksheet.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => {
      const value = formData[f.id];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm() || !selectedWorksheet) return;

    saveWorksheetResponse({
      templateId: selectedWorksheet.id,
      responses: formData,
    });

    toast({
      title: 'Response saved',
      description: 'Your worksheet response has been recorded.',
    });

    handleClose();
  };

  const renderField = (field: WorksheetField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.help}
            data-testid={`input-${field.id}`}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.help}
            className="min-h-24 resize-y"
            data-testid={`textarea-${field.id}`}
          />
        );

      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.help}
            data-testid={`number-${field.id}`}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger data-testid={`select-${field.id}`}>
              <SelectValue placeholder={field.help || 'Select an option'} />
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

      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 pb-8 sm:pb-12 pt-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-worksheets-title">
            Worksheets
          </h1>
          <p className="text-base text-muted-foreground">
            Structured exercises to support your recovery
          </p>
        </header>

        <div className="space-y-6">

          {worksheetTemplates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Loading worksheets...</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {worksheetTemplates.map((worksheet) => {
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

            const data = getWorksheetData(worksheet.id, worksheet.template);
            const progress = data.total > 0 ? (data.completed / data.total) * 100 : 0;

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
                      <span>Saved Responses</span>
                      <span>{data.completed}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(worksheet.id);
                    }}
                    data-testid={`button-start-${worksheet.id}`}
                  >
                    {data.completed === 0 ? 'Complete This Worksheet' : 'Add New Response'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedWorksheet?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedWorksheet?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedWorksheet?.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="flex items-center gap-2">
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                {field.help && !field.required && (
                  <p className="text-sm text-muted-foreground">{field.help}</p>
                )}
                {renderField(field)}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel-worksheet"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2"
              data-testid="button-save-worksheet"
            >
              <Save className="h-4 w-4" />
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
