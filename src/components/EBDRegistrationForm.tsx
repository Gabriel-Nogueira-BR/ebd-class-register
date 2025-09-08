import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// A importação do Select de shadcn/ui é removida para usar o nativo do HTML
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Unlock } from "lucide-react";

interface Class {
  id: number;
  name: string;
}
interface Student {
  id: number;
  name: string;
  class_id: number;
  active: boolean;
}
interface FormData {
  registrationDate: string;
  selectedClass: string;
  presentStudents: string[];
  totalPresent: number;
  visitors: number;
  bibles: number;
  magazines: number;
  offeringCash: number;
  offeringPix: number;
  hymn: string;
}

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
  const [isSystemLocked, setIsSystemLocked] = useState(() => {
    // Recupera o estado do localStorage na inicialização
    const savedState = localStorage.getItem('ebdFormLocked');
    return savedState === 'true';
  });
  const [editingRegistrationId, setEditingRegistrationId] = useState<string | null>(null);

  // Função para alternar o estado de bloqueio
  const toggleSystemLock = () => {
    const newState = !isSystemLocked;
    setIsSystemLocked(newState);
    localStorage.setItem('ebdFormLocked', String(newState));
    toast({
      title: newState ? "Formulário Bloqueado" : "Formulário Desbloqueado",
      description: newState 
        ? "O formulário está bloqueado para edições." 
        : "O formulário está liberado para registros e edições.",
    });
  };

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase.from("classes").select("*").order("id");
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar classes." });
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*").eq("active", true).order("name");
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar alunos." });
    }
  };

  const studentsInClass = students.filter(student => student.class_id === parseInt(selectedClassId));

  const handleStudentCheck = (studentName: string, checked: boolean) => {
    setPresentStudents(prev => checked ? [...prev, studentName] : prev.filter(name => name !== studentName));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPixFiles(files);
  };

  const uploadFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const file of pixFiles) {
      try {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const { data, error } = await supabase.storage.from("pix-receipts").upload(fileName, file);
        if (error) throw error;
        uploadedUrls.push(data.path);
      } catch (error) { console.error("Error uploading file:", error); throw error; }
    }
    return uploadedUrls;
  };

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
      const { data, error } = await supabase.from("registrations").select("*")
        .eq("class_id", parseInt(classId)).gte("registration_date", `${today}T00:00:00Z`)
        .lt("registration_date", `${today}T23:59:59Z`).order("created_at", { ascending: false })
        .limit(1).single();
      
      if (error || !data) {
        resetForm(false);
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
      console.log("Nenhum registro existente para hoje, iniciando um novo.");
      resetForm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast({ variant: "destructive", title: "Erro de validação", description: "Por favor, selecione uma classe." });
      return;
    }
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
      setFormData({
        registrationDate: new Date().toISOString(), selectedClass: selectedClass?.name || '', presentStudents,
        totalPresent: presentStudents.length, visitors, bibles, magazines, offeringCash, offeringPix, hymn
      });
      toast({ title: `Registro ${editingRegistrationId ? 'Atualizado' : 'Salvo'} com Sucesso!`, description: `Classe: ${selectedClass?.name}` });
      
      handleClassSelect(selectedClassId);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao salvar registro. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => navigate("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-2 sm:p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
            <div className="flex items-center justify-between">
              <Button onClick={handleBackToLogin} variant="outline" size="sm" className="border-primary/20">← Voltar</Button>
              <div className="flex-1 text-center px-2">
                <CardTitle className="text-xl sm:text-3xl text-primary flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Registro de Aula - EBD
                </CardTitle>
                <CardDescription className="text-sm sm:text-lg">Sistema de controle e acompanhamento das aulas da Escola Bíblica Dominical</CardDescription>
              </div>
              <Button
                type="button"
                variant={isSystemLocked ? "destructive" : "outline"}
                size="sm"
                onClick={toggleSystemLock}
                className="gap-2"
              >
                {isSystemLocked ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span className="hidden sm:inline">Bloqueado</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    <span className="hidden sm:inline">Liberado</span>
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            {isSystemLocked ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <Alert variant="destructive">
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Sistema Bloqueado</AlertTitle>
                  <AlertDescription>
                    O envio e a edição de registros estão bloqueados pelos administradores.
                  </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Voltar para a Página Inicial
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Selecione a Classe</Label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => handleClassSelect(e.target.value)}
                    className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-primary/20 focus:border-primary"
                    disabled={isSystemLocked}
                  >
                    <option value="" disabled>-- Por favor, escolha uma classe --</option>
                    {classes.map((cls) => (<option key={cls.id} value={cls.id.toString()}>{cls.name}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Alunos Presentes</Label>
                  <Card className="border-primary/20">
                    <CardContent className="p-4">
                      {!selectedClassId ? (<p className="text-muted-foreground text-center py-8">Selecione uma classe para ver a lista de alunos.</p>)
                      : studentsInClass.length === 0 ? (<p className="text-muted-foreground text-center py-8">Não há alunos cadastrados para esta classe.</p>)
                      : (<ScrollArea className="h-48"><div className="space-y-2">{studentsInClass.map((student) => (<div key={student.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5"><Checkbox id={`student-${student.id}`} checked={presentStudents.includes(student.name)} onCheckedChange={(checked) => handleStudentCheck(student.name, checked as boolean)} /><Label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer text-sm">{student.name}</Label></div>))}</div></ScrollArea>)}
                    </CardContent>
                  </Card>
                  {selectedClassId && studentsInClass.length > 0 && (<p className="text-xs text-primary font-medium">{presentStudents.length} de {studentsInClass.length} alunos presentes</p>)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Visitantes</Label><Input type="number" value={visitors} onChange={(e) => setVisitors(parseInt(e.target.value) || 0)} placeholder="0" min="0" className="border-primary/20 focus:border-primary"/></div>
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Bíblias</Label><Input type="number" value={bibles} onChange={(e) => setBibles(parseInt(e.target.value) || 0)} placeholder="0" min="0" className="border-primary/20 focus:border-primary"/></div>
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Revistas</Label><Input type="number" value={magazines} onChange={(e) => setMagazines(parseInt(e.target.value) || 0)} placeholder="0" min="0" className="border-primary/20 focus:border-primary"/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Oferta (Dinheiro)</Label><Input type="number" value={offeringCash} onChange={(e) => setOfferingCash(parseFloat(e.target.value) || 0)} placeholder="0.00" step="0.01" min="0" className="border-primary/20 focus:border-primary"/></div>
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Oferta (PIX/Cartão)</Label><Input type="number" value={offeringPix} onChange={(e) => setOfferingPix(parseFloat(e.target.value) || 0)} placeholder="0.00" step="0.01" min="0" className="border-primary/20 focus:border-primary"/></div>
                </div>
                <div>
                  <Label htmlFor="pix-files" className="text-sm font-semibold text-primary">Comprovantes de PIX (opcional)</Label>
                  <div className="mt-2"><Input ref={fileInputRef} id="pix-files" type="file" accept="image/*,.pdf" multiple onChange={handleFileChange} className="border-primary/20 focus:border-primary"/><p className="text-sm text-muted-foreground mt-1">Anexe imagens ou PDFs dos comprovantes</p>{pixFiles.length > 0 && (<div className="mt-2"><p className="text-sm text-primary font-medium">{pixFiles.length} arquivo(s) selecionado(s):</p><ul className="text-sm text-muted-foreground">{pixFiles.map((file, index) => (<li key={index} className="truncate">• {file.name}</li>))}</ul></div>)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Hino Escolhido</Label>
                  <Input value={hymn} onChange={(e) => setHymn(e.target.value)} placeholder="Ex: 15 - Harpa Cristã" className="border-primary/20 focus:border-primary"/>
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting || isSystemLocked} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50">{isSubmitting ? "Salvando..." : (editingRegistrationId ? "Atualizar Registro" : "Registrar Aula")}</Button>
                {formData && (<Button type="button" variant="outline" size="lg" onClick={() => resetForm()} className="w-full border-primary text-primary hover:bg-primary/10">Novo Registro</Button>)}
              </form>
            )}
          </CardContent>
        </Card>
        {formData && (
          <Card className="mt-6 shadow-xl border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Registro Salvo com Sucesso!
              </CardTitle>
              <CardDescription className="text-green-600">
                Os dados da aula para a classe "{formData.selectedClass}" foram registrados no sistema.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
};
