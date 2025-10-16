import { IsString, IsOptional, IsEnum, Matches } from 'class-validator';
import { CellStatus } from '../../shared/types';
import { CELL_CATEGORIES } from '../../shared/constants';

export class UpdateCellDto {
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() group?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() cellName?: string;
  @IsOptional() @IsString() @IsEnum(CELL_CATEGORIES) cellCategory?: string;
  @IsOptional() @IsString() leaderName?: string;
  @IsOptional() @IsString() @Matches(/^01[0-9]{8}$/) leaderContact?: string;
  @IsOptional() @IsEnum(['Active', 'En implantation', 'En multiplication', 'En pause']) status?: CellStatus;
}
