import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, ClipboardList } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Class {
  id: number;
  name: string;
}

interface Registration {
  class_id: number;
}

export const TodayStatusDialog = () => {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [todayRegistrations, setTodayRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTodayStatus = async () => {
    setLoading(true);
    try {
      // Buscar todas as classes
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id, name")
        .order("name");

      if (classesError) throw classesError;

      // Buscar registros de hoje
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const startDateBrasilia = new Date(startOfDay.getTime() + (3 * 60 * 60 * 1000)).toISOString();
      const endDateBrasilia = new Date(endOfDay.getTime() + (3 * 60 * 60 * 1000)).toISOString();

      const { data: registrationsData, error: registrationsError } = await supabase
        .from("registrations")
        .select("class_id")
        .gte("registration_date", startDateBrasilia)
        .lt("registration_date", endDateBrasilia);

      if (registrationsError) throw registrationsError;

      setClasses(classesData || []);
      setTodayRegistrations(registrationsData || []);
    } catch (error) {
      console.error("Error fetching today's status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTodayStatus();
    }
  }, [open]);

  const classesWithRegistration = todayRegistrations.map(r => r.class_id);
  const sentClasses = classes.filter(c => classesWithRegistration.includes(c.id));
  const pendingClasses = classes.filter(c => !classesWithRegistration.includes(c.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Status dos Envios de Hoje</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Veja quais classes já enviaram o relatório de hoje
            </p>
            <Button variant="link" className="mt-2 p-0 h-auto">
              Ver Status Completo →
            </Button>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Status dos Envios de Hoje</DialogTitle>
          <DialogDescription>
            Panorama dos relatórios enviados pelas classes hoje
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Relatórios Enviados */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <h4>Relatórios Enviados ({sentClasses.length})</h4>
              </div>
              <ScrollArea className="h-[300px] border rounded-lg p-3 bg-green-50/50">
                {sentClasses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum relatório enviado ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sentClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center gap-2 p-2 bg-white rounded border border-green-200"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{cls.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Relatórios Pendentes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 font-semibold">
                <Clock className="w-5 h-5" />
                <h4>Relatórios Pendentes ({pendingClasses.length})</h4>
              </div>
              <ScrollArea className="h-[300px] border rounded-lg p-3 bg-amber-50/50">
                {pendingClasses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Todas as classes enviaram seus relatórios! 🎉
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pendingClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center gap-2 p-2 bg-white rounded border border-amber-200"
                      >
                        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-sm">{cls.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
