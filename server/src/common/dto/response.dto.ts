export class ApiResponse<T = any> {
  /**
   * 状态码
   */
  code: number;

  /**
   * 请求路径（拦截器自动填充）
   */
  path: string;

  /**
   * 消息
   */
  message: string;

  /**
   * 接口返回数据
   */
  data: T;

  constructor(code: number, path: string, message: string, data: T) {
    this.code = code;
    this.path = path;
    this.message = message;
    this.data = data;
  }

  /**
   * 成功响应（path 可选，拦截器会自动填充）
   */
  static success<T = any>(data?: T, message: string = '操作成功', path?: string): ApiResponse<T> {
    return new ApiResponse<T>(200, path || '', message, data);
  }

  /**
   * 失败响应（path 可选，拦截器会自动填充）
   */
  static error<T = any>(message: string = '操作失败', code: number = 500, data?: T, path?: string): ApiResponse<T> {
    return new ApiResponse<T>(code, path || '', message, data);
  }

  /**
   * 自定义响应
   */
  static create<T = any>(code: number, path: string, message: string, data: T): ApiResponse<T> {
    return new ApiResponse<T>(code, path, message, data);
  }
}
