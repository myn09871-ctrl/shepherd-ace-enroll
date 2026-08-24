import schoolCrest from "@/assets/school-crest.jpeg";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading" }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <img
          src={schoolCrest}
          alt="Good Shepherd International School crest"
          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover animate-pulse"
          style={{ animationDuration: "1.8s" }}
        />

        <div className="text-center">
          <p className="eyebrow">Established 1992</p>
          <h1 className="mt-2 font-heading text-base md:text-lg font-semibold text-foreground">
            Good Shepherd International School
          </h1>
          <div className="rule-gold mx-auto my-4" />
          <p className="text-xs md:text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
