import { generateHeaderUserInfo, UserInfo } from '@maplestory/common';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
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
  async hasUserLoggedIn(user: UserInfo): Promise<boolean> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get(`${this.authApiUrl}/api/auth/users/${user.id}/login-history`, {
            headers: { ...generateHeaderUserInfo(user) },
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Auth 서버 통신 오류 (${error.message})`,
                error.stack
              );

              if (error.response) {
                // HTTP 응답이 있는 경우 (4xx, 5xx 오류)
                this.logger.error(
                  `Auth 서버 응답 오류: ${
                    error.response.status
                  } - ${JSON.stringify(error.response.data)}`
                );
              } else if (error.request) {
                this.logger.error('Auth 서버로부터 응답이 없습니다');
              }

              // 서비스 장애로 간주하고 예외 발생
              throw new ServiceUnavailableException(
                'Auth 서비스에 일시적인 장애가 발생했습니다'
              );
            })
          )
      );

      // 응답 로깅
      this.logger.debug(`Auth 서버 응답: ${JSON.stringify(data)}`);

      // 응답에서 로그인 이력 여부 확인
      return data.success && data.data.hasLoginHistory === true;
    } catch (error) {
      // ServiceUnavailableException은 상위로 전파하여 처리
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error(
        `사용자 ${user.id}의 로그인 이력 확인 중 오류: ${error.message}`,
        error.stack
      );

      // 기본적으로는 false 반환 (로그인 이력 없음으로 처리)
      return false;
    }
  }
}
