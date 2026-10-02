import { ApiProperty } from "@nestjs/swagger";

import { EMentorshipRelationshipType } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { AbstractApiResponse } from "@/common/interceptors/response-transform.interceptor.responses";

export class MentorshipPersonResponse {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  role!: EUserRole;
}

export class MentorshipChainLinkResponse {
  @ApiProperty({ format: "uuid" })
  mentorshipId!: string;

  @ApiProperty()
  depth!: number;

  @ApiProperty({ enum: EMentorshipRelationshipType, enumName: "EMentorshipRelationshipType" })
  relationshipType!: EMentorshipRelationshipType;

  @ApiProperty()
  startedAt!: Date;

  @ApiProperty({ type: MentorshipPersonResponse })
  supervisor!: MentorshipPersonResponse;
}

export class MentorshipTeamNodeResponse {
  @ApiProperty({ format: "uuid" })
  mentorshipId!: string;

  @ApiProperty({ enum: EMentorshipRelationshipType, enumName: "EMentorshipRelationshipType" })
  relationshipType!: EMentorshipRelationshipType;

  @ApiProperty()
  startedAt!: Date;

  @ApiProperty({ type: MentorshipPersonResponse })
  user!: MentorshipPersonResponse;

  @ApiProperty({ type: () => [MentorshipTeamNodeResponse] })
  team!: MentorshipTeamNodeResponse[];
}

export class MyMentorshipResponse {
  @ApiProperty({ type: [MentorshipChainLinkResponse] })
  supervisors!: MentorshipChainLinkResponse[];

  @ApiProperty({ type: [MentorshipTeamNodeResponse] })
  team!: MentorshipTeamNodeResponse[];
}

export class MyMentorshipApiResponse extends AbstractApiResponse {
  @ApiProperty({ type: MyMentorshipResponse })
  data!: MyMentorshipResponse;
}
