import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";

import type { Response } from "express";

import { ChatRequestDto, CompletionRequestDto } from "./ai-sdk.dtos";
import { AiSdkService } from "./ai-sdk.service";

@Controller("ai-sdk")
export class AiSdkController {
  constructor(private readonly aiSdkService: AiSdkService) {}

  @Post("/completion")
  completion(@Body() dto: CompletionRequestDto) {
    return this.aiSdkService.generateCompletion(dto);
  }

  @Post("/chat")
  chat(@Body() dto: ChatRequestDto) {
    return this.aiSdkService.generateChat(dto);
  }

  @Post("/chat/stream")
  async chatStream(@Res() res: Response, @Body() dto: ChatRequestDto) {
    try {
      const result = await this.aiSdkService.streamChat(dto);

      return result.pipeUIMessageStreamToResponse(res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error instanceof Error ? error.message : "Stream failed",
          error: "Internal Server Error",
        });
      } else {
        res.end();
      }
    }
  }
}
