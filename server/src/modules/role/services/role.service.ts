import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '@/modules/user/entities/user.entity';
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto } from '../dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建角色
   */
  async create(createDto: CreateRoleDto): Promise<Role> {
    // 检查角色编码是否已存在
    const existingCode = await this.roleRepository.findOne({
      where: { code: createDto.code },
    });
    if (existingCode) {
      throw new ConflictException('角色编码已存在');
    }

    // 先创建并保存角色（不关联用户）
    const role = this.roleRepository.create({
      code: createDto.code,
      name: createDto.name,
      description: createDto.description,
    });

    const savedRole = await this.roleRepository.save(role);

    // 再关联用户（验证用户ID是否存在）
    if (createDto.userIds && createDto.userIds.length > 0) {
      // 查询存在的用户
      const users = await this.userRepository.find({
        where: createDto.userIds.map(id => ({ id })),
      });

      // 检查是否所有用户都存在
      const foundIds = users.map(u => u.id);
      const notFoundIds = createDto.userIds.filter(id => !foundIds.includes(id));
      if (notFoundIds.length > 0) {
        console.warn('以下用户ID不存在:', notFoundIds);
      }

      // 只关联存在的用户
      if (users.length > 0) {
        savedRole.users = users;
        await this.roleRepository.save(savedRole);
      }
    }

    return this.findById(savedRole.id);
  }

  /**
   * 分页查询角色列表
   */
  async findAll(queryDto: RoleQueryDto) {
    const { keyword, page = 1, pageSize = 10 } = queryDto;

    const where: any = { status: 1 };

    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    const [list, total] = await this.roleRepository.findAndCount({
      where,
      relations: ['users'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 处理返回数据，只保留用户的基本信息
    const formattedList = list.map(role => ({
      ...role,
      users: role.users?.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
      })) || [],
    }));

    return {
      list: formattedList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询角色
   */
  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, status: 1 },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException(`角色ID ${id} 不存在`);
    }

    return role;
  }

  /**
   * 更新角色
   */
  async update(id: string, updateDto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id, status: 1 },
    });

    if (!role) {
      throw new NotFoundException(`角色ID ${id} 不存在`);
    }

    // 检查角色编码是否被其他角色使用
    if (updateDto.code && updateDto.code !== role.code) {
      const existingCode = await this.roleRepository.findOne({
        where: { code: updateDto.code },
      });
      if (existingCode) {
        throw new ConflictException('角色编码已存在');
      }
    }

    // 更新基本信息
    if (updateDto.code) role.code = updateDto.code;
    if (updateDto.name) role.name = updateDto.name;
    if (updateDto.description !== undefined) role.description = updateDto.description;
    role.updatedAt = new Date();

    // 先保存基本信息
    const savedRole = await this.roleRepository.save(role);

    // 再更新关联用户（验证用户ID是否存在）
    if (updateDto.userIds !== undefined) {
      if (updateDto.userIds.length > 0) {
        // 查询存在的用户
        const users = await this.userRepository.find({
          where: updateDto.userIds.map(id => ({ id })),
        });

        // 检查是否所有用户都存在
        const foundIds = users.map(u => u.id);
        const notFoundIds = updateDto.userIds.filter(id => !foundIds.includes(id));
        if (notFoundIds.length > 0) {
          console.warn('以下用户ID不存在:', notFoundIds);
        }

        // 只关联存在的用户
        savedRole.users = users;
        await this.roleRepository.save(savedRole);
      } else {
        // 清空关联
        savedRole.users = [];
        await this.roleRepository.save(savedRole);
      }
    }

    return this.findById(savedRole.id);
  }

  /**
   * 删除角色（软删除）
   */
  async remove(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id, status: 1 },
    });

    if (!role) {
      throw new NotFoundException(`角色ID ${id} 不存在`);
    }

    await this.roleRepository.softRemove(role);
  }

  /**
   * 批量删除角色
   */
  async removeBatch(ids: string[]): Promise<void> {
    await this.roleRepository.softDelete(ids);
  }

  /**
   * 获取所有角色（用于下拉选择）
   */
  async findAllSimple(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { status: 1 },
      select: ['id', 'code', 'name'],
      order: { createdAt: 'DESC' },
    });
  }
}
