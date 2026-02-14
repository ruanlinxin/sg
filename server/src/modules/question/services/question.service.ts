import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Question } from '../entities/question.entity';
import { CreateQuestionDto, UpdateQuestionDto, QuestionQueryDto } from '../dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * 创建题目
   */
  async create(createDto: CreateQuestionDto): Promise<Question> {
    const question = this.questionRepository.create({
      ...createDto,
      source: createDto.source || 'create',
    });
    return await this.questionRepository.save(question);
  }

  /**
   * 分页查询题目列表
   */
  async findAll(queryDto: QuestionQueryDto) {
    const { keyword, page = 1, pageSize = 10 } = queryDto;

    const where: any = { status: 1 };

    if (keyword) {
      where.question = Like(`%${keyword}%`);
    }

    const [list, total] = await this.questionRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID查询题目
   */
  async findById(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id, status: 1 },
    });

    if (!question) {
      throw new NotFoundException(`题目ID ${id} 不存在`);
    }

    return question;
  }

  /**
   * 更新题目
   */
  async update(id: string, updateDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findById(id);

    Object.assign(question, updateDto);
    question.updatedAt = new Date();

    return await this.questionRepository.save(question);
  }

  /**
   * 删除题目（软删除）
   */
  async remove(id: string): Promise<void> {
    const question = await this.findById(id);
    await this.questionRepository.softRemove(question);
  }

  /**
   * 批量删除题目
   */
  async removeBatch(ids: string[]): Promise<void> {
    await this.questionRepository.softDelete(ids);
  }

  /**
   * 获取所有题目（不分页，用于前端缓存）
   */
  async findAllRaw(): Promise<Pick<Question, 'question' | 'answer' | 'indexes'>[]> {
    return await this.questionRepository.find({
      where: { status: 1 },
      order: { createdAt: 'DESC' },
      select: ['question', 'answer', 'indexes'],
    });
  }

  /**
   * 获取最新的更新时间
   */
  async getLatestUpdateTime(): Promise<string | null> {
    const result = await this.questionRepository
      .createQueryBuilder('question')
      .select('MAX(question.updatedAt)', 'latestUpdateTime')
      .where('question.status = :status', { status: 1 })
      .getRawOne<{ latestUpdateTime: string }>();

    return result?.latestUpdateTime || null;
  }

  /**
   * 从外部 API 同步题目数据
   */
  async syncQuestions(): Promise<{
    total: number;
    added: number;
    updated: number;
    skipped: number;
  }> {
    // 步骤一：获取版本号
    const versionResponse = await firstValueFrom(
      this.httpService.get<string>('https://api.qqsgtk.cn/qqsgtkApi/getVersion'),
    );
    const version = versionResponse.data;

    // 步骤二：使用版本号获取题目数据
    const dataResponse = await firstValueFrom(
      this.httpService.get<Array<{
        answer: string;
        indexes: string;
        question: string;
        id: number;
      }>>(
        `https://api.qqsgtk.cn/qqsgtkApi/gettkjson.js?version=${version}`,
      ),
    );

    const questions = dataResponse.data;

    // 步骤三：从数据库获取 source='sync' 的数据，做成 sourceId -> Question 的 map
    const existingQuestions = await this.questionRepository.find({
      where: { source: 'sync' },
    });
    const sourceIdMap = new Map<string, Question>();
    for (const q of existingQuestions) {
      if (q.sourceId) {
        sourceIdMap.set(q.sourceId, q);
      }
    }

    const toInsert: Partial<Question>[] = [];
    const toUpdate: Question[] = [];
    let skipped = 0;

    // 步骤四：对比数据，分类处理
    for (const item of questions) {
      const sourceId = String(item.id);
      const existing = sourceIdMap.get(sourceId);

      if (existing) {
        // 已存在，检查内容是否有变化
        if (
          existing.question !== item.question ||
          existing.answer !== item.answer ||
          existing.indexes !== item.indexes
        ) {
          // 有变化则更新
          existing.question = item.question;
          existing.answer = item.answer;
          existing.indexes = item.indexes;
          existing.updatedAt = new Date();
          toUpdate.push(existing);
        } else {
          skipped++;
        }
      } else {
        // 不存在则加入批量插入列表
        toInsert.push({
          question: item.question,
          answer: item.answer,
          indexes: item.indexes,
          source: 'sync',
          sourceId: sourceId,
        });
      }
    }

    // 步骤五：批量保存数据
    if (toInsert.length > 0) {
      await this.questionRepository.insert(toInsert);
    }

    if (toUpdate.length > 0) {
      await this.questionRepository.save(toUpdate);
    }

    return {
      total: questions.length,
      added: toInsert.length,
      updated: toUpdate.length,
      skipped,
    };
  }
}
