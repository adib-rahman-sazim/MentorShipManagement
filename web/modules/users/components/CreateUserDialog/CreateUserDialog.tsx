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
import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";

import {
  INVITE_ORGANIZATION_EMPTY_PLACEHOLDER,
  INVITE_ORGANIZATION_LOADING_PLACEHOLDER,
  INVITE_ORGANIZATION_SELECT_LABEL,
  INVITE_ORGANIZATION_SELECT_PLACEHOLDER,
} from "./CreateUserDialog.constants";
import { useInviteUserForm } from "./CreateUserDialog.hooks";
import { IInviteUserDialogProps } from "./CreateUserDialog.interfaces";

const InviteUserDialog = ({ isOpen, onOpenChange, organizationId }: IInviteUserDialogProps) => {
  const {
    form,
    onSubmit,
    roleOptions,
    watchedRole,
    organizationOptions,
    isOrganizationsLoading,
    hasOrganizationOptions,
  } = useInviteUserForm({ onOpenChange, organizationId });
  const isSubmitting = form.formState.isSubmitting;
  const shouldShowOrganizationSelect = watchedRole === EUserRole.CUSTOMER && !organizationId;

  let organizationSelectPlaceholder = INVITE_ORGANIZATION_EMPTY_PLACEHOLDER;
  if (isOrganizationsLoading) {
    organizationSelectPlaceholder = INVITE_ORGANIZATION_LOADING_PLACEHOLDER;
  } else if (hasOrganizationOptions) {
    organizationSelectPlaceholder = INVITE_ORGANIZATION_SELECT_PLACEHOLDER;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new user
            {organizationId ? " to this organization" : ""}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} placeholder="Last Name" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} placeholder="Email" type="email" {...field} />
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
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder="Select a role"
                          renderValue={(value) =>
                            roleOptions.find((opt) => opt.value === value)?.label ?? String(value)
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((option) => (
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

            {shouldShowOrganizationSelect ? (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{INVITE_ORGANIZATION_SELECT_LABEL}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                      disabled={isSubmitting || isOrganizationsLoading || !hasOrganizationOptions}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={organizationSelectPlaceholder}
                            renderValue={(value) =>
                              organizationOptions.find((opt) => opt.value === value)?.label ??
                              String(value)
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizationOptions.map((option) => (
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
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner /> : null}
              Send Invitation
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUserDialog;
