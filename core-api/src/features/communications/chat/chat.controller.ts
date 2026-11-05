import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { OptionalAuthGuard } from 'src/features/auth/public-api';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatReply } from './types/chat.types';

interface AuthenticatedRequest {
  user?: {
    id?: string;
  };
}

@Controller('chat')
@ApiBearerAuth('bearer')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(OptionalAuthGuard)
  @Post()
  async handleChat(
    @Body() body: ChatRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ChatReply> {
    const userId = req.user?.id;
    return this.chatService.generateReply(body.userMessage, userId, body.metadata);
  }

  @UseGuards(OptionalAuthGuard)
  @Post('stream')
  @ApiOperation({ summary: 'Stream chatbot reply via Server-Sent Events (SSE)' })
  async handleChatStream(
    @Body() body: ChatRequestDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
    const userId = req.user?.id;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      const result = await this.chatService.generateReply(
        body.userMessage,
        userId,
        body.metadata,
      );
      const text = result.reply || '';
      const chunkSize = 20;
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize);
        res.write(`data: ${JSON.stringify({ event: 'delta', text: chunk })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ event: 'done', data: result })}\n\n`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Internal stream error';
      res.write(`data: ${JSON.stringify({ event: 'error', message })}\n\n`);
    } finally {
      res.end();
    }
  }
}
