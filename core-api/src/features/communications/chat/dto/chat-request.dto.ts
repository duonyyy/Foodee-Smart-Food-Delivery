import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ChatHistoryItemDto {
  @IsString()
  @IsIn(['user', 'bot'])
  role: 'user' | 'bot';

  @IsString()
  text: string;
}

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];
}
