import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@/common/entities';

/**
 * 题目实体
 */
@Entity('questions')
export class Question extends BaseEntity {
  /**
   * 题目内容
   */
  @Column({ type: 'text', nullable: false, comment: '题目内容' })
  question: string;

  /**
   * 答案内容
   */
  @Column({ type: 'text', nullable: false, comment: '答案内容' })
  answer: string;

  /**
   * 索引关键词，用于搜索
   */
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '索引关键词' })
  indexes: string;

  /**
   * 创建人ID
   */
  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true, comment: '创建人ID' })
  createdBy: string;
}
