import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import dayjs from "dayjs";

import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { MembersRepository } from "@/modules/members/members.repository";
import { resolveEffectiveRole } from "@/modules/permissions/permissions.role-priority.helpers";
import { UserRolesService } from "@/modules/permissions/user-roles.service";
import { UsersRepository } from "@/modules/users/users.repository";

import { ORGANIZATION_ERROR_MESSAGES } from "../organizations.constants";
import { generateSlugFromName } from "../organizations.helpers";
import type { ICreateOrganizationContext } from "../organizations.interfaces";
import { OrganizationsRepository } from "../organizations.repository";
import type { OrganizationResponse } from "../organizations.responses";
import { OrganizationsSerializer } from "../organizations.serializer";

@Injectable()
export class CreateOrganizationInteractor
  implements IBaseInteractor<ICreateOrganizationContext, OrganizationResponse>
{
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly membersRepository: MembersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly organizationsSerializer: OrganizationsSerializer,
    private readonly userRolesService: UserRolesService,
    private readonly caslCacheService: CaslCacheService,
  ) {}

  async execute({ dto, userId, roles }: ICreateOrganizationContext): Promise<OrganizationResponse> {
    const effectiveRole = resolveEffectiveRole(roles);
    const isPrivilegedOrgCreator = effectiveRole === EUserRole.SUPER_ADMIN;

    if (!isPrivilegedOrgCreator && effectiveRole !== EUserRole.CUSTOMER) {
      throw new ForbiddenException(
        ORGANIZATION_ERROR_MESSAGES.ONLY_CUSTOMER_OR_SUPER_ADMIN_CAN_CREATE,
      );
    }

    const slug = dto.slug || generateSlugFromName(dto.name);

    const organization = await this.organizationsRepository.transactional(async (em) => {
      const transactionalUser = await this.usersRepository.findById(userId, em);
      if (!transactionalUser) {
        throw new NotFoundException("User not found");
      }

      if (!isPrivilegedOrgCreator && transactionalUser.state !== EUserState.NOT_ONBOARDED) {
        throw new BadRequestException(ORGANIZATION_ERROR_MESSAGES.USER_ALREADY_ONBOARDED);
      }

      if (!isPrivilegedOrgCreator) {
        const existingMember = await this.membersRepository
          .withEntityManager(em)
          .findOne({ user: { id: userId } });
        if (existingMember) {
          throw new BadRequestException(ORGANIZATION_ERROR_MESSAGES.USER_ALREADY_MEMBER);
        }
      }

      const existingOrg = await this.organizationsRepository.findBySlug(slug, em);
      if (existingOrg) {
        throw new ConflictException(ORGANIZATION_ERROR_MESSAGES.SLUG_ALREADY_EXISTS);
      }

      const organization = this.organizationsRepository.createOrganization(
        {
          name: dto.name,
          slug,
          createdBy: transactionalUser,
        },
        em,
      );

      if (isPrivilegedOrgCreator) {
        this.organizationsRepository.persist(organization, em);
        await this.organizationsRepository.flush(em);
        return organization;
      }

      const member = this.membersRepository.createMember(
        {
          user: transactionalUser,
          organization,
          role: EUserRole.CUSTOMER,
        },
        em,
      );

      this.organizationsRepository.persist(organization, em);
      this.membersRepository.persist(member, em);

      transactionalUser.state = EUserState.ACTIVE;
      if (!transactionalUser.firstLoginAt) {
        transactionalUser.firstLoginAt = dayjs().toDate();
      }

      await this.organizationsRepository.flush(em);
      await this.userRolesService.removeProvisionalCustomerRole(userId, em);
      await this.userRolesService.updateMemberRole(
        userId,
        organization.id,
        [EUserRole.CUSTOMER],
        em,
      );

      return organization;
    });

    if (!isPrivilegedOrgCreator) {
      await this.caslCacheService.invalidateUser(userId);
    }

    return this.organizationsSerializer.serialize(organization);
  }
}
