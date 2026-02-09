import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: '角色编码必须是字符串' })
  @MinLength(2, { message: '角色编码至少2个字符' })
  @MaxLength(100, { message: '角色编码最多100个字符' })
  code: string;

  @IsString({ message: '角色名称必须是字符串' })
  @MinLength(2, { message: '角色名称至少2个字符' })
  @MaxLength(100, { message: '角色名称最多100个字符' })
  name: string;

  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  @MaxLength(255, { message: '角色描述最多255个字符' })
  description?: string;

  @IsOptional()
  userIds?: string[];
}
