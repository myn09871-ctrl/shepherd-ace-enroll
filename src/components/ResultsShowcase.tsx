import { Award, TrendingUp, Star } from "lucide-react";

const ResultsShowcase = () => {
  const results = [
    { id: "0129036003", english: 1, social: 2, rme: 1, maths: 1, science: 1, career: 1, cad: 1, computing: 1, twi: 2, aggregate: 7 },
    { id: "0129036004", english: 1, social: 2, rme: 2, maths: 1, science: 1, career: 1, cad: 1, computing: 1, twi: 2, aggregate: 7 },
    { id: "0129036006", english: 1, social: 2, rme: 2, maths: 1, science: 1, career: 1, cad: 3, computing: 1, twi: 2, aggregate: 7 },
    { id: "0129036005", english: 1, social: 2, rme: 2, maths: 1, science: 1, career: 1, cad: 1, computing: 2, twi: 2, aggregate: 7 },
    { id: "0129036002", english: 1, social: 2, rme: 2, maths: 2, science: 1, career: 1, cad: 1, computing: 1, twi: 2, aggregate: 8 },
    { id: "0129036007", english: 1, social: 3, rme: 2, maths: 1, science: 1, career: 1, cad: 3, computing: 2, twi: 2, aggregate: 9 },
    { id: "0129036001", english: 1, social: 3, rme: 2, maths: 1, science: 2, career: 1, cad: 1, computing: 1, twi: 3, aggregate: 9 },
  ];

  const subjects = [
    { key: "english", label: "English" },
    { key: "social", label: "Social Studies" },
    { key: "rme", label: "R.M.E" },
    { key: "maths", label: "Maths" },
    { key: "science", label: "Science" },
    { key: "career", label: "Career Tech" },
    { key: "cad", label: "C.A.D" },
    { key: "computing", label: "Computing" },
    { key: "twi", label: "Twi" },
  ];

  return (
    <section id="results" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 animate-fade-up">
            <Award className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-semibold">Academic Excellence</span>
          </div>
          
          <h2 className="font-heading text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 animate-fade-up animation-delay-100">
            100% BECE{" "}
            <span className="text-primary">Distinction</span> Rate
          </h2>
          
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground animate-fade-up animation-delay-200">
            Our students consistently achieve outstanding results. All seven candidates 
            in our recent BECE examination achieved aggregate scores between 07 and 09.
          </p>
        </div>

        {/* Results Table */}
        <div className="bg-card rounded-2xl shadow-elevated overflow-hidden animate-fade-up animation-delay-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-4 py-4 text-left font-semibold text-sm">
                    Candidate No.
                  </th>
                  {subjects.map((subject) => (
                    <th key={subject.key} className="px-3 py-4 text-center font-semibold text-sm whitespace-nowrap">
                      {subject.label}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center font-bold text-sm bg-accent text-accent-foreground">
                    Aggregate
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={result.id}
                    className={`border-b border-border last:border-0 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/30"
                    } hover:bg-muted/50 transition-colors`}
                  >
                    <td className="px-4 py-4 font-mono text-sm font-medium text-foreground">
                      {result.id}
                    </td>
                    {subjects.map((subject) => {
                      const grade = result[subject.key as keyof typeof result] as number;
                      return (
                        <td key={subject.key} className="px-3 py-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                              grade === 1
                                ? "bg-secondary text-secondary-foreground"
                                : grade === 2
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {grade}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold text-lg shadow-soft">
                        {String(result.aggregate).padStart(2, "0")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-card rounded-xl p-6 shadow-card text-center animate-fade-up animation-delay-400">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
              <TrendingUp className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">100%</h3>
            <p className="text-muted-foreground">Pass Rate</p>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-card text-center animate-fade-up animation-delay-500">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/20 text-secondary mb-4">
              <Star className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">07-09</h3>
            <p className="text-muted-foreground">Aggregate Range</p>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-card text-center animate-fade-up animation-delay-600">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/20 text-accent-foreground mb-4">
              <Award className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">7/7</h3>
            <p className="text-muted-foreground">Students with Distinction</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsShowcase;
