import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from '../services/question.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionQueryDto,
} from '../dto';
import { JwtAuthGuard } from '@/modules/system/auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '@/common';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  /**
   * 创建题目
   * POST /questions
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body(ValidationPipe) createDto: CreateQuestionDto) {
    return await this.questionService.create(createDto);
  }

  /**
   * 查询题目列表（分页）
   * GET /questions?page=1&pageSize=10&keyword=xxx
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(@Query(ValidationPipe) queryDto: QuestionQueryDto) {
    return await this.questionService.findAll(queryDto);
  }

  /**
   * 获取所有题目（不分页，用于前端缓存）
   * 公开访问，不需要鉴权
   * GET /questions/all
   */
  @Get('all')
  async findAllRaw() {
    return await this.questionService.findAllRaw();
  }

  /**
   * 根据ID查询题目
   * GET /questions/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findById(@Param('id') id: string) {
    return await this.questionService.findById(id);
  }

  /**
   * 更新题目
   * PUT /questions/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateQuestionDto,
  ) {
    return await this.questionService.update(id, updateDto);
  }

  /**
   * 删除题目（软删除）
   * DELETE /questions/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    await this.questionService.remove(id);
    return null;
  }

  /**
   * 同步外部题目数据
   * POST /questions/sync
   */
  @Post('sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async sync() {
    return await this.questionService.syncQuestions();
  }
}
