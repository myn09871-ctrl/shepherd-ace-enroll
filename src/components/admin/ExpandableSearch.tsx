import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const ExpandableSearch = ({ 
  value, 
  onChange, 
  placeholder = "Search...",
  className 
}: ExpandableSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleBlur = () => {
    if (!value) {
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setIsExpanded(false);
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      {isExpanded ? (
        <div className="flex items-center gap-2 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="h-9 w-48 md:w-64 pl-9 pr-8 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {value && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 group"
          aria-label="Open search"
        >
          <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      )}
    </div>
  );
};

export default ExpandableSearch;
