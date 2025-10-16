import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class InvitedPersonDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() contact: string;
  @IsString() address: string;
}

class VisitDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() subject: string;
  @IsString() @IsNotEmpty() need: string;
}

class PrayerRequestDto {
  @IsString() @IsNotEmpty() subject: string;
  @IsBoolean() isAnonymous: boolean;
}

export class CreateReportDto {
  @IsString() @IsNotEmpty() cellDate: string;
  @IsString() @IsNotEmpty() region: string;
  @IsString() @IsNotEmpty() group: string;
  @IsString() @IsNotEmpty() district: string;
  @IsString() @IsNotEmpty() cellName: string;
  @IsString() @IsNotEmpty() cellCategory: string;
  @IsString() @IsNotEmpty() leaderName: string;
  @IsString() @IsNotEmpty() leaderContact: string;
  @IsNumber() registeredMen: number;
  @IsNumber() registeredWomen: number;
  @IsNumber() registeredChildren: number;
  @IsNumber() attendees: number;
  @IsNumber() absentees: number;
  @IsNumber() totalPresent: number;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvitedPersonDto)
  invitedPeople: InvitedPersonDto[];
  
  @IsString() visitSchedule: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisitDto)
  visitsMade: VisitDto[];

  @IsNumber() bibleStudy: number;
  @IsNumber() miracleHour: number;
  @IsNumber() sundayServiceAttendance: number;
  
  @IsString() evangelismOuting: string;

  @IsOptional()
  @IsString()
  poignantTestimony?: string;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrayerRequestDto)
  prayerRequests?: PrayerRequestDto[];
  
  @IsString() message: string;
}
