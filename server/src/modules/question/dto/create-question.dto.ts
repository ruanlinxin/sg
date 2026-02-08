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
}
