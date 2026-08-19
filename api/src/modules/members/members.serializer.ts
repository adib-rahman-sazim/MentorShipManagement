import { Injectable } from "@nestjs/common";

import type { Member } from "@/common/entities/members.entity";
import type { OrganizationMemberResponse } from "@/modules/organizations/organizations.responses";

@Injectable()
export class MembersSerializer {
  serialize(member: Member): OrganizationMemberResponse {
    return {
      id: member.id,
      role: member.role ?? null,
      user: {
        id: member.user.id,
        email: member.user.email,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        name: member.user.name,
      },
    };
  }

  serializeMany(members: Member[]): OrganizationMemberResponse[] {
    return members.map((member) => this.serialize(member));
  }
}
