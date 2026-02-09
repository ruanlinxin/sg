import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '@/common/entities';
import { User } from '@/modules/system/user/entities/user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 100, nullable: false, unique: true, comment: '角色编码' })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: false, comment: '角色名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '角色描述' })
  description: string;

  @ManyToMany(() => User, user => user.roles)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];
}
