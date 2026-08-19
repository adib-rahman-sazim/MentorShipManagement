export interface IResolvePostAuthDestinationInput {
  storedRedirect?: string | null;
  pendingInvitationId?: string | null;
  hasActiveOrganization: boolean;
  hasListableOrganization: boolean;
}

export interface IResolvePostAuthDestinationFromSessionOptions {
  storedRedirect?: string | null;
  activeOrganizationId?: string | null;
}
