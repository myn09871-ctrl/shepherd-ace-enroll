import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { toast } from "sonner";
import schoolCrest from "@/assets/school-crest.jpeg";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useTeacherAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    const { error } = await signIn(values.email, values.password);
    if (error) {
      toast.error("Invalid credentials");
      setIsLoading(false);
      return;
    }
    toast.success("Welcome back!");
    navigate("/teacher");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={schoolCrest} alt="GSIS" className="h-16 w-16 rounded-full mx-auto mb-3 object-cover" />
          <CardTitle className="text-xl">Teacher Portal</CardTitle>
          <CardDescription>Good Shepherd International School</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="teacher@school.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherLogin;
