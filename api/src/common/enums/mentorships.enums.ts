export enum EMentorshipDraftStatus {
  DRAFT = "DRAFT",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
}

export enum EMentorshipRelationshipType {
  SENSEI_MENTOR = "SENSEI_MENTOR",
  MENTOR_MENTEE = "MENTOR_MENTEE",
}

export enum EMentorshipStatus {
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
}

export enum EMentorshipViolation {
  SELF_MENTORSHIP = "SELF_MENTORSHIP",
  ILLEGAL_ROLE_PAIR = "ILLEGAL_ROLE_PAIR",
  CYCLE = "CYCLE",
  INACTIVE_USER = "INACTIVE_USER",
}