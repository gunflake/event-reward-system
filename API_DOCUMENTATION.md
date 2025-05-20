# Event Reward System API 문서

이 문서는 Event Reward System의 모든 API 엔드포인트와 해당 요청/응답 형식을 설명합니다.

## 목차

1. [Auth API](#1-auth-api)

   - [회원가입 (Signup)](#11-회원가입-signup)
   - [로그인 (Login)](#12-로그인-login)
   - [토큰 갱신 (Refresh)](#13-토큰-갱신-refresh)
   - [사용자 정보 조회 (Get Me)](#14-사용자-정보-조회-get-me)
   - [로그인 이력 조회 (Get Login History)](#15-로그인-이력-조회-get-login-history)
   - [사용자 역할 변경 (Update Role)](#16-사용자-역할-변경-update-role)

2. [Event API](#2-event-api)
   - [이벤트 생성 (Create Event)](#21-이벤트-생성-create-event)
   - [이벤트 목록 조회 (Get Events)](#22-이벤트-목록-조회-get-events)
   - [이벤트 상세 조회 (Get Event Detail)](#23-이벤트-상세-조회-get-event-detail)
   - [보상 추가 (Create Reward)](#24-보상-추가-create-reward)
   - [보상 목록 조회 (Get Rewards)](#25-보상-목록-조회-get-rewards)
   - [보상 상세 조회 (Get Reward Detail)](#26-보상-상세-조회-get-reward-detail)
   - [보상 수정 (Update Reward)](#27-보상-수정-update-reward)
   - [보상 삭제 (Delete Reward)](#28-보상-삭제-delete-reward)
   - [보상 청구 (Claim Reward)](#29-보상-청구-claim-reward)
   - [보상 청구 내역 조회 (Get Claims)](#210-보상-청구-내역-조회-get-claims)

---

## 1. Auth API

### 1.1. 회원가입 (Signup)

**엔드포인트:** `POST /api/auth/signup`

**설명:** 새로운 사용자 계정을 생성합니다.

**권한:** 인증 불필요

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "사용자닉네임"
}
```

**Response:**

```
{
    "success": true,
    "data": {
        "success": true,
        "data": {
            "user": {
                "id": "682c2d243fcdd1446b0d7f81",
                "email": "user@example.com",
                "nickname": "사용자닉네임",
                "role": "USER"
            }
        }
    }
}
```

### 1.2. 로그인 (Login)

**엔드포인트:** `POST /api/auth/login`

**설명:** 사용자 인증 후 액세스 토큰과 리프레시 토큰을 발급합니다.

**권한:** 인증 불필요

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```
{
    "success": true,
    "data": {
        "success": true,
        "data": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODJjMmQyNDNmY2RkMTQ0NmIwZDdmODEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc0NzcyNTY1MSwiZXhwIjoxNzQ3NzI3NDUxfQ.jsxJpmUdwv2Lj-yYKn2qoF6C5j4HySLEuSb2wWO4-yc",
            "refreshToken": "eed26e90f2b45f030d5f43fa44496a98085138b46a0f5e175504d5ba527cc3e4",
            "user": {
                "id": "682c2d243fcdd1446b0d7f81",
                "email": "user@example.com",
                "nickname": "사용자닉네임",
                "role": "USER"
            }
        }
    }
}
```

### 1.3. 토큰 갱신 (Refresh)

**엔드포인트:** `POST /api/auth/refresh`

**설명:** 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.

**권한:** 인증 불필요

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```
{
    "success": true,
    "data": {
        "success": true,
        "data": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODJjMmQyNDNmY2RkMTQ0NmIwZDdmODEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc0NzcyNTY5MiwiZXhwIjoxNzQ3NzI3NDkyfQ.13vpE7V5G15qLPRAzW7XutdIVmOJVUch4PizWzvRUoU",
            "refreshToken": "eed26e90f2b45f030d5f43fa44496a98085138b46a0f5e175504d5ba527cc3e4",
            "user": {
                "id": "682c2d243fcdd1446b0d7f81",
                "email": "user@example.com",
                "nickname": "사용자닉네임",
                "role": "USER"
            }
        }
    }
}
```

### 1.4. 사용자 정보 조회 (Get Me)

**엔드포인트:** `GET /api/auth/users/me`

**설명:** 현재 로그인한 사용자의 정보를 조회합니다.

**권한:** 로그인 필요

**Request:**

```
// 헤더에 Authorization: Bearer {액세스토큰} 필요
```

**Response:**

```
{
    "success": true,
    "data": {
        "success": true,
        "data": {
            "id": "682c2d243fcdd1446b0d7f81",
            "email": "user@example.com",
            "nickname": "사용자닉네임",
            "role": "USER"
        }
    }
}
```

### 1.5. 로그인 이력 조회 (Get Login History)

**엔드포인트:** `GET /api/auth/users/:userId/login-history`

**설명:** 특정 사용자의 로그인 이력을 조회합니다.

**권한:**

- 자신의 이력은 본인만 조회 가능
- 다른 사용자의 이력은 ADMIN, OPERATOR, AUDITOR 권한 필요

**Request:**

```
// 헤더에 Authorization: Bearer {액세스토큰} 필요
// URL 파라미터: userId - 조회할 사용자의 ID
```

**Response:**

```
{
    "success": true,
    "data": {
        "success": true,
        "data": {
            "userId": "682c2d243fcdd1446b0d7f81",
            "hasLoginHistory": true,
            "lastLoginAt": "2025-05-20T07:20:52.037Z"
        }
    }
}
```

### 1.6. 사용자 역할 변경 (Update Role)

**엔드포인트:** `PATCH /api/auth/users/:userId/role`

**설명:** 특정 사용자의 역할을 변경합니다.

**권한:** ADMIN 권한 필요

**Request:**

```json
// 헤더에 Authorization: Bearer {액세스토큰} 필요
// URL 파라미터: userId - 역할을 변경할 사용자의 ID

{
  "role": "OPERATOR" // "USER", "OPERATOR", "AUDITOR", "ADMIN" 중 하나
}
```

**Response:**

```
{
    "success": true,
    "data": {
        "success": true,
        "data": {
            "user": {
                "id": "682c2d243fcdd1446b0d7f81",
                "email": "user@example.com",
                "nickname": "사용자닉네임",
                "role": "OPERATOR"
            }
        }
    }
}
```

---

## 2. Event API

### 2.1. 이벤트 생성 (Create Event)

**엔드포인트:** `POST /api/event/events`

**설명:** 새로운 이벤트를 생성합니다.

**권한:** ADMIN 또는 OPERATOR 권한 필요

**Request:**

```json
// 헤더에 Authorization: Bearer {액세스토큰} 필요

{
  "name": "첫 로그인 이벤트",
  "description": "처음 로그인한 사용자에게 보상을 지급하는 이벤트입니다.",
  "type": "LOGIN",
  "startDate": "2023-06-01T00:00:00.000Z",
  "endDate": "2023-06-30T23:59:59.999Z",
  "conditions": [
    {
      "type": "LOGIN_DAYS",
      "value": 1,
      "description": "1회 이상 로그인"
    }
  ],
  "status": "ACTIVE"
}
```

**Response:**

```
{
    "success": true,
    "data": {
        "name": "첫 로그인 이벤트",
        "description": "처음 로그인한 사용자에게 보상을 지급하는 이벤트입니다.",
        "type": "LOGIN",
        "startDate": "2023-06-01T00:00:00.000Z",
        "endDate": "2023-06-30T23:59:59.999Z",
        "conditions": [
            {
                "type": "LOGIN_DAYS",
                "value": 1,
                "description": "1회 이상 로그인"
            }
        ],
        "status": "ACTIVE",
        "createdBy": "682c2dde3fcdd1446b0d7f8c",
        "_id": "682c2e5e67f846661abfcf35",
        "createdAt": "2025-05-20T07:25:18.991Z",
        "updatedAt": "2025-05-20T07:25:18.991Z",
        "__v": 0
    }
}
```

### 2.2. 이벤트 목록 조회 (Get Events)

**엔드포인트:** `GET /api/event/events`

**설명:** 이벤트 목록을 조회합니다.

**권한:** ADMIN 또는 OPERATOR 권한 필요

**Request:**

```
// 헤더에 Authorization: Bearer {액세스토큰} 필요

// 쿼리 파라미터 (선택사항):
// page - 페이지 번호 (기본값: 1)
// limit - 페이지당 항목 수 (기본값: 10)
// status - 이벤트 상태 필터 (ACTIVE 또는 INACTIVE)
// startDate - 시작일 필터
// endDate - 종료일 필터
```

**Response:**

```
{
    "success": true,
    "data": {
        "data": [
            {
                "id": "682c2e5e67f846661abfcf35",
                "name": "첫 로그인 이벤트",
                "description": "처음 로그인한 사용자에게 보상을 지급하는 이벤트입니다.",
                "startDate": "2023-06-01T00:00:00.000Z",
                "endDate": "2023-06-30T23:59:59.999Z",
                "status": "ACTIVE",
                "createdAt": "2025-05-20T07:25:18.991Z",
                "updatedAt": "2025-05-20T07:25:18.991Z"
            },
            {
                "id": "682c1de34600211f54d8e57a",
                "name": "7일 연속 로그인 이벤트",
                "description": "7일 연속으로 로그인하면 특별 아이템을 받을 수 있는 이벤트입니다.",
                "startDate": "2023-06-01T00:00:00.000Z",
                "endDate": "2023-06-30T23:59:59.999Z",
                "status": "ACTIVE",
                "createdAt": "2025-05-20T06:14:59.923Z",
                "updatedAt": "2025-05-20T06:14:59.923Z"
            }
        ],
        "total": 2,
        "page": 1,
        "limit": 10
    }
}
```

### 2.3. 이벤트 상세 조회 (Get Event Detail)

**엔드포인트:** `GET /api/event/events/:id`

**설명:** 특정 이벤트의 상세 정보를 조회합니다.

**권한:** ADMIN 또는 OPERATOR 권한 필요

**Request:**

```
// 헤더에 Authorization: Bearer {액세스토큰} 필요
// URL 파라미터: id - 조회할 이벤트의 ID
```

**Response:**

```
{
    "success": true,
    "data": {
        "id": "682c2e5e67f846661abfcf35",
        "name": "첫 로그인 이벤트",
        "description": "처음 로그인한 사용자에게 보상을 지급하는 이벤트입니다.",
        "startDate": "2023-06-01T00:00:00.000Z",
        "endDate": "2023-06-30T23:59:59.999Z",
        "conditions": [
            {
                "type": "LOGIN_DAYS",
                "value": 1,
                "description": "1회 이상 로그인"
            }
        ],
        "status": "ACTIVE",
        "createdBy": "682c2dde3fcdd1446b0d7f8c",
        "createdAt": "2025-05-20T07:25:18.991Z",
        "updatedAt": "2025-05-20T07:25:18.991Z",
        "rewards": [
            {
                "id": "682c2e8367f846661abfcf38",
                "eventId": "682c2e5e67f846661abfcf35",
                "name": "골드 코인",
                "type": "POINT",
                "value": {
                    "amount": 1000,
                    "currency": "gold"
                },
                "quantity": 1,
                "description": "이벤트 참여 보상으로 지급되는 1000 골드 코인",
                "createdAt": "2025-05-20T07:25:55.533Z",
                "updatedAt": "2025-05-20T07:25:55.533Z"
            }
        ]
    }
}
```

### 2.4. 보상 추가 (Create Reward)

**엔드포인트:** `POST /api/event/events/:eventId/rewards`

**설명:** 특정 이벤트에 보상을 추가합니다.

**권한:** ADMIN 또는 OPERATOR 권한 필요

**Request:**

```json
// 헤더에 Authorization: Bearer {액세스토큰} 필요
// URL 파라미터: eventId - 보상을 추가할 이벤트의 ID

{
  "name": "골드 코인",
  "type": "POINT",
  "value": {
    "amount": 1000,
    "currency": "gold"
  },
  "quantity": 1,
  "description": "이벤트 참여 보상으로 지급되는 1000 골드 코인"
}
```

**Response:**

```
{
    "success": true,
    "data": {
        "id": "682c2e8367f846661abfcf38",
        "eventId": "682c2e5e67f846661abfcf35",
        "name": "골드 코인",
        "type": "POINT",
        "value": {
            "amount": 1000,
            "currency": "gold"
        },
        "quantity": 1,
        "description": "이벤트 참여 보상으로 지급되는 1000 골드 코인",
        "createdAt": "2025-05-20T07:25:55.533Z",
        "updatedAt": "2025-05-20T07:25:55.533Z"
    }
}
```

### 2.5. 보상 목록 조회 (Get Rewards)

**엔드포인트:** `GET /api/event/events/:eventId/rewards`

**설명:** 특정 이벤트의 보상 목록을 조회합니다.

**권한:** ADMIN 또는 OPERATOR 권한 필요

**Request:**

```
// 헤더에 Authorization: Bearer {액세스토큰} 필요
// URL 파라미터: eventId - 보상을 조회할 이벤트의 ID

// 쿼리 파라미터 (선택사항):
// page - 페이지 번호 (기본값: 1)
// limit - 페이지당 항목 수 (기본값: 10)
// type - 보상 유형 필터 (POINT, ITEM, COUPON)
// sort - 정렬 기준 (기본값: createdAt)
// order - 정렬 순서 (asc 또는 desc, 기본값: desc)
```

**Response:**

```
{
    "success": true,
    "data": {
        "rewards": [
            {
                "id": "682c2e8367f846661abfcf38",
                "eventId": "682c2e5e67f846661abfcf35",
                "name": "골드 코인",
                "type": "POINT",
                "value": {
                    "amount": 1000,
                    "currency": "gold"
                },
                "quantity": 1,
                "description": "이벤트 참여 보상으로 지급되는 1000 골드 코인",
                "createdAt": "2025-05-20T07:25:55.533Z",
                "updatedAt": "2025-05-20T07:25:55.533Z"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 10
    }
}
```

### 2.6. 보상 상세 조회 (Get Reward Detail)

**엔드포인트:** `GET /api/event/events/:eventId/rewards/:id`

**설명:** 특정 이벤트의 특정 보상 상세 정보를 조회합니다.

**권한:** ADMIN 또는 OPERATOR 권한 필요

**Request:**

```
// 헤더에 Authorization: Bearer {액세스토큰} 필요
// URL 파라미터:
// - eventId: 이벤트의 ID
// - id: 조회할 보상의 ID
```

**Response:**

```
{
    "success": true,
    "data": {
        "id": "682c2e8367f846661abfcf38",
        "eventId": "682c2e5e67f846661abfcf35",
        "name": "골드 코인",
        "type": "POINT",
        "value": {
            "amount": 1000,
            "currency": "gold"
        },
        "quantity": 1,
        "description": "이벤트 참여 보상으로 지급되는 1000 골드 코인",
        "createdAt": "2025-05-20T07:25:55.533Z",
        "updatedAt": "2025-05-20T07:25:55.533Z"
    }
}
```

### 2.7. 보상 수정 (Update Reward)

**엔드포인트:** `PUT /api/event/events/:eventId/rewards/:id`

**설명:** 특정 이벤트의 특정 보상 정보를 수정합니다.

**권한:** ADMIN 또는 OPERATOR 권한 필요

**Request:**

```json
// 헤더에 Authorization: Bearer {액세스토큰} 필요
// URL 파라미터:
// - eventId: 이벤트의 ID
// - id: 수정할 보상의 ID

{
  "name": "프리미엄 골드 코인",
  "type": "POINT",
  "value": {
    "amount": 2000,
    "currency": "gold"
  },
  "quantity": 1,
  "description": "이벤트 참여 보상으로 지급되는 2000 골드 코인 (업그레이드)"
}
```

**Response:**

```
{
    "success": true,
    "data": {
        "id": "682c2e8367f846661abfcf38",
        "eventId": "682c2e5e67f846661abfcf35",
        "name": "프리미엄 골드 코인",
        "type": "POINT",
        "value": {
            "amount": 2000,
            "currency": "gold"
        },
        "quantity": 1,
        "description": "이벤트 참여 보상으로 지급되는 2000 골드 코인 (업그레이드)",
        "createdAt": "2025-05-20T07:25:55.533Z",
        "updatedAt": "2025-05-20T07:28:50.568Z"
    }
}
```

### 2.8. 보상 삭제 (Delete Reward)

**엔드포인트:** `DELETE /api/event/events/:eventId/rewards/:id`

**설명:** 특정 이벤트의 특정 보상을 삭제합니다.

**권한:** ADMIN 또는 OPERATOR 권한 필요

**Request:**

```
// 헤더에 Authorization: Bearer {액세스토큰} 필요
// URL 파라미터:
// - eventId: 이벤트의 ID
// - id: 삭제할 보상의 ID
```

**Response:**

```
{
    "success": true
}
```

### 2.9. 보상 청구 (Claim Reward)

**엔드포인트:** `POST /api/event/events/:eventId/claim`

**설명:** 특정 이벤트의 보상을 청구합니다.

**권한:** 로그인 필요 (모든 인증된 사용자)

**Request:**

```
// 헤더에 Authorization: Bearer {액세스토큰} 필요
// URL 파라미터: eventId - 보상을 청구할 이벤트의 ID

// 요청 본문 없음 (시스템에서 자동으로 사용자의 조건 충족 여부를 확인)
```

**Response:**

```
{
    "success": true,
    "data": {
        "id": "682c2fb767f846661abfcf4c",
        "eventId": "682c2e5e67f846661abfcf35",
        "userId": "682c2dde3fcdd1446b0d7f8c",
        "status": "APPROVED",
        "rewards": [
            {
                "rewardId": "682c2f6867f846661abfcf45",
                "name": "골드 코인",
                "type": "POINT",
                "value": {
                    "amount": 1000,
                    "currency": "gold"
                },
                "issuedAt": "2025-05-20T07:31:03.161Z"
            }
        ],
        "createdAt": "2025-05-20T07:31:03.161Z"
    }
}
```

### 2.10. 보상 청구 내역 조회 (Get Claims)

**엔드포인트:** `GET /api/event/events/claims/me`

**설명:** 현재 로그인한 사용자의 보상 청구 내역을 조회합니다.

**권한:** 로그인 필요 (모든 인증된 사용자)

**Request:**

```
// 헤더에 Authorization: Bearer {액세스토큰} 필요

// 쿼리 파라미터 (선택사항):
// page - 페이지 번호 (기본값: 1)
// limit - 페이지당 항목 수 (기본값: 10)
// eventId - 특정 이벤트로 필터링
// status - 청구 상태로 필터링 (PENDING, APPROVED, REJECTED)
```

**Response:**

```
{
    "success": true,
    "data": {
        "data": [
            {
                "id": "682c2fb767f846661abfcf4c",
                "userId": "682c2dde3fcdd1446b0d7f8c",
                "eventId": "682c2e5e67f846661abfcf35",
                "eventName": "첫 로그인 이벤트",
                "rewards": [
                    {
                        "id": "682c2f6867f846661abfcf45",
                        "name": "골드 코인",
                        "type": "POINT",
                        "value": {
                            "amount": 1000,
                            "currency": "gold"
                        }
                    }
                ],
                "status": "APPROVED",
                "createdAt": "2025-05-20T07:31:03.161Z",
                "updatedAt": "2025-05-20T07:31:03.161Z"
            }
        ],
        "total": 1,
        "page": 1,
        "limit": 10
    }
}
```
