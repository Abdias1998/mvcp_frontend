import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDistrictDto {
  @IsString() @IsNotEmpty() region: string;
  @IsString() @IsNotEmpty() group: string;
  @IsString() @IsNotEmpty() name: string;
}
