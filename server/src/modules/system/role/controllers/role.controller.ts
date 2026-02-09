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
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto } from '../dto';
import { JwtAuthGuard } from '@/modules/system/auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '@/common';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * 创建角色
   * POST /roles
   */
  @Post()
  async create(@Body(ValidationPipe) createDto: CreateRoleDto) {
    return await this.roleService.create(createDto);
  }

  /**
   * 查询角色列表（分页）
   * GET /roles?page=1&pageSize=10&keyword=xxx
   */
  @Get()
  async findAll(@Query(ValidationPipe) queryDto: RoleQueryDto) {
    return await this.roleService.findAll(queryDto);
  }

  /**
   * 获取所有角色（简单列表，用于下拉选择）
   * GET /roles/simple
   */
  @Get('simple')
  async findAllSimple() {
    return await this.roleService.findAllSimple();
  }

  /**
   * 根据ID查询角色
   * GET /roles/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.roleService.findById(id);
  }

  /**
   * 更新角色
   * PUT /roles/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateRoleDto,
  ) {
    return await this.roleService.update(id, updateDto);
  }

  /**
   * 删除角色（软删除）
   * DELETE /roles/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.roleService.remove(id);
    return null;
  }
}
