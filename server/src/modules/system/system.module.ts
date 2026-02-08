import { Module } from '@nestjs/common';
import { UserModule } from '@/modules/user/user.module';
import { RoleModule } from '@/modules/role/role.module';

/**
 * 系统管理模块
 * 包含用户管理、角色管理等系统级功能
 */
@Module({
  imports: [UserModule, RoleModule],
  exports: [UserModule, RoleModule],
})
export class SystemModule {}
