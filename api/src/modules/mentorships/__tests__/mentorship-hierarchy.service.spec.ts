import { mockDeep } from "vitest-mock-extended";

import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { MentorshipHierarchyService } from "@/modules/mentorships/mentorship-hierarchy.service";
import { MENTORSHIP_SUBTREE_MAX_DEPTH } from "@/modules/mentorships/mentorships.constants";
import { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";

const USER_ID = "00000000-0000-0000-0000-000000000001";
const ANCESTOR_USER_IDS = [
  "00000000-0000-0000-0000-0000000000b1",
  "00000000-0000-0000-0000-0000000000b2",
];

describe("MentorshipHierarchyService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const buildService = () => {
    const mentorshipsRepository = mockDeep<MentorshipsRepository>();
    mentorshipsRepository.findAncestorUserIds.mockResolvedValue(ANCESTOR_USER_IDS);

    const caslCacheService = mockDeep<CaslCacheService>();
    caslCacheService.invalidateUsers.mockResolvedValue(undefined);

    return {
      mentorshipsRepository,
      caslCacheService,
      service: new MentorshipHierarchyService(mentorshipsRepository, caslCacheService),
    };
  };

  describe("invalidateForMentorshipChange", () => {
    it("clears the cache for the user and everyone above them", async () => {
      const { service, caslCacheService, mentorshipsRepository } = buildService();

      await service.invalidateForMentorshipChange(USER_ID);

      expect(mentorshipsRepository.findAncestorUserIds).toHaveBeenCalledExactlyOnceWith(
        USER_ID,
        MENTORSHIP_SUBTREE_MAX_DEPTH,
      );
      expect(caslCacheService.invalidateUsers).toHaveBeenCalledExactlyOnceWith([
        USER_ID,
        ...ANCESTOR_USER_IDS,
      ]);
    });
  });
});
