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
import jwt_decode from 'jwt-decode';  // Importation correcte

@WebSocketGateway({
  cors: {
    origin: '*', // Autoriser toutes les origines
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'], // Autoriser tous les headers
    credentials: true,
  }
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  // Map pour suivre les connexions socket par ID utilisateur
  private userSockets: Map<number, string> = new Map();

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token; // Récupérer le token JWT depuis le handshake

      if (!token) {
        // Si aucun token n'est fourni, déconnecter le client
        client.disconnect();
        throw new Error('Token JWT manquant');
      }

      // Décodez le token JWT pour obtenir les informations utilisateur
      let jwtDecode = jwt_decode;
      const decodedToken = this.jwtService.decode(token);

      // Vous pouvez valider la signature du JWT ici, par exemple :
      // const decodedToken = this.jwtService.verify(token);

      // Ajouter les informations utilisateur au client
      client.data.user = decodedToken;

      console.log('Utilisateur connecté :', client.data.user);

    } catch (error) {
      console.error('Erreur de connexion WebSocket:', error.message);
      client.disconnect(); // Déconnecter le client si une erreur se produit
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
        // Si c'est un message privé, l'envoyer seulement à l'expéditeur et au destinataire
        const receiverSocketId = this.userSockets.get(message.receiver.id);

        // Envoyer à l'expéditeur
        client.emit('newMessage', message);

        // Envoyer au destinataire s'il est connecté
        if (receiverSocketId) {
          this.server.to(receiverSocketId).emit('newMessage', message);
        }
      } else {
        // Message public, broadcast à tous les clients
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

      // Vérifier si c'est un message privé
      if (message.isPrivate && message.receiver) {
        // Envoyer la mise à jour seulement à l'expéditeur et au destinataire
        const senderSocketId = this.userSockets.get(message.sender.id);
        const receiverSocketId = this.userSockets.get(message.receiver.id);

        // Mettre à jour pour l'expéditeur
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('messageReaction', {
            messageId: message.id,
            reactions: message.reactions,
          });
        }

        // Mettre à jour pour le destinataire
        if (receiverSocketId) {
          this.server.to(receiverSocketId).emit('messageReaction', {
            messageId: message.id,
            reactions: message.reactions,
          });
        }
      } else {
        // Message public, informer tous les clients
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

      // Récupérer le message mis à jour
      const message = await this.messageService.findOne(createCommentDto.messageId);

      // Vérifier si c'est un message privé
      if (message.isPrivate && message.receiver) {
        // Envoyer la mise à jour seulement à l'expéditeur et au destinataire
        const senderSocketId = this.userSockets.get(message.sender.id);
        const receiverSocketId = this.userSockets.get(message.receiver.id);

        // Mettre à jour pour l'expéditeur
        if (senderSocketId) {
          this.server.to(senderSocketId).emit('messageComment', {
            messageId: message.id,
            comments: message.comments,
          });
        }

        // Mettre à jour pour le destinataire
        if (receiverSocketId) {
          this.server.to(receiverSocketId).emit('messageComment', {
            messageId: message.id,
            comments: message.comments,
          });
        }
      } else {
        // Message public, informer tous les clients
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

  // Nouvelle méthode pour demander la liste des utilisateurs connectés
  @SubscribeMessage('getConnectedUsers')
  sendConnectedUsersList(@ConnectedSocket() client: Socket) {
    const connectedUsers = [];

    // Collecter les infos des utilisateurs connectés
    for (const [userId, socketId] of this.userSockets.entries()) {
      // Chercher les infos utilisateur depuis les sockets connectés
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

    // Envoyer la liste à l'utilisateur qui l'a demandée
    client.emit('connectedUsers', connectedUsers);
  }

  // Helper pour obtenir le socket ID d'un utilisateur
  private getUserSocketId(userId: number): string | undefined {
    return this.userSockets.get(userId);
  }
}