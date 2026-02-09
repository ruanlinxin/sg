import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { UserModule } from '@/modules/system/user/user.module';
import { RoleModule } from '@/modules/system/role/role.module';
import { AuthModule } from '@/modules/system/auth/auth.module';

/**
 * 系统管理模块
 * 包含用户管理、角色管理等系统级功能
 */
@Module({
  imports: [
    UserModule,
    RoleModule,
    AuthModule,
    RouterModule.register([
      {
        path: 'system',
        module: UserModule,
      },
      {
        path: 'system',
        module: RoleModule,
      },
      {
        path: 'system',
        module: AuthModule,
      },
    ]),
  ],
  exports: [UserModule, RoleModule, AuthModule],
})
export class SystemModule {}
