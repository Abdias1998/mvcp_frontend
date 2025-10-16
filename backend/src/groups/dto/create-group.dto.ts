import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGroupDto {
  @IsString() @IsNotEmpty() region: string;
  @IsString() @IsNotEmpty() name: string;
}
