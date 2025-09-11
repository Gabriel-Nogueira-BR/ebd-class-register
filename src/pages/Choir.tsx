import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Music4, CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Hymn {
  hymn: string;
  class_name: string;
}

const ChoirView = () => {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const { data: registrations } = await supabase
          .from("registrations")
          .select("registration_date")
          .not("hymn", "is", null)
          .neq("hymn", "")
          .order("registration_date", { ascending: false });

        if (registrations) {
          const sundays = [...new Set(registrations.map(r => {
            const date = new Date(r.registration_date);
            const dayOfWeek = date.getUTCDay();
            const lastSunday = new Date(date);
            lastSunday.setUTCDate(date.getUTCDate() - dayOfWeek);
            return lastSunday.toISOString().split('T')[0];
          }))];
          setAvailableDates(sundays);
          if (sundays.length > 0) {
            setSelectedDate(sundays[0]); // Seleciona o domingo mais recente por defeito
          }
        }
      } catch (error) {
        console.error("Error fetching dates:", error);
      }
    };
    fetchAvailableDates();
  }, []);
  
  useEffect(() => {
    if (!selectedDate) return;

    const fetchHymns = async () => {
      setIsLoading(true);
      setError(null);
      
      const startDate = new Date(selectedDate + 'T00:00:00Z');
      const endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + 1);

      try {
        const { data, error } = await supabase
          .from("registrations")
          .select("hymn, classes(name)")
          .gte("registration_date", startDate.toISOString())
          .lt("registration_date", endDate.toISOString())
          .not("hymn", "is", null)
          .neq("hymn", "");

        if (error) throw error;
        
        const formattedHymns = data.map(item => ({
          hymn: item.hymn,
          class_name: (item.classes as { name: string })?.name || "Classe desconhecida"
        }));

        setHymns(formattedHymns);
      } catch (err) {
        console.error("Error fetching hymns:", err);
        setError("Não foi possível carregar os hinos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHymns();
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-blue-500/10 p-4 sm:p-6">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between">
              <Button onClick={() => navigate("/")} variant="outline" size="sm">← Voltar</Button>
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-3xl text-primary flex items-center justify-center gap-3">
                  <Music4 className="h-6 w-6 sm:h-8 sm:w-8" />
                  Hinos para o Louvor
                </CardTitle>
                <CardDescription>Hinos escolhidos pelas classes</CardDescription>
              </div>
              <div className="w-20"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="date-select" className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-5 w-5" />
                Data:
              </Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger id="date-select" className="w-64">
                  <SelectValue placeholder="Selecione um domingo" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map(date => (
                    <SelectItem key={date} value={date}>
                      {new Date(date + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Carregando hinos...</div>
            ) : error ? (
              <div className="text-center text-destructive py-8">{error}</div>
            ) : hymns.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhum hino foi registrado na data selecionada.
              </div>
            ) : (
              <div className="space-y-4">
                {hymns.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-card/50">
                    <p className="text-lg font-semibold text-primary">{item.hymn}</p>
                    <p className="text-sm text-muted-foreground">Sugerido pela: {item.class_name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChoirView;
