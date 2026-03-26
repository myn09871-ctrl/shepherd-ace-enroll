import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface TeacherProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

interface ClassAssignment {
  id: string;
  class_name: string;
  academic_year: string;
  is_active: boolean;
}

interface TeacherAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  teacherProfile: TeacherProfile | null;
  assignedClasses: ClassAssignment[];
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const TeacherAuthContext = createContext<TeacherAuthContextType | undefined>(undefined);

export const TeacherAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<ClassAssignment[]>([]);

  const fetchTeacherData = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "teacher")
        .maybeSingle();

      if (!roleData) {
        setTeacherProfile(null);
        setAssignedClasses([]);
        return;
      }

      const { data: profile } = await supabase
        .from("teacher_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profile) {
        setTeacherProfile(profile as TeacherProfile);

        const { data: classes } = await supabase
          .from("class_teachers")
          .select("*")
          .eq("teacher_id", profile.id)
          .eq("is_active", true);

        setAssignedClasses((classes || []) as ClassAssignment[]);
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchTeacherData(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchTeacherData(session.user.id), 0);
      } else {
        setTeacherProfile(null);
        setAssignedClasses([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchTeacherData(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setTeacherProfile(null);
    setAssignedClasses([]);
  };

  return (
    <TeacherAuthContext.Provider value={{ user, session, loading, teacherProfile, assignedClasses, signIn, signOut, refreshProfile }}>
      {children}
    </TeacherAuthContext.Provider>
  );
};

export const useTeacherAuth = () => {
  const context = useContext(TeacherAuthContext);
  if (!context) throw new Error("useTeacherAuth must be used within TeacherAuthProvider");
  return context;
};
