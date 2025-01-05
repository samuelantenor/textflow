interface PreviewPanelProps {
  // Add props as needed for the preview
}

export function PreviewPanel({}: PreviewPanelProps) {
  return (
    <div className="bg-card p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Preview</h2>
      <div className="aspect-[9/16] bg-background rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
        <span className="text-muted-foreground">Preview will appear here</span>
      </div>
    </div>
  );
}