import schoolCrest from "@/assets/school-crest.jpeg";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading..." }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-500" />

      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Rotating ring */}
        <div className="relative">
          <div className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full animate-spin" style={{ animationDuration: "8s" }} />
          <div className="absolute inset-0 border-2 border-primary/30 rounded-full scale-110 animate-pulse" />
          
          {/* School crest with pulse animation */}
          <img
            src={schoolCrest}
            alt="Good Shepherd International School"
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-elevated animate-pulse"
            style={{ animationDuration: "2s" }}
          />
        </div>

        {/* School name */}
        <div className="text-center">
          <h1 className="font-heading text-lg md:text-xl font-bold text-primary">
            Good Shepherd International School
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{message}</p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
