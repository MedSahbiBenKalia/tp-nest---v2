import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { WsUser } from 'src/decorators/wsuser.decorator';
import { Socket } from 'socket.io';



@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly messageService: MessageService) {}

  
  handleConnection(@WsUser() user, ...args: any[]) {
    console.log('Client connected:', user.id);
  }
  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('createMessage')
  create(client : Socket , @MessageBody() createMessageDto: CreateMessageDto) {
    console.log('user in createMessage', client);
    console.log('createMessage', createMessageDto);
    client.emit('message', "message created");
  }

  @SubscribeMessage('findAllMessage')
  findAll() {
    return this.messageService.findAll();
  }

  @SubscribeMessage('findOneMessage')
  findOne(@MessageBody() id: number) {
    return this.messageService.findOne(id);
  }

  @SubscribeMessage('updateMessage')
  update(@MessageBody() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(updateMessageDto.id, updateMessageDto);
  }

  @SubscribeMessage('removeMessage')
  remove(@MessageBody() id: number) {
    return this.messageService.remove(id);
  }
}
