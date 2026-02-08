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
    const question = this.questionRepository.create(createDto);
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
   * 从外部 API 同步题目数据
   */
  async syncQuestions(): Promise<{
    total: number;
    added: number;
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
    let added = 0;
    let skipped = 0;

    // 步骤三：对比并保存数据
    for (const item of questions) {
      // 检查数据库中是否已存在相同的 question
      const existing = await this.questionRepository.findOne({
        where: { question: item.question },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // 不存在则创建新记录
      const newQuestion = this.questionRepository.create({
        question: item.question,
        answer: item.answer,
        indexes: item.indexes,
      });

      await this.questionRepository.save(newQuestion);
      added++;
    }

    return {
      total: questions.length,
      added,
      skipped,
    };
  }
}
