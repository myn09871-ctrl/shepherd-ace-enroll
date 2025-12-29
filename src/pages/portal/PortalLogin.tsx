import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useParentAuth } from "@/hooks/useParentAuth";
import schoolCrest from "@/assets/school-crest.jpeg";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const PortalLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, parentAccount, signIn } = useParentAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && user && parentAccount) {
      navigate("/portal");
    }
  }, [user, loading, parentAccount, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Successfully logged in to the parent portal",
        });
        navigate("/portal");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Website
        </Link>

        <div className="bg-card rounded-xl shadow-xl border border-border p-8">
          <div className="text-center mb-8">
            <img 
              src={schoolCrest} 
              alt="School Crest" 
              className="h-20 w-20 mx-auto rounded-full object-cover shadow-md mb-4"
            />
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Parent Portal</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Good Shepherd International School
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="parent@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Login to Portal"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot Password?
            </a>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Need Help?</strong><br />
              Contact the school at 0208163186 or<br />
              email support@goodshepherdschool.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
