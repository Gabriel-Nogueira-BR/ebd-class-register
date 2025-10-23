import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";

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
  const [existingPixUrls, setExistingPixUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classNotes, setClassNotes] = useState<string>('');
  const [ebdNotes, setEbdNotes] = useState<string>('');
  const [formData, setFormData] = useState<FormData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isSystemLocked, setIsSystemLocked] = useState(true);
  const [editingRegistrationId, setEditingRegistrationId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save to localStorage
  useEffect(() => {
    if (!selectedClassId) return;
    
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `ebd-form-${selectedClassId}-${today}`;
    
    const formState = {
      presentStudents,
      visitors,
      bibles,
      magazines,
      offeringCash,
      offeringPix,
      hymn,
      classNotes,
      ebdNotes,
      date: today
    };
    
    localStorage.setItem(storageKey, JSON.stringify(formState));
    setLastSaved(new Date());
  }, [selectedClassId, presentStudents, visitors, bibles, magazines, offeringCash, offeringPix, hymn, classNotes, ebdNotes]);

  // Load from localStorage on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Clean old localStorage entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ebd-form-')) {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            if (parsed.date !== today) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  }, []);

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
        setIsSystemLocked(true); // Bloqueia por segurança
      }
    };
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          checkSystemStatus();
        }
    };
    checkSystemStatus();
    fetchClasses();
    fetchStudents();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
        // Sanitize filename: remove special characters and spaces
        const sanitizedName = file.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
          .replace(/_{2,}/g, '_') // Replace multiple underscores with single
          .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
        const fileName = `${timestamp}-${sanitizedName}`;
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
    setPixFiles([]); setExistingPixUrls([]); setFormData(null); setEditingRegistrationId(null);
    setClassNotes(''); setEbdNotes(''); setLastSaved(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearDraft = () => {
    if (!selectedClassId) return;
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `ebd-form-${selectedClassId}-${today}`;
    localStorage.removeItem(storageKey);
    resetForm(false);
    setLastSaved(null);
    toast({ title: "Rascunho Limpo", description: "Os dados do rascunho foram removidos." });
  };

  const handleClassSelect = async (classId: string) => {
    setSelectedClassId(classId);
    setFormData(null);
    if (!classId) {
        resetForm();
        return;
    };

    // Try to load from localStorage first
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `ebd-form-${classId}-${today}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.date === today) {
          setPresentStudents(parsed.presentStudents || []);
          setVisitors(parsed.visitors || 0);
          setBibles(parsed.bibles || 0);
          setMagazines(parsed.magazines || 0);
          setOfferingCash(parsed.offeringCash || 0);
          setOfferingPix(parsed.offeringPix || 0);
          setHymn(parsed.hymn || '');
          setClassNotes(parsed.classNotes || '');
          setEbdNotes(parsed.ebdNotes || '');
          toast({ title: "Dados Recuperados", description: "Suas informações foram recuperadas automaticamente." });
        }
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    }

    const todayDate = new Date();
    const startOfDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 23, 59, 59);
    
    // Ajustar para UTC-3 (Brasília)
    const startDateBrasilia = new Date(startOfDay.getTime() + (3 * 60 * 60 * 1000)).toISOString();
    const endDateBrasilia = new Date(endOfDay.getTime() + (3 * 60 * 60 * 1000)).toISOString();
    
    try {
      const { data, error } = await supabase.from("registrations").select("*")
        .eq("class_id", parseInt(classId))
        .gte("registration_date", startDateBrasilia)
        .lt("registration_date", endDateBrasilia)
        .order("created_at", { ascending: false })
        .limit(1).single();
      
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
      setClassNotes(data.class_notes || '');
      setEbdNotes(data.ebd_notes || '');
      setExistingPixUrls(data.pix_receipt_urls || []);
      setEditingRegistrationId(data.id);
    } catch (err) {
      console.log("Nenhum registro existente para hoje, iniciando um novo.");
      resetForm(false);
      setEditingRegistrationId(null);
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
      let pixReceiptUrls: string[] = [...existingPixUrls];
      if (pixFiles.length > 0) {
        const newUrls = await uploadFiles();
        pixReceiptUrls = [...pixReceiptUrls, ...newUrls];
      }
      
      const registrationData = {
        class_id: parseInt(selectedClassId), present_students: presentStudents,
        total_present: presentStudents.length, visitors, bibles, magazines,
        offering_cash: offeringCash, offering_pix: offeringPix, hymn, 
        pix_receipt_urls: pixReceiptUrls, class_notes: classNotes, ebd_notes: ebdNotes
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
      
      // Clear localStorage after successful submission
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `ebd-form-${selectedClassId}-${today}`;
      localStorage.removeItem(storageKey);
      
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
              <div className="w-16 sm:w-20"></div>
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
                <Button variant="outline" onClick={handleBackToLogin}>
                  Voltar para a Página Inicial
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {lastSaved && selectedClassId && (
                  <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Rascunho salvo automaticamente às {lastSaved.toLocaleTimeString('pt-BR')}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearDraft}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Limpar Rascunho
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Selecione a Classe</Label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => handleClassSelect(e.target.value)}
                    className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-primary/20 focus:border-primary"
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
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Visitantes</Label><Input type="number" value={visitors || ""} onChange={(e) => setVisitors(parseInt(e.target.value) || 0)} placeholder="0" min="0" className="border-primary/20 focus:border-primary"/></div>
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Bíblias</Label><Input type="number" value={bibles || ""} onChange={(e) => setBibles(parseInt(e.target.value) || 0)} placeholder="0" min="0" className="border-primary/20 focus:border-primary"/></div>
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Revistas</Label><Input type="number" value={magazines || ""} onChange={(e) => setMagazines(parseInt(e.target.value) || 0)} placeholder="0" min="0" className="border-primary/20 focus:border-primary"/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Oferta (Dinheiro)</Label><Input type="number" value={offeringCash || ""} onChange={(e) => setOfferingCash(parseFloat(e.target.value) || 0)} placeholder="0.00" step="0.01" min="0" className="border-primary/20 focus:border-primary"/></div>
                  <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Oferta (PIX/Cartão)</Label><Input type="number" value={offeringPix || ""} onChange={(e) => setOfferingPix(parseFloat(e.target.value) || 0)} placeholder="0.00" step="0.01" min="0" className="border-primary/20 focus:border-primary"/></div>
                </div>
                <div>
                  <Label htmlFor="pix-files" className="text-sm font-semibold text-primary">Comprovantes de PIX (opcional)</Label>
                  <div className="mt-2">
                    <Input ref={fileInputRef} id="pix-files" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,image/*" multiple onChange={handleFileChange} className="border-primary/20 focus:border-primary"/>
                    <p className="text-sm text-muted-foreground mt-1">Você pode anexar múltiplos arquivos (imagens ou PDFs)</p>
                    {existingPixUrls.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-primary font-medium">{existingPixUrls.length} comprovante(s) já enviado(s) anteriormente</p>
                      </div>
                    )}
                    {pixFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-primary font-medium">{pixFiles.length} novo(s) arquivo(s) selecionado(s):</p>
                        <ul className="text-sm text-muted-foreground">{pixFiles.map((file, index) => (<li key={index} className="truncate">• {file.name}</li>))}</ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Hino Escolhido</Label>
                  <Input value={hymn} onChange={(e) => setHymn(e.target.value)} placeholder="Ex: 15 - Harpa Cristã" className="border-primary/20 focus:border-primary"/>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-primary">Observações da Classe</Label>
                  <Textarea 
                    value={classNotes} 
                    onChange={(e) => setClassNotes(e.target.value)} 
                    placeholder="Observações do secretário da classe" 
                    className="border-primary/20 focus:border-primary" 
                    rows={3}
                  />
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting || isSystemLocked} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50">{isSubmitting ? "Salvando..." : (editingRegistrationId ? "Atualizar Registro" : "Registrar Aula")}</Button>
                {formData && (<Button type="button" variant="outline" size="lg" onClick={() => resetForm(true)} className="w-full border-primary text-primary hover:bg-primary/10">Novo Registro</Button>)}
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
