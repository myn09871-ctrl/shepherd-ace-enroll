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
  relationshipOptions,
  securityQuestions,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-8 p-6">
      {/* Student Personal Information */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Student Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="student_surname">Surname *</Label>
            <Input id="student_surname" {...register("student_surname")} placeholder="Enter surname" />
            {errors.student_surname && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.student_surname)}</p>}
          </div>
          <div>
            <Label htmlFor="student_first_name">First Name *</Label>
            <Input id="student_first_name" {...register("student_first_name")} placeholder="Enter first name" />
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
          <div className="md:col-span-2">
            <Label htmlFor="student_place_of_birth">Place of Birth (City, Region)</Label>
            <Input id="student_place_of_birth" {...register("student_place_of_birth")} placeholder="e.g., Accra, Greater Accra" />
          </div>
        </div>
      </section>

      {/* Primary Guardian Information */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Primary Guardian Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Relationship to Student *</Label>
            <Select onValueChange={(val) => setValue("guardian1_relationship", val)} value={watch("guardian1_relationship")}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((rel) => (
                  <SelectItem key={rel} value={rel.toLowerCase()}>{rel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.guardian1_relationship && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.guardian1_relationship)}</p>}
          </div>
          <div>
            <Label htmlFor="guardian1_full_name">Full Name *</Label>
            <Input id="guardian1_full_name" {...register("guardian1_full_name")} placeholder="Enter full name" />
            {errors.guardian1_full_name && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.guardian1_full_name)}</p>}
          </div>
          <div>
            <Label htmlFor="guardian1_occupation">Occupation</Label>
            <Input id="guardian1_occupation" {...register("guardian1_occupation")} placeholder="Enter occupation" />
          </div>
          <div>
            <Label htmlFor="guardian1_employer">Employer</Label>
            <Input id="guardian1_employer" {...register("guardian1_employer")} placeholder="Enter employer name" />
          </div>
          <div>
            <Label htmlFor="guardian1_phone_primary">Primary Phone *</Label>
            <Input id="guardian1_phone_primary" {...register("guardian1_phone_primary")} placeholder="+233..." />
            {errors.guardian1_phone_primary && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.guardian1_phone_primary)}</p>}
          </div>
          <div>
            <Label htmlFor="guardian1_phone_secondary">Secondary Phone</Label>
            <Input id="guardian1_phone_secondary" {...register("guardian1_phone_secondary")} placeholder="+233..." />
          </div>
          <div>
            <Label htmlFor="guardian1_email">Email Address *</Label>
            <Input id="guardian1_email" type="email" {...register("guardian1_email")} placeholder="email@example.com" />
            {errors.guardian1_email && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.guardian1_email)}</p>}
          </div>
          <div>
            <Label htmlFor="guardian1_landmark">Nearest Landmark</Label>
            <Input id="guardian1_landmark" {...register("guardian1_landmark")} placeholder="e.g., Near the market" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="guardian1_address">Residential Address *</Label>
            <Textarea id="guardian1_address" {...register("guardian1_address")} placeholder="House number, street, area, city, region" />
            {errors.guardian1_address && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.guardian1_address)}</p>}
          </div>
          <div>
            <Label htmlFor="guardian1_workplace_address">Workplace Address</Label>
            <Input id="guardian1_workplace_address" {...register("guardian1_workplace_address")} placeholder="Enter workplace address" />
          </div>
          <div>
            <Label htmlFor="guardian1_workplace_phone">Workplace Phone</Label>
            <Input id="guardian1_workplace_phone" {...register("guardian1_workplace_phone")} placeholder="+233..." />
          </div>
        </div>
      </section>

      {/* Parent Portal Account - NEW SECTION */}
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
          <div>
            <Label>Security Question *</Label>
            <Select onValueChange={(val) => setValue("security_question", val)} value={watch("security_question")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a security question" />
              </SelectTrigger>
              <SelectContent>
                {securityQuestions.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.security_question && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.security_question)}</p>}
          </div>
          <div>
            <Label htmlFor="security_answer">Security Answer *</Label>
            <Input id="security_answer" {...register("security_answer")} placeholder="Your answer (case-sensitive)" />
            {errors.security_answer && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.security_answer)}</p>}
          </div>
        </div>
      </section>

      {/* Secondary Guardian Information */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Secondary Guardian Information (Optional)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guardian2_full_name">Full Name</Label>
            <Input id="guardian2_full_name" {...register("guardian2_full_name")} placeholder="Enter full name" />
          </div>
          <div>
            <Label>Relationship to Student</Label>
            <Select onValueChange={(val) => setValue("guardian2_relationship", val)} value={watch("guardian2_relationship") || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((rel) => (
                  <SelectItem key={rel} value={rel.toLowerCase()}>{rel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="guardian2_phone_primary">Primary Phone</Label>
            <Input id="guardian2_phone_primary" {...register("guardian2_phone_primary")} placeholder="+233..." />
          </div>
          <div>
            <Label htmlFor="guardian2_email">Email Address</Label>
            <Input id="guardian2_email" type="email" {...register("guardian2_email")} placeholder="email@example.com" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="guardian2_address">Residential Address</Label>
            <Textarea id="guardian2_address" {...register("guardian2_address")} placeholder="House number, street, area, city, region" />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <Checkbox
              id="guardian2_is_emergency_contact"
              checked={watch("guardian2_is_emergency_contact")}
              onCheckedChange={(checked) => setValue("guardian2_is_emergency_contact", checked as boolean)}
            />
            <Label htmlFor="guardian2_is_emergency_contact" className="font-normal">
              Authorize as emergency contact for student pickup and medical decisions
            </Label>
          </div>
        </div>
      </section>

      {/* Educational Background */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Educational Background
        </h2>
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            id="is_first_time_enrollment"
            checked={isFirstTimeEnrollment}
            onCheckedChange={(checked) => setValue("is_first_time_enrollment", checked as boolean)}
          />
          <Label htmlFor="is_first_time_enrollment" className="font-normal">
            First Time School Enrollment
          </Label>
        </div>
        
        {!isFirstTimeEnrollment && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="previous_school_name">Previous School Name</Label>
              <Input id="previous_school_name" {...register("previous_school_name")} placeholder="Enter school name" />
            </div>
            <div>
              <Label htmlFor="previous_school_location">School Location</Label>
              <Input id="previous_school_location" {...register("previous_school_location")} placeholder="City, Region" />
            </div>
            <div>
              <Label>Last Grade/Class Completed</Label>
              <Select onValueChange={(val) => setValue("last_grade_completed", val)} value={watch("last_grade_completed") || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {programLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="md:col-span-2">
              <Label htmlFor="reason_for_change">Reason for School Change</Label>
              <Textarea id="reason_for_change" {...register("reason_for_change")} placeholder="Why are you seeking enrollment at Good Shepherd?" />
            </div>
          </div>
        )}
      </section>

      {/* Program Selection */}
      <section>
        <h2 className="font-heading text-xl font-bold text-primary mb-4 pb-2 border-b border-border">
          Program Selection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Educational Level *</Label>
            <Select onValueChange={(val) => setValue("program_level", val)} value={watch("program_level")}>
              <SelectTrigger>
                <SelectValue placeholder="Select program level" />
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
          <div className="md:col-span-2">
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
        </div>
      </section>
    </div>
  );
};

export default FormPage1;
