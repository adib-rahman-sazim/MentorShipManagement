import { ASSIGNABLE_USER_ROLE_OPTIONS, USER_STATE_OPTIONS } from "@/modules/users/users.constants";
import { PasswordInput } from "@/shared/components/Form/PasswordInput";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/shadui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadui/form";
import { Input } from "@/shared/components/shadui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadui/select";

import {
  CREATE_USER_DIALOG_DESCRIPTION,
  CREATE_USER_DIALOG_TITLE,
  CREATE_USER_EMAIL_LABEL,
  CREATE_USER_EMAIL_PLACEHOLDER,
  CREATE_USER_NAME_LABEL,
  CREATE_USER_NAME_PLACEHOLDER,
  CREATE_USER_PASSWORD_LABEL,
  CREATE_USER_PASSWORD_PLACEHOLDER,
  CREATE_USER_ROLE_LABEL,
  CREATE_USER_ROLE_PLACEHOLDER,
  CREATE_USER_STATE_LABEL,
  CREATE_USER_STATE_PLACEHOLDER,
  CREATE_USER_SUBMIT_LABEL,
} from "./CreateUserDialog.constants";
import { useCreateUserForm } from "./CreateUserDialog.hooks";
import { ICreateUserDialogProps } from "./CreateUserDialog.interfaces";

const CreateUserDialog = ({ isOpen, onOpenChange }: ICreateUserDialogProps) => {
  const { form, onSubmit, resetForm } = useCreateUserForm({
    onSuccess: () => onOpenChange(false),
  });
  const isSubmitting = form.formState.isSubmitting;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{CREATE_USER_DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{CREATE_USER_DIALOG_DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{CREATE_USER_NAME_LABEL}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder={CREATE_USER_NAME_PLACEHOLDER}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{CREATE_USER_EMAIL_LABEL}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder={CREATE_USER_EMAIL_PLACEHOLDER}
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
                <FormItem>
                  <FormLabel>{CREATE_USER_PASSWORD_LABEL}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      disabled={isSubmitting}
                      placeholder={CREATE_USER_PASSWORD_PLACEHOLDER}
                      autoComplete="new-password"
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
                <FormItem>
                  <FormLabel>{CREATE_USER_ROLE_LABEL}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={CREATE_USER_ROLE_PLACEHOLDER}
                          renderValue={(value) =>
                            ASSIGNABLE_USER_ROLE_OPTIONS.find((option) => option.value === value)
                              ?.label ?? String(value)
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

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{CREATE_USER_STATE_LABEL}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={CREATE_USER_STATE_PLACEHOLDER}
                          renderValue={(value) =>
                            USER_STATE_OPTIONS.find((option) => option.value === value)?.label ??
                            String(value)
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_STATE_OPTIONS.map((option) => (
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner /> : null}
              {CREATE_USER_SUBMIT_LABEL}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;