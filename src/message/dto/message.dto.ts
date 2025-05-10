import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// Dans message.dto.ts
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  receiverId?: number;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class AddReactionDto {
  @IsString()
  @IsNotEmpty()
  type: string; // 'like', 'heart', 'smile', etc.
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  messageId: number;
}

export class MessageResponseDto {
  id: number;
  content: string;
  createdAt: Date;
  sender: {
    id: number;
    username: string;
  };
  reactions: { userId: number; type: string }[];
  comments: {
    id: number;
    content: string;
    createdAt: Date;
    user: {
      id: number;
      username: string;
    };
  }[];
}