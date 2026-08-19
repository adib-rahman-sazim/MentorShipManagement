import NumberInput from "@/shared/components/Form/NumberInput";
import { PasswordInput } from "@/shared/components/Form/PasswordInput";
import PhoneNumberInput from "@/shared/components/Form/PhoneNumberInput";
import ProjectDatePicker from "@/shared/components/Form/ProjectDatePicker";
import { Button } from "@/shared/components/shadui/button";
import { Checkbox } from "@/shared/components/shadui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/shared/components/shadui/combobox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadui/form";
import { Input } from "@/shared/components/shadui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/shadui/input-otp";
import { RadioGroup, RadioGroupItem } from "@/shared/components/shadui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadui/select";
import { Slider } from "@/shared/components/shadui/slider";
import { Switch } from "@/shared/components/shadui/switch";
import { Textarea } from "@/shared/components/shadui/textarea";

import {
  COMPONENT_EXAMPLES_FORM_ID,
  COMPONENT_EXAMPLES_OTP_LENGTH,
  COMPONENT_EXAMPLES_OTP_SLOT_KEYS,
  COMPONENT_EXAMPLES_PLAN_OPTIONS,
  COMPONENT_EXAMPLES_ROLE_OPTIONS,
  COMPONENT_EXAMPLES_SLIDER_MAX,
  COMPONENT_EXAMPLES_SLIDER_MIN,
  COMPONENT_EXAMPLES_TAG_OPTIONS,
} from "./ComponentExamplesForm.constants";
import { EComponentExampleTag } from "./ComponentExamplesForm.enums";
import { useComponentExamplesForm } from "./ComponentExamplesForm.hooks";

const ComponentExamplesForm = () => {
  const { form, onSubmit, submittedJson } = useComponentExamplesForm();
  const isSubmitting = form.formState.isSubmitting;
  const tagsAnchor = useComboboxAnchor();

  return (
    <Form {...form}>
      <form
        id={COMPONENT_EXAMPLES_FORM_ID}
        onSubmit={onSubmit}
        className="grid w-full min-w-0 gap-6 md:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input disabled={isSubmitting} placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  disabled={isSubmitting}
                  placeholder="jane@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput disabled={isSubmitting} placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel>Age</FormLabel>
              <FormControl>
                <NumberInput
                  disabled={isSubmitting}
                  placeholder="30"
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={120}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="min-w-0 md:col-span-2">
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <PhoneNumberInput
                  className="min-w-0"
                  disabled={isSubmitting}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>Stored as E.164 (e.g. +15551234567).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="min-w-0 md:col-span-2">
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isSubmitting}
                  placeholder="Tell us a little about yourself"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel>Role</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder="Select a role"
                      renderValue={(value) =>
                        COMPONENT_EXAMPLES_ROLE_OPTIONS.find((opt) => opt.value === value)?.label ??
                        String(value)
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMPONENT_EXAMPLES_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel>Tags</FormLabel>
              <Combobox
                multiple
                value={field.value}
                onValueChange={(value) => field.onChange(value as EComponentExampleTag[])}
                disabled={isSubmitting}
              >
                <FormControl>
                  <ComboboxChips ref={tagsAnchor} className="min-h-9 w-full">
                    <ComboboxValue>
                      {(values: EComponentExampleTag[]) => (
                        <>
                          {values.map((value) => (
                            <ComboboxChip key={value}>
                              {COMPONENT_EXAMPLES_TAG_OPTIONS.find(
                                (option) => option.value === value,
                              )?.label ?? value}
                            </ComboboxChip>
                          ))}
                          <ComboboxChipsInput
                            disabled={isSubmitting}
                            placeholder={values.length === 0 ? "Select tags" : ""}
                            className="min-w-[6rem] flex-1"
                          />
                        </>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>
                </FormControl>
                <ComboboxContent anchor={tagsAnchor}>
                  <ComboboxEmpty>No tags found.</ComboboxEmpty>
                  <ComboboxList>
                    {COMPONENT_EXAMPLES_TAG_OPTIONS.map((option) => (
                      <ComboboxItem key={option.value} value={option.value}>
                        {option.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plan"
          render={({ field }) => (
            <FormItem className="min-w-0 md:col-span-2">
              <FormLabel>Plan</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                  className="flex flex-wrap gap-4"
                >
                  {COMPONENT_EXAMPLES_PLAN_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <RadioGroupItem value={option.value} />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startDate"
          render={({ field, fieldState }) => (
            <FormItem className="min-w-0">
              <FormControl>
                <ProjectDatePicker
                  label="Start date"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="satisfaction"
          render={({ field }) => (
            <FormItem className="min-w-0">
              <FormLabel>Satisfaction ({field.value})</FormLabel>
              <FormControl>
                <Slider
                  min={COMPONENT_EXAMPLES_SLIDER_MIN}
                  max={COMPONENT_EXAMPLES_SLIDER_MAX}
                  value={[field.value]}
                  onValueChange={(value) => {
                    const nextValue = Array.isArray(value) ? value[0] : value;
                    if (typeof nextValue === "number") {
                      field.onChange(nextValue);
                    }
                  }}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem className="min-w-0 md:col-span-2">
              <FormLabel>One-time password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={COMPONENT_EXAMPLES_OTP_LENGTH}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  containerClassName="flex-wrap"
                >
                  <InputOTPGroup className="flex-wrap">
                    {COMPONENT_EXAMPLES_OTP_SLOT_KEYS.map((slotKey, index) => (
                      <InputOTPSlot key={slotKey} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptedTerms"
          render={({ field }) => (
            <FormItem className="flex min-w-0 flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="min-w-0 space-y-1 leading-none">
                <FormLabel>Accept terms</FormLabel>
                <FormDescription>You agree to the demo terms of use.</FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationsEnabled"
          render={({ field }) => (
            <FormItem className="flex min-w-0 flex-row items-center justify-between rounded-md border border-border p-4">
              <div className="min-w-0 space-y-1 pe-3">
                <FormLabel>Email notifications</FormLabel>
                <FormDescription>Receive product updates by email.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="min-w-0 space-y-4 md:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            Submit examples form
          </Button>
          {submittedJson ? (
            <div className="space-y-2 rounded-md border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">Validated JSON output</p>
              <pre
                data-testid="component-examples-form-json"
                className="max-w-full overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground"
              >
                {submittedJson}
              </pre>
            </div>
          ) : null}
        </div>
      </form>
    </Form>
  );
};

export default ComponentExamplesForm;
