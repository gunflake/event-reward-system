# Event Reward System

## 1. 프로젝트 개요

본 프로젝트는 NX 모노레포 환경에서 NestJS와 TypeScript를 사용하여 개발된 마이크로서비스 아키텍처(MSA) 기반의 이벤트 보상 시스템입니다. 사용자의 특정 행동에 따라 보상을 지급하는 기능을 제공하며, 확장성과 유지보수성을 고려하여 설계되었습니다.

## 2. 서버 구성

- **Gateway Server**:
  - Port: `8000`
- **Auth Server**:
  - Port: `8001`
- **Event Server**:
  - Port: `8002`

## 3. 실행 방법 (Docker)

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 Docker Compose를 통해 모든 서비스를 실행할 수 있습니다.

```bash
docker-compose up -d
```

각 서비스는 `.env.docker` 파일에 정의된 환경 변수를 사용합니다.

## 3.1. 실행 시 주의사항

로컬 환경에서 MongoDB가 27017 포트로 실행 중인 경우, 해당 서비스를 중지한 후 Docker Compose를 실행해주세요. Docker Compose 설정에는 MongoDB 컨테이너가 27017 포트를 사용하도록 구성되어 있습니다.

## 4. 주요 설계 결정 사항

### 4.1. NX 모노레포 사용

- **코드 공유 및 재사용성**: `libs` 디렉토리를 통해 여러 서비스에서 공통으로 사용되는 로직(예: 데이터베이스 모듈, 유틸리티 함수, DTO 등)을 효율적으로 관리하고 재사용할 수 있습니다.
- **통합된 개발 환경**: 단일 저장소에서 모든 프로젝트를 관리함으로써, 의존성 관리, 빌드, 테스트, 린트 등의 개발 프로세스를 일관성 있게 유지하고 자동화하기 용이합니다.
- **명확한 의존성 관리**: NX는 프로젝트 간의 의존성을 명확하게 정의하고 시각화할 수 있는 기능을 제공하여, 복잡한 시스템에서의 변경 영향 범위를 쉽게 파악할 수 있도록 돕습니다.

### 4.2. 데이터베이스 분리

- 각 마이크로서비스(Auth, Event)는 논리적으로 또는 물리적으로 분리된 데이터베이스를 사용할 수 있도록 Database를 설계했습니다. 현재는 같은 클러스터인(27017 로컬서버)안에 `auth-db`와 `event-db`로 분리해서 사용하고 있지만, 원할경우 각 서버마다 각각의 클러스터로 구성된 DB 주소를 사용할 수 있습니다.

## 5. 서버 설명

- Gateway 서버만 외부에서 접속할 수 있고, auth server와 event server는 외부에서 접근하지 못하도록 되어있다고 가정한 후 서버 코드를 작성했습니다.

### 5.1 gateway 서버

- Gateway 서버는 `jwt-auth.guard.ts`에 사용자가 지정한 publicRoutes 패스에 대해서는 JWT 검증없이 진행하도록 구현하였고, 이 외 나머지 모든 API Path에 대해서는 검증을 한 후 진행하도록 구현했습니다.
- PUBLIC_ROUTES 등록은 .env(Root폴더)에서 정의합니다.
- JWT 검증을 한 후 id, role, email을 'x-user-id', 'x-uesr-email', 'x-user-role' 해더에 담아 리소스 서버(auth, event)로 보내도록 설계했습니다.

### 5.2 Auth 서버

- Auth 서버는 크게 인증 모듈(Auth Module)과 유저 관리 모듈(User Module)로 구분되어있습니다.
- login시 refreshToken과 accessToken을 발급합니다. refreshToken은 30일, accessToken은 30m 유효시간으로 설정을 하였고, refreshToken을 이용해서 accessToken을 재발급할 수 있도록 구현했습니다.
- refreshToken을 도입한 이유는 UX을 올리기 위해 고안되었습니다. 현재 발급된 RefreshToken을 목록으로 확인하고 원하는 RefreshToken을 revoke를 할 수 있도록 설계하였으나 과제 제출 시간 문제로 RefreshToken에 관련된 추가 관리 부분은 구현하지 못했습니다.
- **ADMIN** 계정은 DB에서 직접 사용자가 ADMIN으로 변경하는 방식으로 설계했습니다. 따라서 ADMIN으로 설정하는 코드가 존재하지 않습니다.

### 5.3 Event 서버

- Event 서버 유저 보상 요청을 검증하는 로직은 event 서버에서 다른 리소스서버(auth server, game server등)로 요청을 보내 해당 유저가 조건을 만족하는지 확인하는 방식으로 구현했습니다.
- 구현된 Event 조건은 "로그인을 한 번이라도 한 유저"에 대해 검증을 통해 만족하면 보상을 지급하는 이벤트 하나만 구현이 되어있습니다.

### 6. DB 스키마 설계

프로젝트에서는 MongoDB를 사용하여 각 서비스에 필요한 데이터를 관리합니다. 각 스키마는 NestJS의 Mongoose 모듈을 활용하여 정의되었으며, 서비스 간 명확한 책임 분리를 위해 도메인별로 설계되었습니다.

#### 6.1. 사용자 관련 스키마 (Auth Server)

##### 6.1.1. User 스키마

```typescript
@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  nickname: string;
  @Prop({ type: String, enum: Role, default: Role.USER })
  role: Role;
  @Prop({ type: Date })
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

- **주요 특징**:
  - 사용자 인증 및 권한 관리를 위한 기본 정보 저장
  - 비밀번호는 argon2id 알고리즘으로 해시 처리 (보안 강화)
  - Role 기반 권한 관리 시스템 (USER, OPERATOR, AUDITOR, ADMIN)
  - 마지막 로그인 시간 기록으로 사용자 활동 추적 가능

##### 6.1.2. RefreshToken 스키마

```typescript
@Schema({ timestamps: true })
export class RefreshToken {
  _id: Types.ObjectId;
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true, unique: true })
  token: string;
  @Prop({ required: true })
  issuedAt: Date;
  @Prop({ required: true })
  expiresAt: Date;
  @Prop({ default: false })
  isRevoked: boolean;
  @Prop()
  revokedAt?: Date;
}
```

- **주요 특징**:
  - JWT 인증 시스템의 RefreshToken 관리
  - 토큰 만료 시간 기반 MongoDB TTL 인덱스 적용 (자동 만료 처리)
  - 토큰 폐기(revoke) 기능으로 보안 강화
  - 사용자별 토큰 관리를 위한 userId 인덱싱

#### 6.2. 이벤트 관련 스키마 (Event Server)

##### 6.2.1. Event 스키마

```typescript
@Schema({ timestamps: true })
export class Event {
  _id: Types.ObjectId;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({
    required: true,
    type: String,
    enum: Object.values(EventType),
  })
  type: EventType;
  @Prop({ required: true })
  startDate: Date;
  @Prop({ required: true })
  endDate: Date;
  @Prop({ type: [{ type: Object }] })
  conditions: EventCondition[];
  @Prop({ required: true, type: String, enum: Object.values(EventStatus) })
  status: EventStatus;
  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

- **주요 특징**:
  - 이벤트의 기본 정보(이름, 설명, 유형, 기간, 상태) 관리
  - 유연한 이벤트 조건 설정을 위한 EventCondition 배열 구조
  - 다양한 이벤트 유형(LOGIN, LEVEL_UP, MISSION_COMPLETE 등) 지원
  - 이벤트 상태(ACTIVE, INACTIVE) 관리

##### 6.2.2. Reward 스키마

```typescript
@Schema({ timestamps: true })
export class Reward {
  _id: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true })
  eventId: Types.ObjectId;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, type: String, enum: Object.values(RewardType) })
  type: RewardType;
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  value: any;
  @Prop({ required: true })
  quantity: number;
  @Prop({ required: true })
  description: string;
  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

- **주요 특징**:
  - 이벤트별 보상 정보 관리
  - 다양한 보상 유형(POINT, ITEM, COUPON) 지원
  - 유연한 보상 값 저장을 위한 Mixed 타입 사용
  - eventId 기반 인덱스로 이벤트별 보상 빠른 조회 가능

##### 6.2.3. RewardClaim 스키마

```typescript
@Schema({ timestamps: true })
export class RewardClaim {
  _id: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true })
  eventId: Types.ObjectId;
  @Prop({
    type: String,
    enum: Object.values(ClaimStatus),
    default: ClaimStatus.PENDING,
  })
  status: ClaimStatus;
  @Prop({ type: MongooseSchema.Types.Mixed })
  evidence?: any;
  @Prop({ type: [Object], default: [] })
  rewards: IssuedReward[];
  @Prop({ type: Date })
  verifiedAt?: Date;
  @Prop({ type: Types.ObjectId })
  verifiedBy?: Types.ObjectId;
  @Prop()
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

- **주요 특징**:
  - 사용자의 이벤트 보상 청구 및 처리 상태 관리
  - 보상 청구 상태(PENDING, APPROVED, REJECTED) 추적
  - 중복 청구 방지를 위한 userId+eventId 복합 유니크 인덱스
  - 지급된 보상 정보 기록을 위한 IssuedReward 배열
  - 검증 과정 추적을 위한 verifiedAt, verifiedBy 필드
