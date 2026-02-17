import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class RescheduleLessonDto {
  @ApiProperty({
    description: 'Nova data e hora de início (ISO 8601)',
    example: '2024-01-16T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDateTime: string;
}