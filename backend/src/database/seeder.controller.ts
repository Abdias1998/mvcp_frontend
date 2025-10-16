import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { ConfigService } from '@nestjs/config';

@Controller('seeder')
export class SeederController {
  constructor(
    private readonly seederService: SeederService,
    private readonly configService: ConfigService,
  ) {}

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedDatabase(@Body('key') key: string) {
    const seederKey = this.configService.get<string>('SEEDER_KEY');
    if (key !== seederKey) {
      throw new UnauthorizedException('Invalid seeder key.');
    }
    return this.seederService.seed();
  }
}
