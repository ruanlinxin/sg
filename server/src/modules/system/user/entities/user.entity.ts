import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '@/common/entities';
import { Role } from '@/modules/system/role/entities/role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 100, nullable: false, comment: '邮箱' })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: '密码' })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '昵称' })
  nickname: string;

  @ManyToMany(() => Role, role => role.users)
  roles: Role[];
}
