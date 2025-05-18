import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Method } from 'axios';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private http: HttpService, private config: ConfigService) {}

  async forward(
    target: 'auth' | 'event',
    req: Request,
    extraHeaders: Record<string, string>
  ) {
    const base =
      target === 'auth'
        ? this.config.get('AUTH_SERVER_URL')
        : this.config.get('EVENT_SERVER_URL');

    // 필요 없는 hop-by-hop 헤더 제거
    const {
      host,
      connection,
      'content-length': _cl,
      'accept-encoding': _ae,
      ...safe
    } = req.headers as Record<string, string>;

    const url = base + req.originalUrl;

    try {
      const res = await firstValueFrom(
        this.http.request({
          method: req.method as Method,
          url: url,
          params: req.query,
          data: req.body,
          headers: { ...safe, ...extraHeaders }, // 안전한 헤더만 전달
        })
      );

      return res.data;
    } catch (error) {
      this.logger.error(`Proxy error: ${error.message}`);

      if (error.response) {
        // 원본 서버에서 보낸 에러 상태 코드와 데이터를 그대로 전달
        throw new HttpException(error.response.data, error.response.status);
      }

      // 응답이 없는 경우(서버 연결 실패 등)는 원래대로 예외 발생
      throw error;
    }
  }
}
