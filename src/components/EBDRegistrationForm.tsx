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

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("id");
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar classes.",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar alunos.",
      });
    }
  };

  const studentsInClass = students.filter(student => 
    student.class_id === parseInt(selectedClassId)
  );

  const handleStudentCheck = (studentName: string, checked: boolean) => {
    if (checked) {
      setPresentStudents(prev => [...prev, studentName]);
    } else {
      setPresentStudents(prev => prev.filter(name => name !== studentName));
    }
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
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    }
    return uploadedUrls;
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
      if (pixFiles.length > 0) {
        pixReceiptUrls = await uploadFiles();
      }
      const { error } = await supabase.from("registrations").insert([{
        class_id: parseInt(selectedClassId), present_students: presentStudents,
        total_present: presentStudents.length, visitors, bibles, magazines,
        offering_cash: offeringCash, offering_pix: offeringPix, hymn, pix_receipt_urls: pixReceiptUrls
      }]).select();
      if (error) throw error;

      const selectedClass = classes.find(c => c.id === parseInt(selectedClassId));
      setFormData({
        registrationDate: new Date().toISOString(), selectedClass: selectedClass?.name || '', presentStudents,
        totalPresent: presentStudents.length, visitors, bibles, magazines, offeringCash, offeringPix, hymn
      });
      toast({ title: "Registro salvo com sucesso!", description: `Classe: ${selectedClass?.name}` });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ variant: "destructive", title: "Erro", description: "Erro ao salvar registro. Tente novamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClassId(''); setPresentStudents([]); setVisitors(0); setBibles(0);
    setMagazines(0); setOfferingCash(0); setOfferingPix(0); setHymn('');
    setPixFiles([]); setFormData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackToLogin = () => navigate("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-2 sm:p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
            <div className="flex items-center justify-between">
              <Button onClick={handleBackToLogin} variant="outline" size="sm" className="border-primary/20">
                ← Voltar
              </Button>
              <div className="flex-1 text-center px-2">
                <CardTitle className="text-xl sm:text-3xl text-primary flex items-center justify-center gap-2 sm:gap-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Registro de Aula - EBD
                </CardTitle>
                <CardDescription className="text-sm sm:text-lg">
                  Sistema de controle e acompanhamento das aulas
                </CardDescription>
              </div>
              <div className="w-16 sm:w-20"></div> {/* Espaçador */}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">Selecione a Classe</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-12 border-primary/20 focus:border-primary"><SelectValue placeholder="-- Por favor, escolha uma classe --" /></SelectTrigger>
                  <SelectContent>{classes.map((cls) => (<SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">Alunos Presentes</Label>
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    {!selectedClassId ? (<p className="text-muted-foreground text-center py-8">Selecione uma classe para ver a lista de alunos.</p>)
                    : studentsInClass.length === 0 ? (<p className="text-muted-foreground text-center py-8">Não há alunos cadastrados para esta classe.</p>)
                    : (<ScrollArea className="h-48"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{studentsInClass.map((student) => (<div key={student.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5"><Checkbox id={`student-${student.id}`} checked={presentStudents.includes(student.name)} onCheckedChange={(checked) => handleStudentCheck(student.name, checked as boolean)} /><Label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer text-sm">{student.name}</Label></div>))}</div></ScrollArea>)}
                  </CardContent>
                </Card>
                {selectedClassId && studentsInClass.length > 0 && (<p className="text-xs text-primary font-medium">{presentStudents.length} de {studentsInClass.length} alunos presentes</p>)}
              </div>
              
              {/* SEÇÃO DE NÚMEROS RESPONSIVA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Visitantes</Label><Input type="number" value={visitors} onChange={(e) => setVisitors(parseInt(e.target.value) || 0)} placeholder="0" min="0" className="border-primary/20 focus:border-primary"/></div>
                <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Bíblias</Label><Input type="number" value={bibles} onChange={(e) => setBibles(parseInt(e.target.value) || 0)} placeholder="0" min="0" className="border-primary/20 focus:border-primary"/></div>
                <div className="space-y-2"><Label className="text-sm font-semibold text-primary">Revistas</Label><Input type="number" value={magazines} onChange={(e) => setMagazines(parseInt(e.target.value) || 0)} placeholder="0" min="0" className="border-primary/20 focus:border-primary"/></div>
              </div>

              {/* SEÇÃO DE OFERTAS RESPONSIVA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50">{isSubmitting ? "Salvando..." : "Registrar Aula"}</Button>
              {formData && (<Button type="button" variant="outline" size="lg" onClick={resetForm} className="w-full border-primary text-primary hover:bg-primary/10">Novo Registro</Button>)}
            </form>
          </CardContent>
        </Card>
        {formData && (
          <Card className="mt-6 shadow-xl border-green-200 bg-green-50">
            <CardHeader><CardTitle className="text-green-800">✅ Registro Salvo com Sucesso!</CardTitle><CardDescription className="text-green-600">Os dados da aula foram registrados no sistema.</CardDescription></CardHeader>
            <CardContent><div className="bg-white p-4 rounded-lg border border-green-200"><pre className="text-sm text-gray-700 overflow-auto">{JSON.stringify(formData, null, 2)}</pre></div></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
