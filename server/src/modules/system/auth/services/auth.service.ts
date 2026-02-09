import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '@/modules/system/user/services/user.service';
import { LoginDto, RegisterDto } from '../dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    // 查找用户（包含角色）
    const user = await this.userService.findByUsernameWithRoles(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成JWT token
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        roles: user.roles?.map(role => ({
          id: role.id,
          code: role.code,
          name: role.name,
        })) || [],
      },
    };
  }

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    // 检查用户名是否已存在
    const existingUser = await this.userService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new ConflictException('用户名已被使用');
    }

    // 创建用户
    const user = await this.userService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      nickname: registerDto.nickname,
    });

    // 生成JWT token
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        roles: [],
      },
    };
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(userId: string) {
    const user = await this.userService.findByIdWithRoles(userId);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
      roles: user.roles?.map(role => ({
        id: role.id,
        code: role.code,
        name: role.name,
      })) || [],
    };
  }
}
