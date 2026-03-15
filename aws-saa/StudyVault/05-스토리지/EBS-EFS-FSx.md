---
tags: #storage #ebs #efs #fsx #block-storage #file-storage
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
part: Domain 2 & 3
keywords: EBS, EFS, FSx, gp3, io2, IOPS, throughput, NFS, SMB, Windows File Server, Lustre
---
# EBS, EFS, FSx 스토리지

## Amazon EBS (블록 스토리지)

### 볼륨 유형 비교

| 유형 | 종류 | IOPS | 처리량 | 용도 |
|------|------|------|--------|------|
| gp3 | SSD | 최대 16,000 | 최대 1,000 MB/s | 범용 (권장) |
| gp2 | SSD | 최대 16,000 | 최대 250 MB/s | 범용 (구버전) |
| io2/io2 Block Express | SSD | 최대 256,000 | 최대 4,000 MB/s | 고성능 DB |
| st1 | HDD | 최대 500 | 최대 500 MB/s | 대용량 순차 읽기 |
| sc1 | HDD | 최대 250 | 최대 250 MB/s | 콜드 스토리지 |

> [!important] gp2 vs gp3
> gp2: IOPS = 3 × GB (크기에 종속)
> gp3: IOPS와 처리량 **독립 설정** (더 유연, 20% 저렴)

> [!tip] EC2 인스턴스 스토어 vs EBS
> 인스턴스 스토어: 물리 디스크 직접 연결, 최고 성능, 인스턴스 종료 시 **데이터 소멸**
> EBS: 네트워크 연결, 인스턴스 종료 후에도 **데이터 유지**

### EBS 특징
- **단일 AZ**: 동일 AZ의 EC2에만 연결 가능
- **다중 연결(Multi-Attach)**: io1/io2만 지원, 최대 16개 EC2
- **스냅샷**: S3에 증분 백업, 교차 리전 복사 가능

### EBS 암호화
- KMS CMK로 암호화
- 암호화된 스냅샷 → 복원 시 암호화 유지
- 미암호화 → 암호화 전환: 스냅샷 복사 시 암호화 활성화 → 새 볼륨 복원

## Amazon EFS (탄력적 파일 시스템)

### 특징
- **NFS v4 프로토콜** (Linux 전용)
- **다중 AZ**: 여러 AZ의 여러 EC2 동시 마운트 가능
- **자동 스케일링**: 수 GB → 수 PB 자동 확장
- 유휴 파일 자동 아카이브 (EFS Intelligent Tiering)

### 성능 모드
| 모드 | 특징 | 용도 |
|------|------|------|
| General Purpose | 낮은 지연시간 | 웹 서버, CMS |
| Max I/O | 높은 처리량, 높은 지연 | 빅데이터, 미디어 처리 |

### 처리량 모드
| 모드 | 특징 |
|------|------|
| Bursting | 파일 시스템 크기에 비례 |
| Provisioned | 크기와 무관하게 처리량 설정 |
| Elastic (권장) | 자동 조정 |

> [!important] EFS vs EBS 선택
> 여러 EC2에서 **공유** 필요 → EFS
> 단일 EC2 전용, 고성능 → EBS
> Windows → FSx for Windows

## Amazon FSx

### FSx 유형 비교

| 유형 | 프로토콜 | OS | 용도 |
|------|----------|-----|------|
| FSx for Windows File Server | SMB | Windows | AD 통합, NTFS |
| FSx for Lustre | Lustre | Linux | HPC, ML, 빅데이터 |
| FSx for NetApp ONTAP | NFS/SMB/iSCSI | Linux/Windows | 엔터프라이즈, 데이터 마이그레이션 |
| FSx for OpenZFS | NFS | Linux | ZFS 워크로드 |

> [!important] FSx for Windows vs EFS
> Windows EC2 공유 스토리지 → FSx for Windows (SMB/AD 지원)
> Linux EC2 공유 스토리지 → EFS (NFS)

### FSx for Lustre & S3 통합
```
S3 버킷 ──연결──> FSx for Lustre (고성능 처리)
                          ↓
                 처리 완료 후 S3로 다시 저장
```

## 시험 함정

> [!warning]- 스토리지 함정
> - EBS: 단일 AZ 제약 → 다른 AZ 이동 시 스냅샷 필요
> - EFS: Linux/NFS 전용 → Windows는 FSx for Windows
> - 인스턴스 스토어: 인스턴스 중지/종료 시 데이터 소멸
> - io2 Multi-Attach: 클러스터링 소프트웨어 필요 (동시 쓰기 관리)
> - FSx for Lustre: S3와 통합 가능 (ML 학습 데이터 접근 최적화)

## Related Notes
- [[S3-완전가이드]]
- [[데이터이전-서비스]]
- [[고가용성-패턴]]
- [[Practice-스토리지]]
