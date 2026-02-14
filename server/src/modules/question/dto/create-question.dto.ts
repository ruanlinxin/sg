import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString({ message: '题目必须是字符串' })
  @MaxLength(2000, { message: '题目内容不能超过2000字符' })
  question: string;

  @IsString({ message: '答案必须是字符串' })
  @MaxLength(2000, { message: '答案内容不能超过2000字符' })
  answer: string;

  @IsOptional()
  @IsString({ message: '索引必须是字符串' })
  @MaxLength(500, { message: '索引不能超过500字符' })
  indexes?: string;

  @IsOptional()
  @IsString({ message: '来源必须是字符串' })
  @MaxLength(50, { message: '来源不能超过50字符' })
  source?: string;

  @IsOptional()
  @IsString({ message: '来源ID必须是字符串' })
  @MaxLength(100, { message: '来源ID不能超过100字符' })
  sourceId?: string;
}
