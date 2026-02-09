import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto';
import { JwtAuthGuard } from '@/modules/system/auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '@/common';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 创建用户
   * POST /users
   */
  @Post()
  async create(@Body(ValidationPipe) createDto: CreateUserDto) {
    return await this.userService.create(createDto);
  }

  /**
   * 查询用户列表（分页）
   * GET /users?page=1&pageSize=10&keyword=xxx
   */
  @Get()
  async findAll(@Query(ValidationPipe) queryDto: UserQueryDto) {
    return await this.userService.findAll(queryDto);
  }

  /**
   * 根据ID查询用户
   * GET /users/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  /**
   * 更新用户
   * PUT /users/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateDto);
  }

  /**
   * 删除用户（软删除）
   * DELETE /users/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return null;
  }
}
