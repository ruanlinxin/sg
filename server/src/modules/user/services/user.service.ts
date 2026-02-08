import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 创建用户
   */
  async create(createDto: CreateUserDto): Promise<User> {
    // 检查邮箱是否已存在
    const existingEmail = await this.userRepository.findOne({
      where: { email: createDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('邮箱已被使用');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(createDto.password, 10);

    const user = this.userRepository.create({
      ...createDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  /**
   * 分页查询用户列表
   */
  async findAll(queryDto: UserQueryDto) {
    const { keyword, page = 1, pageSize = 10 } = queryDto;

    const where: any = { status: 1 };

    if (keyword) {
      where.username = Like(`%${keyword}%`);
    }

    const [list, total] = await this.userRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 过滤掉密码字段
    const safeList = list.map(user => this.excludePassword(user));

    return {
      list: safeList,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询用户（返回安全数据，不含密码）
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, status: 1 },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    return this.excludePassword(user);
  }

  /**
   * 根据ID查询用户（包含密码，用于内部验证）
   */
  async findByIdWithPassword(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, status: 1 },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    return user;
  }

  /**
   * 根据用户名查询用户（包含密码，用于登录验证）
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username, status: 1 },
    });
  }

  /**
   * 根据用户名查询用户（包含密码和角色，用于登录验证）
   */
  async findByUsernameWithRoles(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username, status: 1 },
      relations: ['roles'],
    });
  }

  /**
   * 根据ID查询用户（包含角色）
   */
  async findByIdWithRoles(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, status: 1 },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    return this.excludePassword(user);
  }

  /**
   * 更新用户
   */
  async update(id: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, status: 1 },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    // 检查邮箱是否被其他用户使用
    if (updateDto.email && updateDto.email !== user.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    // 如果更新密码，需要加密
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    Object.assign(user, updateDto);
    user.updatedAt = new Date();

    const updatedUser = await this.userRepository.save(user);
    return this.excludePassword(updatedUser);
  }

  /**
   * 删除用户（软删除）
   */
  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id, status: 1 },
    });

    if (!user) {
      throw new NotFoundException(`用户ID ${id} 不存在`);
    }

    await this.userRepository.softRemove(user);
  }

  /**
   * 批量删除用户
   */
  async removeBatch(ids: string[]): Promise<void> {
    await this.userRepository.softDelete(ids);
  }

  /**
   * 排除密码字段
   */
  private excludePassword(user: User): User {
    const { password, ...safeUser } = user as any;
    return safeUser as User;
  }
}
