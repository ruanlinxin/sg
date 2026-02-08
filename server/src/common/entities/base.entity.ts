import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

/**
 * 基础实体类
 * 所有实体都应继承此类，包含通用字段
 */
export abstract class BaseEntity {
  /**
   * 主键 ID，UUID 格式
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 创建时间
   */
  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  /**
   * 删除时间（软删除）
   */
  @DeleteDateColumn({ name: 'deleted_at', comment: '删除时间', nullable: true })
  deletedAt?: Date;

  /**
   * 状态：1-正常，0-禁用
   */
  @Column({
    type: 'tinyint',
    default: 1,
    comment: '状态：1-正常，0-禁用',
  })
  status: number;
}
