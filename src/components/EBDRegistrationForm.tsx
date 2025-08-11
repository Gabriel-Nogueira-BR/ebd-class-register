import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Users, DollarSign, Music, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Database simulation
const classes = [
  { id: 1, name: '01. OVELHINHAS E CORDEIRINHOS DE CRISTO (2 a 5 anos)' },
  { id: 2, name: '02. SOLDADOS DE CRISTO (6 a 8 anos)' },
  { id: 3, name: '03. ESTRELA DE DAVI (9 a 11 anos)' },
  { id: 4, name: '04. LAEL (12 a 14 anos)' },
  { id: 5, name: '05. ÁGAPE (15 a 17 anos)' },
  { id: 6, name: '06. NOVA VIDA (Novos Convertidos)' },
  { id: 7, name: '07. EMANUEL (Jovens)' },
  { id: 8, name: '08. ESTER (irmãs)' },
  { id: 9, name: '09. LÍRIOS DOS VALES (irmãs)' },
  { id: 10, name: '10. VENCEDORAS PELA FÉ (irmãs)' },
  { id: 11, name: '11. ESPERANÇA (irmãs)' },
  { id: 12, name: '12. HERÓIS DA FÉ (irmãos)' },
  { id: 13, name: '13. DÉBORA (Pastora, Missionárias e Diaconisas)' },
  { id: 14, name: '14. MOISES (Diáconos)' },
  { id: 15, name: '15. ABRAÃO (Pastores, Evangelistas e Presbíteros)' },
  { id: 16, name: '16. PROFESSORES' },
  { id: 17, name: '17. CLASSE EXTRA - REGIONAL' }
];

const students = [
  { id: 101, name: 'Ana Beatriz', class_id: 1 },
  { id: 102, name: 'Lucas Gabriel', class_id: 1 },
  { id: 103, name: 'Sofia Oliveira', class_id: 1 },
  { id: 201, name: 'Davi Luiz', class_id: 2 },
  { id: 202, name: 'Isabela Costa', class_id: 2 },
  { id: 301, name: 'Mateus Pereira', class_id: 3 },
  { id: 302, name: 'Júlia Martins', class_id: 3 },
  { id: 303, name: 'Enzo Rodrigues', class_id: 3 },
  { id: 304, name: 'Laura Almeida', class_id: 3 },
  { id: 701, name: 'Gabriel Ferreira', class_id: 7 },
  { id: 702, name: 'Beatriz Lima', class_id: 7 },
  { id: 703, name: 'Thiago Souza', class_id: 7 }
];

interface FormData {
  data_registro: string;
  classe_selecionada: string;
  alunos_presentes_lista: string[];
  total_alunos_presentes: number;
  total_visitantes: number;
  total_biblias: number;
  total_revistas: number;
  oferta_dinheiro: number;
  oferta_pix_cartao: number;
  hino_escolhido: string;
}

export function EBDRegistrationForm() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [visitors, setVisitors] = useState(0);
  const [bibles, setBibles] = useState(0);
  const [magazines, setMagazines] = useState(0);
  const [offeringCash, setOfferingCash] = useState(0);
  const [offeringPix, setOfferingPix] = useState(0);
  const [hymn, setHymn] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  
  const { toast } = useToast();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClassId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione uma classe.",
      });
      return;
    }

    const selectedClass = classes.find(c => c.id === parseInt(selectedClassId));
    
    const data: FormData = {
      data_registro: new Date().toLocaleString('pt-BR'),
      classe_selecionada: selectedClass?.name || '',
      alunos_presentes_lista: presentStudents,
      total_alunos_presentes: presentStudents.length,
      total_visitantes: visitors,
      total_biblias: bibles,
      total_revistas: magazines,
      oferta_dinheiro: offeringCash,
      oferta_pix_cartao: offeringPix,
      hino_escolhido: hymn
    };

    setFormData(data);
    setShowOutput(true);
    
    toast({
      title: "Registro salvo com sucesso!",
      description: "Os dados da aula foram registrados.",
    });
  };

  const resetForm = () => {
    setSelectedClassId("");
    setPresentStudents([]);
    setVisitors(0);
    setBibles(0);
    setMagazines(0);
    setOfferingCash(0);
    setOfferingPix(0);
    setHymn("");
    setShowOutput(false);
    setFormData(null);
  };

  useEffect(() => {
    setPresentStudents([]);
  }, [selectedClassId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full shadow-glow mb-4">
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Registro de Aula da EBD
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistema de registro para Escola Bíblica Dominical
          </p>
        </div>

        {/* Main Form */}
        <Card className="shadow-card border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl text-center text-primary">
              Informações da Aula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Class Selection */}
              <div className="space-y-3">
                <Label htmlFor="class-select" className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Selecione a Classe
                </Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="-- Por favor, escolha uma classe --" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Students List */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Alunos Presentes</Label>
                <Card className="bg-gradient-secondary border-accent/50">
                  <CardContent className="p-4">
                    {!selectedClassId ? (
                      <p className="text-muted-foreground text-center py-8">
                        Selecione uma classe para ver a lista de alunos.
                      </p>
                    ) : studentsInClass.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Não há alunos cadastrados para esta classe.
                      </p>
                    ) : (
                      <ScrollArea className="h-64">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {studentsInClass.map((student) => (
                            <div key={student.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                              <Checkbox
                                id={`student-${student.id}`}
                                checked={presentStudents.includes(student.name)}
                                onCheckedChange={(checked) => 
                                  handleStudentCheck(student.name, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`student-${student.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                {student.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
                {selectedClassId && studentsInClass.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {presentStudents.length} de {studentsInClass.length} alunos selecionados
                  </p>
                )}
              </div>

              <Separator />

              {/* Numbers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="visitors" className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Visitantes
                  </Label>
                  <Input
                    id="visitors"
                    type="number"
                    min="0"
                    value={visitors}
                    onChange={(e) => setVisitors(parseInt(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bibles" className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-primary" />
                    Bíblias
                  </Label>
                  <Input
                    id="bibles"
                    type="number"
                    min="0"
                    value={bibles}
                    onChange={(e) => setBibles(parseInt(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="magazines" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Revistas
                  </Label>
                  <Input
                    id="magazines"
                    type="number"
                    min="0"
                    value={magazines}
                    onChange={(e) => setMagazines(parseInt(e.target.value) || 0)}
                    className="h-12 text-base"
                  />
                </div>
              </div>

              {/* Offering */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="offering-cash" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Oferta (Dinheiro)
                  </Label>
                  <Input
                    id="offering-cash"
                    type="number"
                    min="0"
                    step="0.01"
                    value={offeringCash}
                    onChange={(e) => setOfferingCash(parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offering-pix" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Oferta (PIX/Cartão)
                  </Label>
                  <Input
                    id="offering-pix"
                    type="number"
                    min="0"
                    step="0.01"
                    value={offeringPix}
                    onChange={(e) => setOfferingPix(parseFloat(e.target.value) || 0)}
                    className="h-12 text-base"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Hymn */}
              <div className="space-y-2">
                <Label htmlFor="hymn" className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" />
                  Hino Escolhido
                </Label>
                <Input
                  id="hymn"
                  value={hymn}
                  onChange={(e) => setHymn(e.target.value)}
                  placeholder="Ex: 15 - Harpa Cristã"
                  className="h-12 text-base"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1">
                  Registrar Aula
                </Button>
                {showOutput && (
                  <Button type="button" variant="secondary" size="lg" onClick={resetForm}>
                    Novo Registro
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Output */}
        {showOutput && formData && (
          <Card className="shadow-card border-success/50 bg-success-bg/50">
            <CardHeader>
              <CardTitle className="text-success flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Dados Registrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-card p-4 rounded-lg overflow-auto border border-border/50">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}