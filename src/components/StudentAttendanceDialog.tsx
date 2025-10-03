import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle } from "lucide-react";

interface AttendanceRecord {
  date: string;
  present: boolean;
  className: string;
}

interface StudentAttendanceDialogProps {
  studentId: number | null;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StudentAttendanceDialog = ({ studentId, studentName, open, onOpenChange }: StudentAttendanceDialogProps) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, percentage: 0 });

  useEffect(() => {
    if (open && studentId) {
      fetchAttendance();
    }
  }, [open, studentId]);

  const fetchAttendance = async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      // Buscar aluno para pegar o nome
      const { data: student } = await supabase
        .from("students")
        .select("name, class_id, classes(name)")
        .eq("id", studentId)
        .single();

      if (!student) return;

      // Buscar todos os registros da classe do aluno
      const { data: registrations } = await supabase
        .from("registrations")
        .select("registration_date, present_students, class_id, classes(name)")
        .eq("class_id", student.class_id)
        .order("registration_date", { ascending: false })
        .limit(20); // Últimos 20 domingos

      if (registrations) {
        const records: AttendanceRecord[] = registrations.map(reg => ({
          date: new Date(reg.registration_date).toLocaleDateString('pt-BR'),
          present: (reg.present_students || []).includes(student.name),
          className: reg.classes?.name || "Desconhecida"
        }));

        const presentCount = records.filter(r => r.present).length;
        const absentCount = records.filter(r => !r.present).length;
        const percentage = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

        setAttendanceRecords(records);
        setStats({ present: presentCount, absent: absentCount, percentage });
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Frequência de {studentName}
          </DialogTitle>
          <DialogDescription>
            Histórico de presença nas últimas aulas da EBD
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cards de estatísticas */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-700">Presenças</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-800">{stats.present}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-700">Faltas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-800">{stats.absent}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-700">Frequência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800">{stats.percentage}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de registros */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground">Histórico Recente</h4>
              {attendanceRecords.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum registro de frequência encontrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {attendanceRecords.map((record, index) => (
                    <Card key={index} className={record.present ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30"}>
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {record.present ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{record.date}</p>
                              <p className="text-xs text-muted-foreground">{record.className}</p>
                            </div>
                          </div>
                          <Badge variant={record.present ? "default" : "destructive"}>
                            {record.present ? "Presente" : "Ausente"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};