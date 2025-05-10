import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayloadInterface } from 'src/auth/interfaces/payload.interface';
import { AddReactionDto, CreateCommentDto, CreateMessageDto } from './dto/message.dto';
import jwt_decode from 'jwt-decode';  

@WebSocketGateway({
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'], 
    credentials: true,
  }
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  
  private userSockets: Map<number, string> = new Map();

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token; 

      if (!token) {
        
        client.disconnect();
        throw new Error('Token JWT manquant');
      }

      
      let jwtDecode = jwt_decode;
      const decodedToken = this.jwtService.decode(token);

      
      

      
      client.data.user = decodedToken;
    this.userSockets.set(decodedToken.id, client.id);

      console.log('Utilisateur connecté :', client.data.user);

    } catch (error) {
      console.error('Erreur de connexion WebSocket:', error.message);
      client.disconnect(); 
      throw new Error('Erreur d\'authentification : ' + error.message);
    }
  }
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    try {
      const userId = client.data.user.id;
      const message = await this.messageService.createMessage(userId, createMessageDto);

      if (message.isPrivate && message.receiver) {
        
        const receiverSocketId = this.userSockets.get(message.receiver.id);
console.log('receiverSocketId', receiverSocketId)
        
        client.emit('newMessage', message);

        
        if (receiverSocketId) {
          console.log('receiverSocketId ethenya', receiverSocketId)
          this.server.to(receiverSocketId).emit('newMessage', message);
        }
      } else {
        
        this.server.emit('newMessage', message);
      }

      return { status: 'success', message };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('addReaction')
  async handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: number; reaction: AddReactionDto },
  ) {
    try {
      const userId = client.data.user.id;
      const message = await this.messageService.addReaction(
        userId,
        data.messageId,
        data.reaction,
      );

      
      if (message.isPrivate && message.receiver) {
        
        const senderSocketId = this.userSockets.get(message.sender.id);
        const receiverSocketId = this.userSockets.get(message.receiver.id);

        
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('messageReaction', {
            messageId: message.id,
            reactions: message.reactions,
          });
        }

        
        if (receiverSocketId) {
          this.server.to(receiverSocketId).emit('messageReaction', {
            messageId: message.id,
            reactions: message.reactions,
          });
        }
      } else {
        
        this.server.emit('messageReaction', {
          messageId: message.id,
          reactions: message.reactions,
        });
      }

      return { status: 'success', reactions: message.reactions };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('addComment')
  async handleComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() createCommentDto: CreateCommentDto,
  ) {
    try {
      const userId = client.data.user.id;
      const comment = await this.messageService.addComment(userId, createCommentDto);

      
      const message = await this.messageService.findOne(createCommentDto.messageId);

      
      if (message.isPrivate && message.receiver) {
        
        const senderSocketId = this.userSockets.get(message.sender.id);
        const receiverSocketId = this.userSockets.get(message.receiver.id);

        
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('messageComment', {
            messageId: message.id,
            comments: message.comments,
          });
        }

        
        if (receiverSocketId) {
          this.server.to(receiverSocketId).emit('messageComment', {
            messageId: message.id,
            comments: message.comments,
          });
        }
      } else {
        
        this.server.emit('messageComment', {
          messageId: message.id,
          comments: message.comments,
        });
      }

      return { status: 'success', comment };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  
  @SubscribeMessage('getConnectedUsers')
  sendConnectedUsersList(@ConnectedSocket() client: Socket) {
    console.log('Demande de la liste des utilisateurs connectés reçue');
    const connectedUsers = [];

    
    for (const [userId, socketId] of this.userSockets.entries()) {
      
      const socket = this.server.sockets.sockets.get(socketId);
      console.log(socket)
      if (socket && socket.data.user) {
        // @ts-ignore
        connectedUsers.push({
          userId: socket.data.user.id,
          username: socket.data.user.username,
        });
      }
    }

    console.log('Liste des utilisateurs connectés:', connectedUsers);
    
    client.emit('connectedUsers', connectedUsers);
  }

  
  private getUserSocketId(userId: number): string | undefined {
    return this.userSockets.get(userId);
  }
}