import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Invitation } from "@/common/entities/invitations.entity";
import { Organization } from "@/common/entities/organizations.entity";
import { CaslModule } from "@/modules/casl/casl.module";

import { AuthModule } from "../auth/auth.module";
import { EmailsModule } from "../emails/emails.module";
import { CancelInvitationInteractor } from "./interactors/cancel-invitation.interactor";
import { CreateInvitationInteractor } from "./interactors/create-invitation.interactor";
import { GetInvitationInteractor } from "./interactors/get-invitation.interactor";
import { ListInvitationsInteractor } from "./interactors/list-invitations.interactor";
import { ListMyPendingInvitationsInteractor } from "./interactors/list-my-pending-invitations.interactor";
import { ResendInvitationInteractor } from "./interactors/resend-invitation.interactor";
import { ValidateOrganizationInvitationInteractor } from "./interactors/validate-organization-invitation.interactor";
import { ValidateSystemInvitationInteractor } from "./interactors/validate-system-invitation.interactor";
import { InvitationsController } from "./invitations.controller";
import { InvitationsSerializer } from "./invitations.serializer";
import { InvitationsService } from "./invitations.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([Invitation, Organization]),
    AuthModule,
    EmailsModule,
    CaslModule,
  ],
  controllers: [InvitationsController],
  providers: [
    InvitationsService,
    InvitationsSerializer,
    CreateInvitationInteractor,
    ListInvitationsInteractor,
    GetInvitationInteractor,
    CancelInvitationInteractor,
    ResendInvitationInteractor,
    ValidateSystemInvitationInteractor,
    ValidateOrganizationInvitationInteractor,
    ListMyPendingInvitationsInteractor,
  ],
  exports: [InvitationsService, MikroOrmModule.forFeature([Invitation])],
})
export class InvitationsModule {}
