import { UseFormReturn, FieldError } from "react-hook-form";
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
import {
  Page1Data,
  programLevels,
  careerTrainingOptions,
  
  medicalConditions,
  immunizationsList,
  subjectCategories,
} from "@/lib/admission-schema";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";

interface FormPage1Props {
  form: UseFormReturn<Page1Data>;
}

const getErrorMessage = (error: FieldError | undefined): string | undefined => {
  return error?.message;
};

const FormPage1 = ({ form }: FormPage1Props) => {
  const { register, watch, setValue, formState: { errors } } = form;
  const isFirstTimeEnrollment = watch("is_first_time_enrollment");
  const hasMedicalConditions = watch("has_medical_conditions");
  const hasAllergies = watch("has_allergies");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-8 p-6">
      {/* SECTION A: Child's Personal Data */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
          SECTION A: Child's Personal Data
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label htmlFor="student_surname">Surname *</Label>
            <Input id="student_surname" {...register("student_surname")} placeholder="Enter surname" />
            {errors.student_surname && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.student_surname)}</p>}
          </div>
          <div>
            <Label htmlFor="student_first_name">Other Names *</Label>
            <Input id="student_first_name" {...register("student_first_name")} placeholder="Enter other names" />
            {errors.student_first_name && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.student_first_name)}</p>}
          </div>
          <div>
            <Label htmlFor="student_middle_name">Middle Name</Label>
            <Input id="student_middle_name" {...register("student_middle_name")} placeholder="Enter middle name" />
          </div>
          <div>
            <Label htmlFor="student_dob">Date of Birth *</Label>
            <Input id="student_dob" type="date" {...register("student_dob")} />
            {errors.student_dob && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.student_dob)}</p>}
          </div>
          <div>
            <Label>Gender *</Label>
            <Select onValueChange={(val) => setValue("student_gender", val)} value={watch("student_gender")}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.student_gender && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.student_gender)}</p>}
          </div>
          <div>
            <Label htmlFor="student_nationality">Nationality *</Label>
            <Input id="student_nationality" {...register("student_nationality")} placeholder="e.g., Ghanaian" />
            {errors.student_nationality && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.student_nationality)}</p>}
          </div>
          <div>
            <Label htmlFor="student_place_of_birth">Place of Birth</Label>
            <Input id="student_place_of_birth" {...register("student_place_of_birth")} placeholder="City, Region" />
          </div>
          <div>
            <Label htmlFor="student_hometown">Hometown</Label>
            <Input id="student_hometown" {...register("student_hometown")} placeholder="Enter hometown" />
          </div>
          <div>
            <Label htmlFor="student_religion">Religion</Label>
            <Input id="student_religion" {...register("student_religion")} placeholder="e.g., Christian, Muslim" />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="student_languages_spoken">Language(s) Spoken</Label>
            <Input id="student_languages_spoken" {...register("student_languages_spoken")} placeholder="e.g., English, Twi, Ga" />
          </div>
        </div>
      </section>

      {/* SECTION B: Health Status of Child */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
          SECTION B: Health Status of Child
        </h2>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="has_medical_conditions"
              checked={hasMedicalConditions}
              onCheckedChange={(checked) => setValue("has_medical_conditions", checked as boolean)}
            />
            <Label htmlFor="has_medical_conditions" className="font-normal">
              Does your child have any health problems or defects?
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
            <Textarea id="current_medications" {...register("current_medications")} placeholder="Drug name, dosage, frequency..." />
          </div>

          {/* Immunization Checklist */}
          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-3">Immunization Record (tick those received)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
              {immunizationsList.map((imm) => (
                <div key={imm.key} className="flex items-center gap-2">
                  <Checkbox
                    id={imm.key}
                    checked={watch(imm.key)}
                    onCheckedChange={(checked) => setValue(imm.key, checked as boolean)}
                  />
                  <Label htmlFor={imm.key} className="font-normal text-sm">{imm.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 mt-4">
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
        </div>
      </section>

      {/* SECTION C: Record of Previous School(s) Attended */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
          SECTION C: Record of Previous School(s) Attended
        </h2>
        <div className="mt-4">
          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              id="is_first_time_enrollment"
              checked={isFirstTimeEnrollment}
              onCheckedChange={(checked) => setValue("is_first_time_enrollment", checked as boolean)}
            />
            <Label htmlFor="is_first_time_enrollment" className="font-normal">
              First Time School Enrollment (no previous school)
            </Label>
          </div>

          {!isFirstTimeEnrollment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="previous_school_name">Name of School</Label>
                <Input id="previous_school_name" {...register("previous_school_name")} placeholder="Enter school name" />
              </div>
              <div>
                <Label htmlFor="previous_school_location">Address / Location</Label>
                <Input id="previous_school_location" {...register("previous_school_location")} placeholder="City, Region" />
              </div>
              <div>
                <Label htmlFor="previous_school_date_attended">Date Attended</Label>
                <Input id="previous_school_date_attended" {...register("previous_school_date_attended")} placeholder="e.g., 2022 - 2025" />
              </div>
              <div>
                <Label htmlFor="previous_school_last_class">Last Class Attended</Label>
                <Input id="previous_school_last_class" {...register("previous_school_last_class")} placeholder="e.g., Primary 3" />
              </div>
              <div>
                <Label>Academic Performance</Label>
                <Select onValueChange={(val) => setValue("academic_performance", val)} value={watch("academic_performance") || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reason_for_change">Reason for Changing School</Label>
                <Input id="reason_for_change" {...register("reason_for_change")} placeholder="Why are you seeking enrollment?" />
              </div>
            </div>
          )}

          {/* Applying For Admission To Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
            <div>
              <Label>Applying For Admission To Class *</Label>
              <Select onValueChange={(val) => setValue("program_level", val)} value={watch("program_level")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {programLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.program_level && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.program_level)}</p>}
            </div>
            <div>
              <Label htmlFor="intended_start_date">Intended Start Date</Label>
              <Input id="intended_start_date" type="date" {...register("intended_start_date")} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: Subjects Studied in Previous School */}
      {!isFirstTimeEnrollment && (
        <section>
          <h2 className="font-heading text-xl font-bold text-primary mb-1 pb-2 border-b border-border">
            SECTION D: Subjects Studied in Previous School
          </h2>
          <p className="text-sm text-muted-foreground mt-2 mb-4">Tick the subjects studied at the previous school.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjectCategories.map((cat) => (
              <div key={cat.category} className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-sm mb-3">{cat.category}</h3>
                <div className="space-y-2">
                  {cat.subjects.map((subject) => (
                    <div key={subject} className="flex items-center gap-2">
                      <Checkbox
                        id={`subject-${subject}`}
                        checked={watch("subjects_studied")?.includes(subject)}
                        onCheckedChange={(checked) => {
                          const current = watch("subjects_studied") || [];
                          if (checked) {
                            setValue("subjects_studied", [...current, subject]);
                          } else {
                            setValue("subjects_studied", current.filter((i) => i !== subject));
                          }
                        }}
                      />
                      <Label htmlFor={`subject-${subject}`} className="font-normal text-sm">{subject}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Career Training Interests */}
          <div className="mt-4">
            <Label className="mb-2 block">Additional Career Training Interest</Label>
            <p className="text-sm text-muted-foreground mb-3">These supplementary offerings enhance the core academic curriculum.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {careerTrainingOptions.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`career-${option}`}
                    checked={watch("career_training_interests")?.includes(option)}
                    onCheckedChange={(checked) => {
                      const current = watch("career_training_interests") || [];
                      if (checked) {
                        setValue("career_training_interests", [...current, option]);
                      } else {
                        setValue("career_training_interests", current.filter((i) => i !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`career-${option}`} className="font-normal text-sm">{option}</Label>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Parent Portal Account - DIGITAL-ONLY, UNCHANGED */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Parent Portal Account
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Create your login credentials for the Parent Portal. After enrollment approval, you'll use these to access your child's academic information, attendance, and school communications.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="portal_email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Portal Email Address *
            </Label>
            <Input
              id="portal_email"
              type="email"
              {...register("portal_email")}
              placeholder="This email will be your username for portal login"
            />
            {errors.portal_email && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.portal_email)}</p>}
          </div>
          <div>
            <Label htmlFor="portal_password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Create Password *
            </Label>
            <div className="relative">
              <Input
                id="portal_password"
                type={showPassword ? "text" : "password"}
                {...register("portal_password")}
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.portal_password && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.portal_password)}</p>}
            <p className="text-xs text-muted-foreground mt-1">Use at least 8 characters with a mix of letters and numbers</p>
          </div>
          <div>
            <Label htmlFor="portal_password_confirm" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm Password *
            </Label>
            <div className="relative">
              <Input
                id="portal_password_confirm"
                type={showConfirmPassword ? "text" : "password"}
                {...register("portal_password_confirm")}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.portal_password_confirm && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.portal_password_confirm)}</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormPage1;
