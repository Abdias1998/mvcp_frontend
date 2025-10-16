import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CellsService } from './cells.service';
import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cells')
export class CellsController {
  constructor(private readonly cellsService: CellsService) {}

  @Post()
  create(@Body() createCellDto: CreateCellDto) {
    return this.cellsService.create(createCellDto);
  }

  @Get()
  findAllForUser(@Request() req) {
    return this.cellsService.findAllForUser(req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCellDto: UpdateCellDto) {
    return this.cellsService.update(id, updateCellDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cellsService.remove(id);
  }
}
