import { ASSIGNABLE_USER_ROLE_OPTIONS } from "@/modules/users/users.constants";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadui/select";

import {
  CHANGE_USER_ROLE_LABEL,
  CHANGE_USER_ROLE_PLACEHOLDER,
} from "./ChangeUserRoleForm.constants";
import { IChangeUserRoleFormFieldsProps } from "./ChangeUserRoleForm.interfaces";

const ChangeUserRoleFormFields = ({ form }: IChangeUserRoleFormFieldsProps) => (
  <FormField
    control={form.control}
    name="role"
    render={({ field }) => (
      <FormItem>
        <FormLabel>{CHANGE_USER_ROLE_LABEL}</FormLabel>
        <Select onValueChange={field.onChange} value={field.value ?? null}>
          <FormControl>
            <SelectTrigger>
              <SelectValue
                placeholder={CHANGE_USER_ROLE_PLACEHOLDER}
                renderValue={(value) =>
                  ASSIGNABLE_USER_ROLE_OPTIONS.find((option) => option.value === value)?.label ??
                  String(value)
                }
              />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {ASSIGNABLE_USER_ROLE_OPTIONS.map((option) => (
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
);

export default ChangeUserRoleFormFields;