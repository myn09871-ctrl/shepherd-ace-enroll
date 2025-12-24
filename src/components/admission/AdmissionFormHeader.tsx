import schoolCrest from "@/assets/school-crest.jpeg";

interface AdmissionFormHeaderProps {
  referenceNumber: string;
  currentPage: number;
}

const AdmissionFormHeader = ({ referenceNumber, currentPage }: AdmissionFormHeaderProps) => {
  return (
    <div className="bg-hero-gradient text-primary-foreground py-8 px-6 rounded-t-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={schoolCrest}
            alt="Good Shepherd International School Crest"
            className="h-20 w-auto object-contain rounded-lg bg-white p-1"
          />
          <div className="text-center md:text-left">
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl uppercase tracking-wide">
              Good Shepherd International School
            </h1>
            <p className="font-heading italic text-lg opacity-90">In God We Trust</p>
            <p className="text-sm opacity-80 mt-1">
              Mallam, New Gbawe - 100 meters from LAFA Police Station
            </p>
          </div>
        </div>
        <div className="text-center md:text-right">
          <div className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-bold text-sm mb-2">
            FREE ADMISSION - Academic Year 2025/2026
          </div>
          <p className="text-xs opacity-80">Application Reference:</p>
          <p className="font-mono font-bold text-lg">{referenceNumber}</p>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Page {currentPage} of 2</span>
          <span>{currentPage === 1 ? "50%" : "100%"} Complete</span>
        </div>
        <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500"
            style={{ width: currentPage === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdmissionFormHeader;
