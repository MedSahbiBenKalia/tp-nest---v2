import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageComment } from './entities/message.entity';
import { UserService } from '../user/user.service';
import { AddReactionDto, CreateCommentDto, CreateMessageDto } from './dto/message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(MessageComment)
    private messageCommentRepository: Repository<MessageComment>,
    private userService: UserService,
  ) {}

  async getAllMessages(): Promise<Message[]> {
    return this.messageRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async createMessage(userId: number, createMessageDto: CreateMessageDto): Promise<Message> {
    const sender = await this.userService.findOne(userId);
    if (!sender) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const message = new Message();
    message.content = createMessageDto.content;
    message.sender = sender;
    message.reactions = [];

    // Gestion du message privé
    if (createMessageDto.isPrivate && createMessageDto.receiverId) {
      const receiver = await this.userService.findOne(createMessageDto.receiverId);
      if (!receiver) {
        throw new NotFoundException(`Receiver with ID ${createMessageDto.receiverId} not found`);
      }
      message.receiver = receiver;
      message.isPrivate = true;
    } else {
      message.isPrivate = false;
    }

    return this.messageRepository.save(message);
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async addReaction(
    userId: number,
    messageId: number,
    reactionDto: AddReactionDto,
  ): Promise<Message> {
    const message = await this.findOne(messageId);

    // Vérifier si l'utilisateur a déjà réagi
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId === userId,
    );

    if (existingReactionIndex >= 0) {
      // Mettre à jour la réaction existante
      message.reactions[existingReactionIndex].type = reactionDto.type;
    } else {
      // Ajouter une nouvelle réaction
      message.reactions.push({
        userId,
        type: reactionDto.type,
      });
    }

    return this.messageRepository.save(message);
  }

  async addComment(
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<MessageComment> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const message = await this.findOne(createCommentDto.messageId);

    const comment = new MessageComment();
    comment.content = createCommentDto.content;
    comment.user = user;
    comment.message = message;

    return this.messageCommentRepository.save(comment);
  }
}