import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AuthIntegrationService {
  private readonly logger = new Logger(AuthIntegrationService.name);
  private readonly authApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.authApiUrl = this.configService.get<string>('AUTH_SERVER_URL');
    this.logger.debug(`Auth 서버 URL: ${this.authApiUrl}`);
  }

  /**
   * 사용자의 로그인 이력을 확인합니다.
   *
   * @param userId 사용자 ID
   * @returns 로그인 이력이 있으면 true, 없으면 false 반환
   */
  async hasUserLoggedIn(userId: string): Promise<boolean> {
    // Auth 서버의 사용자 로그인 이력 확인 API 호출
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.authApiUrl}/users/${userId}/login-history`)
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          })
        )
    );

    // 응답에서 로그인 이력 여부 확인
    return data && data.hasLoginHistory === true;
  }
}
