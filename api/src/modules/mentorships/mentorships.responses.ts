import { ApiProperty } from "@nestjs/swagger";

import { EMentorshipRelationshipType } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
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

export class MentorshipGraphNodeResponse {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ format: "email" })
  email!: string;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  role!: EUserRole;

  @ApiProperty({ enum: EUserState, enumName: "EUserState" })
  state!: EUserState;
}

export class MentorshipGraphEdgeResponse {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  supervisorId!: string;

  @ApiProperty({ format: "uuid" })
  subordinateId!: string;

  @ApiProperty({ enum: EMentorshipRelationshipType, enumName: "EMentorshipRelationshipType" })
  relationshipType!: EMentorshipRelationshipType;

  @ApiProperty()
  startedAt!: Date;
}

export class MentorshipGraphResponse {
  @ApiProperty({ type: [MentorshipGraphNodeResponse] })
  nodes!: MentorshipGraphNodeResponse[];

  @ApiProperty({ type: [MentorshipGraphEdgeResponse] })
  edges!: MentorshipGraphEdgeResponse[];
}

export class MentorshipGraphApiResponse extends AbstractApiResponse {
  @ApiProperty({ type: MentorshipGraphResponse })
  data!: MentorshipGraphResponse;
}
