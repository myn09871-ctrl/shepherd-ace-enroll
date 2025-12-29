import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface ParentAccount {
  id: string;
  student_id: string;
  parent_name: string;
  email: string;
  phone_primary: string | null;
  relationship: string;
  role: "primary" | "secondary";
}

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  middle_name: string | null;
  surname: string;
  date_of_birth: string;
  gender: string;
  current_class: string;
  academic_year: string;
  photo_url: string | null;
  status: string;
}

interface ParentAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  parentAccount: ParentAccount | null;
  student: Student | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const ParentAuthContext = createContext<ParentAuthContextType | undefined>(undefined);

export const ParentAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentAccount, setParentAccount] = useState<ParentAccount | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  const fetchParentData = async (userId: string) => {
    try {
      // Fetch parent account
      const { data: parentData, error: parentError } = await supabase
        .from("parent_accounts")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (parentError) throw parentError;
      
      if (parentData) {
        setParentAccount(parentData as ParentAccount);

        // Update last login
        await supabase
          .from("parent_accounts")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", parentData.id);

        // Fetch student data
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("id", parentData.student_id)
          .maybeSingle();

        if (studentError) throw studentError;
        setStudent(studentData as Student);
      }
    } catch (error) {
      console.error("Error fetching parent data:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchParentData(session.user.id);
          }, 0);
        } else {
          setParentAccount(null);
          setStudent(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchParentData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setParentAccount(null);
    setStudent(null);
  };

  return (
    <ParentAuthContext.Provider
      value={{
        user,
        session,
        loading,
        parentAccount,
        student,
        signIn,
        signOut,
      }}
    >
      {children}
    </ParentAuthContext.Provider>
  );
};

export const useParentAuth = () => {
  const context = useContext(ParentAuthContext);
  if (context === undefined) {
    throw new Error("useParentAuth must be used within a ParentAuthProvider");
  }
  return context;
};
