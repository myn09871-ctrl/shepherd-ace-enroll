import { useState, useEffect } from "react";
import { Folder, Download, FileText, Image, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Document {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size: number | null;
  academic_year: string | null;
  term: string | null;
  created_at: string;
}

const PortalDocuments = () => {
  const { student } = useParentAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) fetchDocuments();
  }, [student]);

  const fetchDocuments = async () => {
    if (!student) return;
    const { data } = await supabase
      .from("student_documents")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });
    setDocuments(data || []);
    setLoading(false);
  };

  const getIcon = (type: string) => {
    if (type === "report_card") return <FileText className="h-8 w-8 text-blue-600" />;
    if (type === "certificate") return <FileText className="h-8 w-8 text-yellow-600" />;
    return <File className="h-8 w-8 text-gray-600" />;
  };

  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) acc[doc.document_type] = [];
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          Documents
        </h1>
        <p className="text-sm text-muted-foreground">Access report cards, certificates, and other documents</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : documents.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No documents available</p>
        </CardContent></Card>
      ) : (
        Object.entries(groupedDocs).map(([type, docs]) => (
          <Card key={type}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base capitalize">{type.replace(/_/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                  {getIcon(doc.document_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.document_name}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(doc.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default PortalDocuments;
