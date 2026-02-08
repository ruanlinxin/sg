import { Injectable } from '@nestjs/common';
import { ApiResponse } from '@/common/dto/response.dto';

@Injectable()
export class AppService {
  getHello(): ApiResponse<string> {
    return ApiResponse.success<string>('Hello World!');
  }
}
