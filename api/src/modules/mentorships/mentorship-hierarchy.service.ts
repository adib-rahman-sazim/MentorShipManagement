import { Injectable } from "@nestjs/common";

import { CaslCacheService } from "@/modules/casl/casl-cache.service";

import { MENTORSHIP_SUBTREE_MAX_DEPTH } from "./mentorships.constants";
import { MentorshipsRepository } from "./mentorships.repository";

@Injectable()
export class MentorshipHierarchyService {
  constructor(
    private readonly mentorshipsRepository: MentorshipsRepository,
    private readonly caslCacheService: CaslCacheService,
  ) {}

  findSubtreeUserIds(userId: string): Promise<string[]> {
    return this.mentorshipsRepository.findDescendantUserIds(userId, MENTORSHIP_SUBTREE_MAX_DEPTH);
  }

  findChainUserIds(userId: string): Promise<string[]> {
    return this.mentorshipsRepository.findAncestorUserIds(userId, MENTORSHIP_SUBTREE_MAX_DEPTH);
  }

  async invalidateForMentorshipChanges(userIds: string[]): Promise<void> {
    const relatedUserIds = await Promise.all(
      userIds.map(async (userId) => {
        const [ancestorUserIds, descendantUserIds] = await Promise.all([
          this.findChainUserIds(userId),
          this.findSubtreeUserIds(userId),
        ]);

        return [userId, ...ancestorUserIds, ...descendantUserIds];
      }),
    );

    await this.caslCacheService.invalidateUsers(relatedUserIds.flat());
  }
}
