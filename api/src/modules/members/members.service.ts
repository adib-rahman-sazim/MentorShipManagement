import { Injectable, NotFoundException } from "@nestjs/common";

import { EUserRole } from "@/common/enums/roles.enums";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { UserRolesService } from "@/modules/permissions/user-roles.service";

import type { UpdateMemberRoleDto, UpdateSystemRolesDto } from "./members.dtos";
import type { IUpdateMemberRoleResponse } from "./members.interfaces";
import { MembersRepository } from "./members.repository";

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly userRolesService: UserRolesService,
    private readonly caslCacheService: CaslCacheService,
  ) {}

  async updateMemberRole(
    dto: UpdateMemberRoleDto,
    organizationId: string,
  ): Promise<IUpdateMemberRoleResponse> {
    const member = await this.membersRepository.findByUserAndOrganization(
      dto.userId,
      organizationId,
    );

    if (!member) {
      throw new NotFoundException("Member not found in this organization");
    }

    const roles = await this.userRolesService.updateMemberRole(
      dto.userId,
      organizationId,
      dto.roleSlugs,
    );

    member.role = EUserRole.CUSTOMER;
    await this.membersRepository.flush();
    await this.caslCacheService.invalidateUser(dto.userId);

    return {
      success: true,
      message: `Organization roles updated to [${roles.join(", ")}] for ${member.user.email}`,
    };
  }

  async updateSystemRoles(dto: UpdateSystemRolesDto): Promise<IUpdateMemberRoleResponse> {
    const roles = await this.userRolesService.updateSystemRoles(dto.userId, dto.roleSlugs);
    await this.caslCacheService.invalidateUser(dto.userId);

    return {
      success: true,
      message: `System roles updated to [${roles.join(", ")}]`,
    };
  }
}
