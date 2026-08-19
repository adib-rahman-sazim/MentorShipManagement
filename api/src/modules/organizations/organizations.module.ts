import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Member } from "@/common/entities/members.entity";
import { Organization } from "@/common/entities/organizations.entity";
import { User } from "@/common/entities/users.entity";
import { CaslModule } from "@/modules/casl/casl.module";
import { MembersModule } from "@/modules/members/members.module";

import { CreateOrganizationInteractor } from "./interactors/create-organization.interactor";
import { ListOrganizationMembersInteractor } from "./interactors/list-organization-members.interactor";
import { ListOrganizationsInteractor } from "./interactors/list-organizations.interactor";
import { OrganizationsController } from "./organizations.controller";
import { OrganizationsSerializer } from "./organizations.serializer";
import { OrganizationsService } from "./organizations.service";

@Module({
  imports: [MikroOrmModule.forFeature([Organization, Member, User]), CaslModule, MembersModule],
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    OrganizationsSerializer,
    CreateOrganizationInteractor,
    ListOrganizationsInteractor,
    ListOrganizationMembersInteractor,
  ],
  exports: [OrganizationsService, MikroOrmModule.forFeature([Organization])],
})
export class OrganizationsModule {}
