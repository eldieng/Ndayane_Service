import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('SMS')
@Controller('sms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('envoyer')
  @ApiOperation({ summary: 'Envoyer un SMS' })
  sendSms(@Body() body: { telephone: string; message: string }) {
    return this.smsService.sendSms(body.telephone, body.message);
  }

  @Post('facture/:venteId')
  @ApiOperation({ summary: 'Envoyer une facture par SMS' })
  sendFactureSms(@Param('venteId') venteId: string) {
    return this.smsService.sendFactureSms(venteId);
  }

  @Post('rappel/:clientId')
  @ApiOperation({ summary: 'Envoyer un rappel de paiement' })
  sendRappelPaiement(
    @Param('clientId') clientId: string,
    @Body() body: { montant: number }
  ) {
    return this.smsService.sendRappelPaiement(clientId, body.montant);
  }
}
