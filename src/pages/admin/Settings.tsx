import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Key, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  motto: string;
}

interface AdmissionSettings {
  accept_creche: boolean;
  accept_nursery: boolean;
  accept_kindergarten: boolean;
  accept_primary: boolean;
  accept_jhs: boolean;
  free_admission: boolean;
  deadline: string | null;
}

const Settings = () => {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    name: "Good Shepherd International School",
    address: "Mallam New Gbawe, Accra",
    phone: "0208163186",
    email: "info@goodshepherdschool.edu.gh",
    motto: "In God We Trust",
  });

  const [admissionSettings, setAdmissionSettings] = useState<AdmissionSettings>({
    accept_creche: true,
    accept_nursery: true,
    accept_kindergarten: true,
    accept_primary: true,
    accept_jhs: true,
    free_admission: true,
    deadline: null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from("school_settings")
        .select("setting_key, setting_value");

      data?.forEach((setting) => {
        if (setting.setting_key === "school_info") {
          setSchoolInfo(setting.setting_value as unknown as SchoolInfo);
        } else if (setting.setting_key === "admission_settings") {
          setAdmissionSettings(setting.setting_value as unknown as AdmissionSettings);
        }
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        supabase
          .from("school_settings")
          .update({ setting_value: JSON.parse(JSON.stringify(schoolInfo)) })
          .eq("setting_key", "school_info"),
        supabase
          .from("school_settings")
          .update({ setting_value: JSON.parse(JSON.stringify(admissionSettings)) })
          .eq("setting_key", "admission_settings"),
      ]);

      toast({
        title: "Settings Saved",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isSuperAdmin = userRole === "super_admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage system configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="school" className="space-y-6">
        <TabsList>
          <TabsTrigger value="school">School Info</TabsTrigger>
          <TabsTrigger value="admission">Admissions</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="users">User Management</TabsTrigger>}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-6">School Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">School Name</label>
                <Input
                  value={schoolInfo.name}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Motto</label>
                <Input
                  value={schoolInfo.motto}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, motto: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={schoolInfo.address}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={schoolInfo.phone}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  value={schoolInfo.email}
                  onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="admission" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-6">Admission Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Free Admission Promotion</p>
                  <p className="text-sm text-muted-foreground">Enable free admission offer</p>
                </div>
                <Switch
                  checked={admissionSettings.free_admission}
                  onCheckedChange={(checked) =>
                    setAdmissionSettings({ ...admissionSettings, free_admission: checked })
                  }
                />
              </div>

              <div className="border-t border-border pt-4">
                <p className="font-medium mb-4">Accept Applications For</p>
                <div className="space-y-3">
                  {[
                    { key: "accept_creche", label: "Creche" },
                    { key: "accept_nursery", label: "Nursery" },
                    { key: "accept_kindergarten", label: "Kindergarten" },
                    { key: "accept_primary", label: "Primary" },
                    { key: "accept_jhs", label: "JHS" },
                  ].map((program) => (
                    <div key={program.key} className="flex items-center justify-between">
                      <span className="text-sm">{program.label}</span>
                      <Switch
                        checked={admissionSettings[program.key as keyof AdmissionSettings] as boolean}
                        onCheckedChange={(checked) =>
                          setAdmissionSettings({ ...admissionSettings, [program.key]: checked })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="users" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Admin Users</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>User management coming soon</p>
                <p className="text-sm">Contact system administrator to add users</p>
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="security" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-6">Security & Backup</h3>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Key className="h-4 w-4 mr-2" />
                Change My Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download Database Backup
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                View Login History
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
