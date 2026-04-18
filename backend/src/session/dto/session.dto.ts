import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiPropertyOptional({ description: 'Optional session title' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}

export class UpdateSessionDto {
  @ApiProperty({ description: 'Session title' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;
}
