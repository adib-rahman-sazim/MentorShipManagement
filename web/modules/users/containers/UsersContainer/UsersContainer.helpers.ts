import { canPerform } from "@/shared/providers/AbilityProvider/AbilityProvider.helpers";
import type { TAppAbility } from "@/shared/providers/AbilityProvider/AbilityProvider.types";
import { EPermission, EResource } from "@/shared/typedefs";

export function canUpdateUserRow(
  ability: TAppAbility,
  userId: string,
  currentUserId: string | undefined,
): boolean {
  return (
    userId !== currentUserId &&
    canPerform(ability, EPermission.UPDATE, EResource.USER, { id: userId })
  );
}
