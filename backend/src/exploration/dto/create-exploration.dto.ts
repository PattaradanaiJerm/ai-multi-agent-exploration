import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExplorationDto {
  @ApiProperty({
    description: 'The session this exploration belongs to',
    example: 'uuid-of-session',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Natural language query from the user',
    example: 'Explore market insights and recent developments related to agricultural products in Southeast Asia.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  query: string;
}
