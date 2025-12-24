import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Page2Data, medicalConditions, specialNeedsOptions } from "@/lib/admission-schema";

interface FormPage2Props {
  form: UseFormReturn<Page2Data>;
}

const FormPage2 = ({ form }: FormPage2Props) => {
  const { register, watch, setValue, formState: { errors } } = form;
  const hasMedicalConditions = watch("has_medical_conditions");
  const hasAllergies = watch("has_allergies");
  const hasSpecialNeeds = watch("has_special_needs");

  return (
    <div className="space-y-8 p-6">
      {/* Health and Medical Information */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Health and Medical Information
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="has_medical_conditions"
              checked={hasMedicalConditions}
              onCheckedChange={(checked) => setValue("has_medical_conditions", checked as boolean)}
            />
            <Label htmlFor="has_medical_conditions" className="font-normal">
              Does your child have any known medical conditions?
            </Label>
          </div>
          
          {hasMedicalConditions && (
            <div className="ml-6 space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {medicalConditions.map((condition) => (
                  <div key={condition} className="flex items-center gap-2">
                    <Checkbox
                      id={`condition-${condition}`}
                      checked={watch("medical_conditions")?.includes(condition)}
                      onCheckedChange={(checked) => {
                        const current = watch("medical_conditions") || [];
                        if (checked) {
                          setValue("medical_conditions", [...current, condition]);
                        } else {
                          setValue("medical_conditions", current.filter((i) => i !== condition));
                        }
                      }}
                    />
                    <Label htmlFor={`condition-${condition}`} className="font-normal text-sm">{condition}</Label>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="medical_conditions_details">Details (severity, triggers, management)</Label>
                <Textarea id="medical_conditions_details" {...register("medical_conditions_details")} placeholder="Please provide additional details..." />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="has_allergies"
              checked={hasAllergies}
              onCheckedChange={(checked) => setValue("has_allergies", checked as boolean)}
            />
            <Label htmlFor="has_allergies" className="font-normal">
              Does your child have any allergies?
            </Label>
          </div>
          
          {hasAllergies && (
            <div className="ml-6 p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="allergies">Describe allergies (food, medication, environmental, severity)</Label>
              <Textarea id="allergies" {...register("allergies")} placeholder="List allergies and their severity..." />
            </div>
          )}

          <div>
            <Label htmlFor="current_medications">Current Medications (if any)</Label>
            <Textarea id="current_medications" {...register("current_medications")} placeholder="Drug name, dosage, frequency, administering instructions..." />
          </div>
        </div>
      </section>

      {/* Immunization Status */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Immunization Status
        </h2>
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="immunization_up_to_date"
            checked={watch("immunization_up_to_date")}
            onCheckedChange={(checked) => setValue("immunization_up_to_date", checked as boolean)}
          />
          <Label htmlFor="immunization_up_to_date" className="font-normal">
            Is your child up to date with all required immunizations according to Ghana Health Service guidelines?
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Note: Vaccination card must be submitted regardless of status. If vaccinations are not up to date, 
          proof of scheduled catch-up vaccinations may be required before final enrollment approval.
        </p>
        
        <div className="mt-4 flex items-start gap-2">
          <Checkbox
            id="medical_authorization"
            checked={watch("medical_authorization")}
            onCheckedChange={(checked) => setValue("medical_authorization", checked as boolean)}
          />
          <Label htmlFor="medical_authorization" className="font-normal text-sm">
            I authorize school staff to administer prescribed medications and seek emergency medical treatment 
            if I cannot be reached immediately.
          </Label>
        </div>
      </section>

      {/* Special Educational Needs */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Special Educational Needs
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Good Shepherd International School is committed to supporting diverse learners. 
          Please share any information that will help us provide the best educational experience for your child.
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="has_special_needs"
            checked={hasSpecialNeeds}
            onCheckedChange={(checked) => setValue("has_special_needs", checked as boolean)}
          />
          <Label htmlFor="has_special_needs" className="font-normal">
            Does your child have any diagnosed learning differences, developmental considerations, or require educational support?
          </Label>
        </div>
        
        {hasSpecialNeeds && (
          <div className="ml-6 space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              {specialNeedsOptions.map((need) => (
                <div key={need} className="flex items-center gap-2">
                  <Checkbox
                    id={`need-${need}`}
                    checked={watch("special_needs_types")?.includes(need)}
                    onCheckedChange={(checked) => {
                      const current = watch("special_needs_types") || [];
                      if (checked) {
                        setValue("special_needs_types", [...current, need]);
                      } else {
                        setValue("special_needs_types", current.filter((i) => i !== need));
                      }
                    }}
                  />
                  <Label htmlFor={`need-${need}`} className="font-normal text-sm">{need}</Label>
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="special_needs_details">Additional Details</Label>
              <Textarea 
                id="special_needs_details" 
                {...register("special_needs_details")} 
                placeholder="Describe specific manifestations, successful strategies, therapeutic supports, and recommended accommodations..." 
              />
            </div>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground mt-4 italic">
          Disclosure enables proactive support planning and does not negatively impact admission decisions.
        </p>
      </section>

      {/* Financial Acknowledgment */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Financial Acknowledgment
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">✓ Covered Expenses</h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Registration fees</li>
              <li>• Tuition for first academic year</li>
              <li>• Admission processing</li>
            </ul>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠ Non-Covered Expenses</h3>
            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Uniforms</li>
              <li>• Textbooks and materials</li>
              <li>• Examination fees</li>
              <li>• Extracurricular activities</li>
              <li>• Transportation services</li>
              <li>• Meal programs</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="financial_acknowledgment"
              checked={watch("financial_acknowledgment")}
              onCheckedChange={(checked) => setValue("financial_acknowledgment", checked as boolean)}
            />
            <Label htmlFor="financial_acknowledgment" className="font-normal text-sm">
              I have reviewed the fee structure and understand my financial responsibilities for expenses 
              not covered under the free admission promotion. *
            </Label>
          </div>
          {errors.financial_acknowledgment && <p className="text-destructive text-sm ml-6">{errors.financial_acknowledgment.message}</p>}
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="financial_assistance_interest"
              checked={watch("financial_assistance_interest")}
              onCheckedChange={(checked) => setValue("financial_assistance_interest", checked as boolean)}
            />
            <Label htmlFor="financial_assistance_interest" className="font-normal text-sm">
              I am interested in learning about financial assistance options for ongoing expenses
            </Label>
          </div>
        </div>
      </section>

      {/* Transportation */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Transportation Requirements
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>How will your child commute to and from school?</Label>
            <Select onValueChange={(val) => setValue("transportation_method", val)} value={watch("transportation_method") || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select transportation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private Arrangement</SelectItem>
                <SelectItem value="school-bus">School Transportation Services</SelectItem>
                <SelectItem value="tbd">To Be Determined</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {watch("transportation_method") === "school-bus" && (
            <div>
              <Label htmlFor="pickup_location">Preferred Pickup Location</Label>
              <Input id="pickup_location" {...register("pickup_location")} placeholder="Location with landmark" />
            </div>
          )}
        </div>
      </section>

      {/* Declaration and Consent */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Declaration and Consent
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Checkbox
              id="consent_truthfulness"
              checked={watch("consent_truthfulness")}
              onCheckedChange={(checked) => setValue("consent_truthfulness", checked as boolean)}
            />
            <Label htmlFor="consent_truthfulness" className="font-normal text-sm">
              I certify that all information provided in this application is true, complete, and accurate 
              to the best of my knowledge. I understand that false information may result in application 
              rejection or enrollment cancellation. *
            </Label>
          </div>
          {errors.consent_truthfulness && <p className="text-destructive text-sm ml-6">{errors.consent_truthfulness.message}</p>}

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent_media"
              checked={watch("consent_media")}
              onCheckedChange={(checked) => setValue("consent_media", checked as boolean)}
            />
            <Label htmlFor="consent_media" className="font-normal text-sm">
              I grant permission for Good Shepherd International School to photograph or video record 
              my child during school activities for internal documentation and promotional materials 
              including website, social media, and publications.
            </Label>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent_records"
              checked={watch("consent_records")}
              onCheckedChange={(checked) => setValue("consent_records", checked as boolean)}
            />
            <Label htmlFor="consent_records" className="font-normal text-sm">
              I authorize the school to request transcripts from previous institutions and to share 
              student records with future educational institutions upon transfer or graduation. *
            </Label>
          </div>
          {errors.consent_records && <p className="text-destructive text-sm ml-6">{errors.consent_records.message}</p>}

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent_discipline"
              checked={watch("consent_discipline")}
              onCheckedChange={(checked) => setValue("consent_discipline", checked as boolean)}
            />
            <Label htmlFor="consent_discipline" className="font-normal text-sm">
              I have reviewed the school's code of conduct and agree to support behavioral expectations 
              and disciplinary measures. *
            </Label>
          </div>
          {errors.consent_discipline && <p className="text-destructive text-sm ml-6">{errors.consent_discipline.message}</p>}

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent_emergency"
              checked={watch("consent_emergency")}
              onCheckedChange={(checked) => setValue("consent_emergency", checked as boolean)}
            />
            <Label htmlFor="consent_emergency" className="font-normal text-sm">
              I authorize the school to take necessary action during emergency situations including 
              field trips, medical treatment, and safety evacuations when immediate parent contact 
              is not possible. *
            </Label>
          </div>
          {errors.consent_emergency && <p className="text-destructive text-sm ml-6">{errors.consent_emergency.message}</p>}

          <div className="flex items-start gap-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Checkbox
              id="consent_terms"
              checked={watch("consent_terms")}
              onCheckedChange={(checked) => setValue("consent_terms", checked as boolean)}
            />
            <Label htmlFor="consent_terms" className="font-normal text-sm font-medium">
              I accept the terms and conditions of enrollment at Good Shepherd International School 
              and commit to active partnership in my child's educational journey. *
            </Label>
          </div>
          {errors.consent_terms && <p className="text-destructive text-sm ml-6">{errors.consent_terms.message}</p>}
        </div>
      </section>
    </div>
  );
};

export default FormPage2;
