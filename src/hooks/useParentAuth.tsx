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
  parentAccounts: ParentAccount[];
  students: Student[];
  currentStudent: Student | null;
  parentAccount: ParentAccount | null; // Current parent account for the selected student
  setCurrentStudent: (student: Student) => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const ParentAuthContext = createContext<ParentAuthContextType | undefined>(undefined);

export const ParentAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentAccounts, setParentAccounts] = useState<ParentAccount[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudentState] = useState<Student | null>(null);

  // Get parent account for the current student
  const parentAccount = parentAccounts.find(
    (pa) => pa.student_id === currentStudent?.id
  ) || parentAccounts[0] || null;

  const setCurrentStudent = (student: Student) => {
    setCurrentStudentState(student);
    // Persist selection in localStorage
    localStorage.setItem("currentStudentId", student.id);
  };

  const fetchParentData = async (userId: string) => {
    try {
      // Fetch all parent accounts for this user
      const { data: parentData, error: parentError } = await supabase
        .from("parent_accounts")
        .select("*")
        .eq("user_id", userId);

      if (parentError) throw parentError;

      if (parentData && parentData.length > 0) {
        setParentAccounts(parentData as ParentAccount[]);

        // Update last login for all accounts
        const parentIds = parentData.map((p) => p.id);
        await supabase
          .from("parent_accounts")
          .update({ last_login_at: new Date().toISOString() })
          .in("id", parentIds);

        // Fetch all linked students
        const studentIds = parentData.map((p) => p.student_id);
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("*")
          .in("id", studentIds);

        if (studentsError) throw studentsError;

        if (studentsData) {
          setStudents(studentsData as Student[]);

          // Restore last selected student or default to first
          const savedStudentId = localStorage.getItem("currentStudentId");
          const savedStudent = studentsData.find((s) => s.id === savedStudentId);
          setCurrentStudentState(savedStudent || studentsData[0] || null);
        }
      } else {
        setParentAccounts([]);
        setStudents([]);
        setCurrentStudentState(null);
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
          setParentAccounts([]);
          setStudents([]);
          setCurrentStudentState(null);
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
    localStorage.removeItem("currentStudentId");
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setParentAccounts([]);
    setStudents([]);
    setCurrentStudentState(null);
  };

  return (
    <ParentAuthContext.Provider
      value={{
        user,
        session,
        loading,
        parentAccounts,
        students,
        currentStudent,
        parentAccount,
        setCurrentStudent,
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
