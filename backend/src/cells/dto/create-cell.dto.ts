import { IsString, IsNotEmpty, IsEnum, IsOptional, Matches } from 'class-validator';
import { CellStatus } from '../../shared/types';
import { CELL_CATEGORIES } from '../../shared/constants';

export class CreateCellDto {
  @IsString() @IsNotEmpty() region: string;
  @IsString() @IsNotEmpty() group: string;
  @IsString() @IsNotEmpty() district: string;
  @IsString() @IsNotEmpty() cellName: string;
  @IsString() @IsNotEmpty() @IsEnum(CELL_CATEGORIES) cellCategory: string;
  @IsString() @IsNotEmpty() leaderName: string;
  @IsOptional() @IsString() @Matches(/^01[0-9]{8}$/) leaderContact?: string;
  @IsEnum(['Active', 'En implantation', 'En multiplication', 'En pause']) @IsNotEmpty() status: CellStatus;
}
