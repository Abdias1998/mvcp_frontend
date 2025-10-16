import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateGroupDto {
  @IsString() @IsNotEmpty() region: string;
  @IsString() @IsNotEmpty() name: string;
}
