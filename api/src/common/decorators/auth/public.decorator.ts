import { SetMetadata } from "@nestjs/common";

import { IS_PUBLIC_KEY } from "@/common/decorators/auth/public.decorator.constants";

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
