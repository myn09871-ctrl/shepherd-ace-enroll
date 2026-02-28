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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Page2Data,
  specialNeedsOptions,
  maritalStatusOptions,
  educationalQualifications,
  feePaymentPlans,
} from "@/lib/admission-schema";

interface FormPage2Props {
  form: UseFormReturn<Page2Data>;
}

const FamilyMemberColumn = ({
  title,
  prefix,
  form,
  showRelationship = false,
}: {
  title: string;
  prefix: "guardian1" | "guardian2" | "guardian3";
  form: UseFormReturn<Page2Data>;
  showRelationship?: boolean;
}) => {
  const { register, watch, setValue } = form;

  const nameField = prefix === "guardian3" ? `${prefix}_name` as const : `${prefix}_full_name` as const;
  const phoneField = prefix === "guardian1" ? `${prefix}_phone_primary` as const : prefix === "guardian2" ? `${prefix}_phone_primary` as const : `${prefix}_tel_no` as const;
  const addressField = prefix === "guardian3" ? `${prefix}_address` as const : `${prefix}_address` as const;

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
      <h3 className="font-semibold text-sm text-primary border-b border-border pb-2">{title}</h3>

      <div>
        <Label className="text-xs">Name {prefix === "guardian1" ? "*" : ""}</Label>
        <Input {...register(nameField)} placeholder="Full name" className="h-9 text-sm" />
      </div>

      {showRelationship && (
        <div>
          <Label className="text-xs">Relationship</Label>
          <Input {...register(`${prefix}_relationship` as any)} placeholder="e.g., Uncle" className="h-9 text-sm" />
        </div>
      )}

      <div>
        <Label className="text-xs">Occupation</Label>
        <Input {...register(`${prefix}_occupation` as any)} placeholder="Occupation" className="h-9 text-sm" />
      </div>

      <div>
        <Label className="text-xs">Educational Qualification</Label>
        <Select
          onValueChange={(val) => setValue(`${prefix}_educational_qualification` as any, val)}
          value={(watch(`${prefix}_educational_qualification` as any) as string) || ""}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {educationalQualifications.map((q) => (
              <SelectItem key={q} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Marital Status</Label>
        <Select
          onValueChange={(val) => setValue(`${prefix}_marital_status` as any, val)}
          value={(watch(`${prefix}_marital_status` as any) as string) || ""}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {maritalStatusOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Religion</Label>
        <Input {...register(`${prefix}_religion` as any)} placeholder="Religion" className="h-9 text-sm" />
      </div>

      <div>
        <Label className="text-xs">Address</Label>
        <Input {...register(addressField)} placeholder="Address" className="h-9 text-sm" />
      </div>

      <div>
        <Label className="text-xs">Tel No. {prefix === "guardian1" ? "*" : ""}</Label>
        <Input {...register(phoneField)} placeholder="+233..." className="h-9 text-sm" />
      </div>

      <div>
        <Label className="text-xs">Location</Label>
        <Input {...register(`${prefix}_location` as any)} placeholder="Location" className="h-9 text-sm" />
      </div>

      <div>
        <Label className="text-xs">House No.</Label>
        <Input {...register(`${prefix}_house_no` as any)} placeholder="House no." className="h-9 text-sm" />
      </div>

      {prefix !== "guardian3" && (
        <div>
          <Label className="text-xs">Email</Label>
          <Input {...register(`${prefix}_email` as any)} placeholder="email@example.com" className="h-9 text-sm" type="email" />
        </div>
      )}

      <div>
        <Label className="text-xs">No. of children in home</Label>
        <Input
          type="number"
          min={0}
          {...register(`${prefix}_children_in_home` as any, { valueAsNumber: true })}
          placeholder="0"
          className="h-9 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`${prefix}_other_children_in_school`}
          checked={watch(`${prefix}_other_children_in_school` as any) as boolean}
          onCheckedChange={(checked) => setValue(`${prefix}_other_children_in_school` as any, checked as boolean)}
        />
        <Label htmlFor={`${prefix}_other_children_in_school`} className="font-normal text-xs">
          Other children in this school?
        </Label>
      </div>

      {watch(`${prefix}_other_children_in_school` as any) && (
        <div className="ml-4 space-y-2">
          <div>
            <Label className="text-xs">How many?</Label>
            <Input {...register(`${prefix}_how_many_children` as any)} placeholder="Number" className="h-9 text-sm" />
          </div>
          {prefix !== "guardian3" && (
            <div>
              <Label className="text-xs">Which classes?</Label>
              <Input {...register(`${prefix}_children_classes` as any)} placeholder="e.g., Primary 2, KG 1" className="h-9 text-sm" />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Checkbox
          id={`${prefix}_responsible_for_fees`}
          checked={watch(`${prefix}_responsible_for_fees` as any) as boolean}
          onCheckedChange={(checked) => setValue(`${prefix}_responsible_for_fees` as any, checked as boolean)}
        />
        <Label htmlFor={`${prefix}_responsible_for_fees`} className="font-normal text-xs">
          Responsible for fee payment
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`${prefix}_pupil_lives_with`}
          checked={watch(`${prefix}_pupil_lives_with` as any) as boolean}
          onCheckedChange={(checked) => setValue(`${prefix}_pupil_lives_with` as any, checked as boolean)}
        />
        <Label htmlFor={`${prefix}_pupil_lives_with`} className="font-normal text-xs">
          Child presently lives with
        </Label>
      </div>
    </div>
  );
};

const FormPage2 = ({ form }: FormPage2Props) => {
  const { register, watch, setValue, formState: { errors } } = form;
  const hasSpecialNeeds = watch("has_special_needs");

  return (
    <div className="space-y-8 p-6">
      {/* SECTION E: Biological Family Data */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
          SECTION E: Biological Family Data
        </h2>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          Please provide details for the child's father, mother, and guardian (if applicable).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FamilyMemberColumn title="Father" prefix="guardian1" form={form} showRelationship />
          <FamilyMemberColumn title="Mother" prefix="guardian2" form={form} />
          <FamilyMemberColumn title="Guardian" prefix="guardian3" form={form} />
        </div>

        {/* Additional guardian2 fields */}
        <div className="mt-4 flex items-center gap-2">
          <Checkbox
            id="guardian2_is_emergency_contact"
            checked={watch("guardian2_is_emergency_contact")}
            onCheckedChange={(checked) => setValue("guardian2_is_emergency_contact", checked as boolean)}
          />
          <Label htmlFor="guardian2_is_emergency_contact" className="font-normal text-sm">
            Authorize mother as emergency contact for student pickup and medical decisions
          </Label>
        </div>
      </section>

      {/* SECTION F: Fee Payment Policy */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
          SECTION F: Fee Payment Policy
        </h2>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          Choose your preferred FLEXI Payment Plan:
        </p>
        <RadioGroup
          value={watch("fee_payment_plan") || ""}
          onValueChange={(val) => setValue("fee_payment_plan", val)}
          className="space-y-3"
        >
          {feePaymentPlans.map((plan) => (
            <div key={plan.value} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border">
              <RadioGroupItem value={plan.value} id={`fee-${plan.value}`} className="mt-0.5" />
              <div>
                <Label htmlFor={`fee-${plan.value}`} className="font-semibold text-sm">{plan.label}</Label>
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>

        {/* Financial acknowledgment */}
        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="financial_acknowledgment"
              checked={watch("financial_acknowledgment")}
              onCheckedChange={(checked) => setValue("financial_acknowledgment", checked as boolean)}
            />
            <Label htmlFor="financial_acknowledgment" className="font-normal text-sm">
              I have reviewed the fee structure and understand my financial responsibilities. *
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
              I am interested in learning about financial assistance options
            </Label>
          </div>
        </div>
      </section>

      {/* Special Educational Needs */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
          Special Educational Needs
        </h2>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          Good Shepherd International School is committed to supporting diverse learners.
        </p>
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="has_special_needs"
            checked={hasSpecialNeeds}
            onCheckedChange={(checked) => setValue("has_special_needs", checked as boolean)}
          />
          <Label htmlFor="has_special_needs" className="font-normal">
            Does your child have any diagnosed learning differences or require educational support?
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
              <Textarea id="special_needs_details" {...register("special_needs_details")} placeholder="Describe specific needs..." />
            </div>
          </div>
        )}
      </section>

      {/* Transportation */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
          Transportation
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>How will your child commute to school?</Label>
            <Select onValueChange={(val) => setValue("transportation_method", val)} value={watch("transportation_method") || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private Arrangement</SelectItem>
                <SelectItem value="school-bus">School Transportation</SelectItem>
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

      {/* SECTION G: Regulations */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
          SECTION G: Regulations
        </h2>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm space-y-3">
          <p>
            <strong>1.</strong> When a child's behaviour becomes destructive and therefore constitutes a danger to
            other pupils and the school community, the school reserves the right to dismiss such a pupil
            after notice has been given to the parents.
          </p>
          <p>
            <strong>2.</strong> Any parent who wishes to withdraw his/her child from the school should give at
            least one term's notice in writing to the Head Teacher. Fees already paid will not be refunded.
          </p>
          <p>
            <strong>3.</strong> Parents are expected to cooperate with the school in matters of discipline,
            attendance, and punctuality.
          </p>
        </div>
      </section>

      {/* SECTION H: Undertaking / Declaration and Consent */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
          SECTION H: Undertaking
        </h2>
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20 mb-4">
          <p className="text-sm">
            I, the undersigned parent/guardian, hereby apply for the admission of the above-named child
            into Good Shepherd International School. I declare that all information provided is true and
            correct to the best of my knowledge. I agree to abide by the rules and regulations of the school.
          </p>
          <p className="text-sm mt-2">
            Date: <strong>{new Date().toLocaleDateString()}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Checkbox
              id="consent_truthfulness"
              checked={watch("consent_truthfulness")}
              onCheckedChange={(checked) => setValue("consent_truthfulness", checked as boolean)}
            />
            <Label htmlFor="consent_truthfulness" className="font-normal text-sm">
              I certify that all information provided in this application is true, complete, and accurate. *
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
              I grant permission for the school to photograph or video record my child for school activities and promotional materials.
            </Label>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent_records"
              checked={watch("consent_records")}
              onCheckedChange={(checked) => setValue("consent_records", checked as boolean)}
            />
            <Label htmlFor="consent_records" className="font-normal text-sm">
              I authorize the school to request and share student records with educational institutions. *
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
              I agree to support the school's code of conduct and disciplinary measures. *
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
              I authorize the school to take necessary action during emergency situations. *
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
              I accept the terms and conditions of enrollment at Good Shepherd International School. *
            </Label>
          </div>
          {errors.consent_terms && <p className="text-destructive text-sm ml-6">{errors.consent_terms.message}</p>}
        </div>
      </section>
    </div>
  );
};

export default FormPage2;
