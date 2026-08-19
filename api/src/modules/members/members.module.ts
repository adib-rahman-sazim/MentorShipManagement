import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Member } from "@/common/entities/members.entity";
import { CaslModule } from "@/modules/casl/casl.module";

import { AuthModule } from "../auth/auth.module";
import { MembersController } from "./members.controller";
import { MembersSerializer } from "./members.serializer";
import { MembersService } from "./members.service";

@Module({
  imports: [MikroOrmModule.forFeature([Member]), AuthModule, CaslModule],
  controllers: [MembersController],
  providers: [MembersService, MembersSerializer],
  exports: [MembersService, MembersSerializer, MikroOrmModule.forFeature([Member])],
})
export class MembersModule {}
