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
import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";

import { useChangeUserRoleForm } from "./ChangeUserRoleForm.hooks";

const ChangeUserRoleFormFields = ({
  roles,
  form,
}: {
  form: ReturnType<typeof useChangeUserRoleForm>["form"];
  roles: EUserRole[];
}) => (
  <>
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder="Select a role"
                  renderValue={(value) =>
                    roles.find((role) => role === value)?.toUpperCase() ?? String(value)
                  }
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

export default ChangeUserRoleFormFields;
