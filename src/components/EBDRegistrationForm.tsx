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

// ... (as interfaces permanecem as mesmas)

export const EBDRegistrationForm = () => {
  // ... (toda a sua lógica de state e funções permanece idêntica)
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

  const fetchClasses = async () => { /* ... sua função fetchClasses ... */ };
  const fetchStudents = async () => { /* ... sua função fetchStudents ... */ };
  const studentsInClass = students.filter(student => student.class_id === parseInt(selectedClassId));
  const handleStudentCheck = (studentName: string, checked: boolean) => { /* ... sua função handleStudentCheck ... */ };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... sua função handleFileChange ... */ };
  const uploadFiles = async (): Promise<string[]> => { /* ... sua função uploadFiles ... */ };
  const handleSubmit = async (e: React.FormEvent) => { /* ... sua função handleSubmit ... */ };
  const resetForm = () => { /* ... sua função resetForm ... */ };
  const handleBackToLogin = () => navigate("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-2 sm:p-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
            {/* ... seu cabeçalho ... */}
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">Selecione a Classe</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-12 border-primary/20 focus:border-primary"><SelectValue placeholder="-- Por favor, escolha uma classe --" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (<SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary">Alunos Presentes</Label>
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    {!selectedClassId ? (<p className="text-muted-foreground text-center py-8">Selecione uma classe para ver a lista de alunos.</p>)
                    : studentsInClass.length === 0 ? (<p className="text-muted-foreground text-center py-8">Não há alunos cadastrados para esta classe.</p>)
                    : (
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {studentsInClass.map((student) => (
                            <div key={student.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-primary/5">
                              <Checkbox id={`student-${student.id}`} checked={presentStudents.includes(student.name)} onCheckedChange={(checked) => handleStudentCheck(student.name, checked as boolean)} />
                              <Label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer text-sm">{student.name}</Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
                {selectedClassId && studentsInClass.length > 0 && (<p className="text-xs text-primary font-medium">{presentStudents.length} de {studentsInClass.length} alunos presentes</p>)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ... seus campos de Visitantes, Bíblias, Revistas ... */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ... seus campos de Oferta ... */}
              </div>
              <div>
                {/* ... seu campo de upload de arquivo ... */}
              </div>
              <div className="space-y-2">
                {/* ... seu campo de Hino Escolhido ... */}
              </div>
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full ...">
                {isSubmitting ? "Salvando..." : "Registrar Aula"}
              </Button>
              {formData && (<Button type="button" variant="outline" size="lg" onClick={resetForm} className="w-full ...">Novo Registro</Button>)}
            </form>
          </CardContent>
        </Card>
        {formData && (
          <Card className="mt-6 shadow-xl border-green-200 bg-green-50">
            {/* ... seu card de sucesso ... */}
          </Card>
        )}
      </div>
    </div>
  );
};
