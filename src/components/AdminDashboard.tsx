import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalRegistrations: number;
  totalStudents: number;
  totalClasses: number;
  todayRegistrations: number;
  totalPresence: number;
  totalVisitors: number;
  totalOfferings: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    totalStudents: 0,
    totalClasses: 0,
    todayRegistrations: 0,
    totalPresence: 0,
    totalVisitors: 0,
    totalOfferings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [areRegistrationsAllowed, setAreRegistrationsAllowed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchStats(),
        fetchSettings()
      ]);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "allow_registrations")
        .single();
      
      if (error) throw error;
      if (data) {
        setAreRegistrationsAllowed(data.value as boolean);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setAreRegistrationsAllowed(false); // Default to false on error
    }
  };

  const fetchStats = async () => {
    try {
      const { count: totalRegistrations } = await supabase.from("registrations").select("*", { count: "exact", head: true });
      const { count: totalStudents } = await supabase.from("students").select("*", { count: "exact", head: true }).eq("active", true);
      const { count: totalClasses } = await supabase.from("classes").select("*", { count: "exact", head: true });
      const today = new Date().toISOString().split('T')[0];
      const { count: todayRegistrations } = await supabase.from("registrations").select("*", { count: "exact", head: true }).gte("registration_date", `${today}T00:00:00Z`).lt("registration_date", `${today}T23:59:59Z`);
      const { data: aggregatedData } = await supabase.from("registrations").select("total_present, visitors, offering_cash, offering_pix");

      let totalPresence = 0;
      let totalVisitors = 0;
      let totalOfferings = 0;

      if (aggregatedData) {
        aggregatedData.forEach((record) => {
          totalPresence += record.total_present || 0;
          totalVisitors += record.visitors || 0;
          totalOfferings += (parseFloat(String(record.offering_cash || 0)) + parseFloat(String(record.offering_pix || 0)));
        });
      }

      setStats({
        totalRegistrations: totalRegistrations || 0,
        totalStudents: totalStudents || 0,
        totalClasses: totalClasses || 0,
        todayRegistrations: todayRegistrations || 0,
        totalPresence,
        totalVisitors,
        totalOfferings,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handlePermissionToggle = async (isChecked: boolean) => {
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: isChecked })
        .eq("key", "allow_registrations");
      
      if (error) throw error;
      
      setAreRegistrationsAllowed(isChecked);
      toast({
        title: "Status do Sistema Alterado",
        description: `Registros e edições agora estão ${isChecked ? "LIBERADOS" : "BLOQUEADOS"}.`,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
