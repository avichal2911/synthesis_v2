'use client';

import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Upload, File, Trash2, Loader } from 'lucide-react';

interface Document {
  id: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
}

interface DocumentUploadProps {
  projectId: string;
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
}

export function DocumentUpload({
  projectId,
  documents,
  onDocumentsChange,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    setError(null);
    setUploading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('Not authenticated');
        return;
      }

      const file = files[0];

      // Validate file is PDF
      if (!file.type.includes('pdf')) {
        setError('Only PDF files are supported');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        // 50MB limit
        setError('File size must be less than 50MB');
        return;
      }

      // Upload to Supabase Storage
      const filePath = `${session.user.id}/${projectId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record in database
      const { data, error: dbError } = await supabase
        .from('documents')
        .insert([
          {
            project_id: projectId,
            user_id: session.user.id,
            file_name: file.name,
            file_size: file.size,
            file_path: filePath,
            content_text: null, // Will be populated by backend processing
          },
        ])
        .select();

      if (dbError) throw dbError;

      if (data) {
        onDocumentsChange([...documents, data[0]]);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload document';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, filePath: string) => {
    setDeleting(docId);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (dbError) throw dbError;

      onDocumentsChange(documents.filter((d) => d.id !== docId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      setError(message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Documents</h3>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg border border-red-500/20 mb-4">
          {error}
        </div>
      )}

      {/* Upload area */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors disabled:opacity-50"
        >
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Click to upload PDF</p>
                <p className="text-xs text-muted-foreground">Max 50MB</p>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Documents list */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between bg-sidebar p-3 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)}MB` : ''}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id, '')}
                  disabled={deleting === doc.id}
                  className="flex-shrink-0"
                >
                  {deleting === doc.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
