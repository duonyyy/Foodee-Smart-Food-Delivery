import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
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
}
