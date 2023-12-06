import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

@Exclude()
export class ListCoinsDiffQueryDto {
  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: 'Search key',
    example: 'hex',
  })
  @IsOptional()
  @ValidateIf(
    (_, value) => value !== undefined && value !== null && value !== '',
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  searchKey?: string;

  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: 'Is verified or not?',
    example: 'true',
  })
  @IsOptional()
  @ValidateIf(
    (_, value) => value !== undefined && value !== null && value !== '',
  )
  @IsString()
  @IsIn(['true', 'false'])
  isVerified?: string;

  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: 'Is well established or not?',
    example: 'true',
  })
  @IsOptional()
  @ValidateIf(
    (_, value) => value !== undefined && value !== null && value !== '',
  )
  @IsString()
  @IsIn(['true', 'false'])
  isWellEstablished?: string;

  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: 'Is outlier removed or not?',
    example: 'true',
  })
  @IsOptional()
  @ValidateIf(
    (_, value) => value !== undefined && value !== null && value !== '',
  )
  @IsString()
  @IsIn(['true', 'false'])
  isOutlierRemoved?: string;
}
