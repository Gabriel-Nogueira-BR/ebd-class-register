import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Registration {
  id: string;
  registration_date: string;
  class_id: number;
  present_students: string[];
  total_present: number;
  visitors: number;
  bibles: number;
  magazines: number;
  offering_cash: number;
  offering_pix: number;
  hymn: string;
  pix_receipt_urls: string[];
  classes?: {
    name: string;
  };
}

export const RegistrationsList = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          *,
          classes:class_id (
            name
          )
        `)
        .order("registration_date", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registros de Aulas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de Aulas</CardTitle>
        <CardDescription>
          Visualize todos os registros de aulas da EBD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Presentes</TableHead>
                <TableHead>Visitantes</TableHead>
                <TableHead>Materiais</TableHead>
                <TableHead>Ofertas</TableHead>
                <TableHead>Hino</TableHead>
                <TableHead>Comprovantes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell className="font-medium">
                    {formatDate(registration.registration_date)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {registration.classes?.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {registration.total_present}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {registration.visitors}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        B: {registration.bibles}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        R: {registration.magazines}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>💰 {formatCurrency(registration.offering_cash)}</div>
                      <div>📱 {formatCurrency(registration.offering_pix)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {registration.hymn || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={registration.pix_receipt_urls.length > 0 ? "default" : "secondary"}>
                      {registration.pix_receipt_urls.length} arquivo(s)
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {registrations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum registro encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  );
};