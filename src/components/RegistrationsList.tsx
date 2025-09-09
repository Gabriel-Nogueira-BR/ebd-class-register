import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [receiptsDialogOpen, setReceiptsDialogOpen] = useState(false);
  const [receiptUrls, setReceiptUrls] = useState<string[]>([]);

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

  const handleViewReceipts = async (registration: Registration) => {
    setSelectedRegistration(registration);
    
    if (registration.pix_receipt_urls.length === 0) {
      toast({
        title: "Sem comprovantes",
        description: "Este registro não possui comprovantes anexados.",
        variant: "default",
      });
      return;
    }

    try {
      // Generate signed URLs for viewing the receipts
      const urls = await Promise.all(
        registration.pix_receipt_urls.map(async (path) => {
          const { data, error } = await supabase.storage
            .from("pix-receipts")
            .createSignedUrl(path, 3600); // URL válida por 1 hora
          
          if (error) {
            console.error("Error creating signed URL:", error);
            return null;
          }
          
          return data.signedUrl;
        })
      );

      const validUrls = urls.filter(url => url !== null) as string[];
      setReceiptUrls(validUrls);
      setReceiptsDialogOpen(true);
    } catch (error) {
      console.error("Error viewing receipts:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar os comprovantes.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReceipt = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `comprovante-${selectedRegistration?.id}-${index + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download iniciado",
        description: "O comprovante está sendo baixado.",
      });
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o comprovante.",
        variant: "destructive",
      });
    }
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
                    <div className="flex items-center gap-2">
                      <Badge variant={registration.pix_receipt_urls.length > 0 ? "default" : "secondary"}>
                        {registration.pix_receipt_urls.length} arquivo(s)
                      </Badge>
                      {registration.pix_receipt_urls.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipts(registration)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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

      {/* Dialog para visualizar comprovantes */}
      <Dialog open={receiptsDialogOpen} onOpenChange={setReceiptsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comprovantes PIX</DialogTitle>
            <DialogDescription>
              Classe: {selectedRegistration?.classes?.name} | 
              Data: {selectedRegistration && formatDate(selectedRegistration.registration_date)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {receiptUrls.map((url, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Comprovante {index + 1}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(url, index)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={url}
                      alt={`Comprovante ${index + 1}`}
                      className="w-full h-auto"
                      onError={(e) => {
                        // Se for um PDF ou outro tipo de arquivo não-imagem
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const iframe = document.createElement('iframe');
                          iframe.src = url;
                          iframe.className = 'w-full h-[600px]';
                          parent.appendChild(iframe);
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};