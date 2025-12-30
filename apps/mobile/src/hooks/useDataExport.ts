/**
 * Data Export Hook - tRPC Integration
 *
 * Handles data export and deletion
 */

import { useState } from "react";
import { trpc } from "../lib/trpc";

export function useDataExport() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const exportQuery = trpc.dataExport.export.useQuery(undefined, {
    enabled: false, // Only run when explicitly called
  });

  const deleteMutation = trpc.dataExport.delete.useMutation();

  const exportData = async () => {
    setExporting(true);
    try {
      const data = await exportQuery.refetch();
      return JSON.stringify(data.data, null, 2);
    } finally {
      setExporting(false);
    }
  };

  const deleteAllData = async () => {
    setDeleting(true);
    try {
      await deleteMutation.mutateAsync({ confirm: true });
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return {
    exportData,
    deleteAllData,
    exporting,
    deleting: deleting || deleteMutation.isPending,
    error: exportQuery.error || deleteMutation.error,
  };
}
