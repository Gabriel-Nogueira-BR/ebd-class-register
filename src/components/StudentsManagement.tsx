import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  birth_date: string | null;
  class_id: number;
  active: boolean;
  classes?: {
    name: string;
  };
}

interface Class {
  id: number;
  name: string;
}

export const StudentsManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentAddress, setNewStudentAddress] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newStudentBirthDate, setNewStudentBirthDate] = useState("");
  const [newStudentClassId, setNewStudentClassId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsResult, classesResult] = await Promise.all([
        supabase
          .from("students")
          .select(`
            *,
            classes:class_id (
              name
            )
          `)
          .order("name"),
        supabase
          .from("classes")
          .select("*")
          .order("id")
      ]);

      if (studentsResult.error) throw studentsResult.error;
      if (classesResult.error) throw classesResult.error;

      setStudents(studentsResult.data || []);
      setClasses(classesResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = async () => {
    if (!newStudentName.trim() || !newStudentClassId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha pelo menos o nome e a classe.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("students")
        .insert([
          {
            name: newStudentName.trim(),
            address: newStudentAddress.trim(),
            phone: newStudentPhone.trim(),
            birth_date: newStudentBirthDate || null,
            class_id: parseInt(newStudentClassId),
            active: true
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno adicionado com sucesso!",
      });

      setNewStudentName("");
      setNewStudentAddress("");
      setNewStudentPhone("");
      setNewStudentBirthDate("");
      setNewStudentClassId("");
      fetchData();
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar aluno.",
      });
    }
  };

  const toggleStudentStatus = async (studentId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({ active: !currentStatus })
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Aluno ${!currentStatus ? "ativado" : "desativado"} com sucesso!`,
      });

      fetchData();
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar status do aluno.",
      });
    }
  };

  if (isLoading) {
    // Skeleton Loader
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Aluno</CardTitle>
          <CardDescription>
            Cadastre um novo aluno no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="student-name">Nome do Aluno</Label>
              <Input
                id="student-name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="student-phone">Telefone</Label>
              <Input
                id="student-phone"
                value={newStudentPhone}
                onChange={(e) => setNewStudentPhone(e.target.value)}
                placeholder="(22) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-birth-date">Data de Nascimento</Label>
              <Input
                id="student-birth-date"
                type="date"
                value={newStudentBirthDate}
                onChange={(e) => setNewStudentBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <Label htmlFor="student-address">Endereço</Label>
              <Input
                id="student-address"
                value={newStudentAddress}
                onChange={(e) => setNewStudentAddress(e.target.value)}
                placeholder="Rua, número, bairro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-class">Classe</Label>
              <Select value={newStudentClassId} onValueChange={setNewStudentClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a classe" />
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
            <Button onClick={addStudent} className="w-full">
              Adicionar Aluno
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            Gerencie todos os alunos cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>
                      {student.phone || "-"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {student.classes?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.active ? "default" : "secondary"}>
                        {student.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStudentStatus(student.id, student.active ?? false)}
                      >
                        {student.active ? "Desativar" : "Ativar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {students.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum aluno encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
