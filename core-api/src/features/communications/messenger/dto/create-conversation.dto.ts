import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ConversationType } from 'src/entities/conversation.entity';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  participantId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  restaurantId?: string;

  @IsOptional()
  @IsEnum(ConversationType)
  conversationType?: ConversationType;
}
