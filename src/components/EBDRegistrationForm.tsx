import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";

// ... (Interfaces permanecem as mesmas)

export const EBDRegistrationForm = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [visitors, setVisitors] = useState<number>(0);
  const [bibles, setBibles] = useState<number>(0);
  const [magazines, setMagazines] = useState<number>(0);
  const [offeringCash, setOfferingCash] = useState<number>(0);
  const [offeringPix, setOfferingPix] = useState<number>(0);
  const [hymn, setHymn] = useState<string>('');
  const [pixFiles, setPixFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // NOVOS ESTADOS PARA CONTROLE
  const [isSystemLocked, setIsSystemLocked] = useState(true);
  const [editingRegistrationId, setEditingRegistrationId] = useState<string | null>(null);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("value")
          .eq("key", "allow_registrations")
          .single();
        if (error) throw error;
        setIsSystemLocked(!(data?.value as boolean));
      } catch (error) {
        console.error("System lock check failed:", error);
        setIsSystemLocked(true);
      }
    };
    checkSystemStatus();
    fetchClasses();
    fetchStudents();
  }, []);

  // Lógica de busca de dados (sem alterações)
  const fetchClasses = async () => { /* ... */ };
  const fetchStudents = async () => { /* ... */ };

  const studentsInClass = students.filter(student => student.class_id === parseInt(selectedClassId));
  const handleStudentCheck = (studentName: string, checked: boolean) => { /* ... */ };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
  const uploadFiles = async (): Promise<string[]> => { /* ... */ };
  
  const resetForm = (clearClass = true) => {
    if (clearClass) setSelectedClassId('');
    setPresentStudents([]); setVisitors(0); setBibles(0);
    setMagazines(0); setOfferingCash(0); setOfferingPix(0); setHymn('');
    setPixFiles([]); setFormData(null); setEditingRegistrationId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleClassSelect = async (classId: string) => {
    setSelectedClassId(classId);
    setFormData(null);
    if (!classId) return;

    const today = new Date().toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .eq("class_id", classId)
        .gte("registration_date", `${today}T00:00:00Z`)
        .lt("registration_date", `${today}T23:59:59Z`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data) {
        resetForm(false);
        setEditingRegistrationId(null);
        return;
      }
      
      toast({ title: "Modo de Edição", description: "Um registro para hoje foi encontrado e carregado no formulário." });
      setPresentStudents(data.present_students || []);
      setVisitors(data.visitors || 0);
      setBibles(data.bibles || 0);
      setMagazines(data.magazines || 0);
      setOfferingCash(data.offering_cash || 0);
      setOfferingPix(data.offering_pix || 0);
      setHymn(data.hymn || '');
      setEditingRegistrationId(data.id);
    } catch (err) {
      console.log("No existing registration for today, starting new one.");
      resetForm(false);
      setEditingRegistrationId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) { /* ... validação ... */ return; }
    setIsSubmitting(true);
    
    try {
      let pixReceiptUrls: string[] = [];
      if (pixFiles.length > 0) pixReceiptUrls = await uploadFiles();
      
      const registrationData = {
        class_id: parseInt(selectedClassId), present_students: presentStudents,
        total_present: presentStudents.length, visitors, bibles, magazines,
        offering_cash: offeringCash, offering_pix: offeringPix, hymn, pix_receipt_urls: pixReceiptUrls
      };

      if (editingRegistrationId) {
        const { error } = await supabase.from("registrations").update(registrationData).eq("id", editingRegistrationId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("registrations").insert([registrationData]);
        if (error) throw error;
      }

      const selectedClass = classes.find(c => c.id === parseInt(selectedClassId));
      toast({ title: `Registro ${editingRegistrationId ? 'Atualizado' : 'Salvo'} com Sucesso!`, description: `Classe: ${selectedClass?.name}` });
      
      // Re-carrega os dados no formulário para confirmar o salvamento
      handleClassSelect(selectedClassId);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao salvar registro. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-2 sm:p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-xl border-primary/20">
          <CardHeader> {/* ... Cabeçalho ... */} </CardHeader>
          <CardContent className="p-4 sm:p-8">
            {isSystemLocked ? (
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertTitle>Sistema Bloqueado</AlertTitle>
                <AlertDescription>
                  O envio de novos registros e edições está temporariamente bloqueado pelos administradores da EBD.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Selecione a Classe</Label>
                  <Select value={selectedClassId} onValueChange={handleClassSelect} disabled={isSystemLocked}>
                    <SelectTrigger className="h-12 border-primary/20 focus:border-primary">
                      <SelectValue placeholder="-- Por favor, escolha uma classe --" />
                    </SelectTrigger>
                    <SelectContent>{classes.map((cls) => (<SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                {/* ... Resto do formulário ... */}
                <Button type="submit" size="lg" disabled={isSubmitting || isSystemLocked} className="w-full ...">
                  {isSubmitting ? "Salvando..." : (editingRegistrationId ? "Atualizar Registro" : "Registrar Aula")}
                </Button>
                {/* ... */}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
