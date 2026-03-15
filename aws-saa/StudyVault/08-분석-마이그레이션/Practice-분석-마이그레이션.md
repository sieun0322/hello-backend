---
tags: #analytics #kinesis #glue #migration #practice
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
---
# Practice: 분석 및 마이그레이션

> Kinesis, Glue, Athena, EMR, Lake Formation, 마이그레이션 관련 문제

**총 문제 수:** 60개

## Related Concepts
[[Kinesis-실시간분석]], [[데이터분석-서비스]], [[마이그레이션-서비스]]

---

### Q2

회사는 독점 애플리케이션의 로그 파일을 분석할 수 있는 능력이 필요합니다. 로그는 Amazon S3 버킷에 JSON 형식으로 저장됩니다. 쿼리는 간단하고 주문형으로 실행됩니다. 솔루션 설계자는 기존 아키텍처에 대한 최소한의 변경으로 분석을 수행해야 합니다. 솔루션 설계자는 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** Amazon Redshift 를 사용하여 모든 콘텐츠를 한 곳에 로드하고 필요에 따라 SQL 쿼리를 실행합니다.
- **B.** Amazon CloudWatch Logs 를 사용하여 로그를 저장합니다. Amazon CloudWatch 콘솔에서 필요에 따라 SQL 쿼리를 실행합니다.
- **C.** Amazon S3 와 함께 Amazon Athena 를 직접 사용하여 필요에 따라 쿼리를 실행합니다.
- **D.** AWS Glue 를 사용하여 로그를 분류합니다. Amazon EMR 에서 임시 Apache Spark 클러스터를 사용하여 필요에 따라 SQL 쿼리를 실행합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q7

회사에 들어오는 메시지를 수집하는 응용 프로그램이 있습니다. 그러면 수십 개의 다른 애플리케이션과 마이크로서비스가 이러한 메시지를 빠르게 소비합니다. 메시지 수는 급격하게 변하며 때로는 초당 100,000 개로 갑자기 증가하기도 합니다. 이 회사는 솔루션을 분리하고 확장성을 높이고자 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** Amazon Kinesis Data Analytics 에 대한 메시지를 유지합니다. 메시지를 읽고 처리하도록 소비자 애플리케이션을 구성합니다.
- **B.** Auto Scaling 그룹의 Amazon EC2 인스턴스에 수집 애플리케이션을 배포하여 CPU 지표를 기반으로 EC2 인스턴스 수를 확장합니다.
- **C.** 단일 샤드를 사용하여 Amazon Kinesis Data Streams 에 메시지를 씁니다. AWS Lambda 함수를 사용하여 메시지를 사전 처리하고 Amazon DynamoDB 에 저장합니다. 메시지를 처리하기 위해 DynamoDB 에서 읽도록 소비자 애플리케이션을 구성합니다.
- **D.** 여러 Amazon Simple Queue Service(Amazon SOS) 구독이 있는 Amazon Simple Notification Service(Amazon SNS) 주제에 메시지를 게시합니다 . 대기열의 메시지를 처리하도록 소비자 애플리케이션을 구성합니다 .

> [!answer]- 정답 보기
> **정답: D**

### Q14

회사는 Application Load Balancer 뒤의 Amazon EC2 인스턴스에서 전자 상거래 애플리케이션을 실행합니다. 인스턴스는 여러 가용 영역에 걸쳐 Amazon EC2 Auto Scaling 그룹에서 실행됩니다. Auto Scaling 그룹은 CPU 사용률 메트릭을 기반으로 확장됩니다. 전자 상거래 애플리케이션은 대규모 EC2 인스턴스에서 호스팅되는 MySQL 8.0 데이터베이스에 트랜잭션 데이터를 저장합니다. 애플리케이션 로드가 증가하면 데이터베이스의 성능이 빠르게 저하됩니다. 애플리케이션은 쓰기 트랜잭션보다 더 많은 읽기 요청을 처리합니다. 이 회사는 고가용성을 유지하면서 예측할 수 없는 읽기 워크로드의 수요를 충족하도록 데이터베이스를 자동으로 확장하는 솔루션을 원합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** 리더 및 컴퓨팅 기능을 위해 단일 노드와 함께 Amazon Redshift 를 사용하십시오.
- **B.** 단일 AZ 배포와 함께 Amazon RDS 사용 다른 가용 영역에 리더 인스턴스를 추가하도록 Amazon RDS 를 구성합니다.
- **C.** 다중 AZ 배포와 함께 Amazon Aurora 를 사용합니다. Aurora 복제본을 사용하여 Aurora Auto Scaling 을 구성합니다.
- **D.** EC2 스팟 인스턴스와 함께 Memcached 용 Amazon ElastiCache 를 사용합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q16

회사는 AWS 에서 데이터 레이크를 호스팅합니다. 데이터 레이크는 Amazon S3 및 PostgreSQL 용 Amazon RDS 의 데이터로 구성됩니다. 이 회사는 데이터 시각화를 제공하고 데이터 레이크 내의 모든 데이터 소스를 포함하는 보고 솔루션이 필요합니다. 회사의 관리 팀만 모든 시각화에 대한 전체 액세스 권한을 가져야 합니다. 나머지 회사는 제한된 액세스 권한만 가져야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** Amazon QuickSight 에서 분석을 생성합니다. 모든 데이터 소스를 연결하고 새 데이터 세트를 만듭니다. 대시보드를 게시하여 데이터를 시각화합니다. 적절한 IAM 역할과 대시보드를 공유합니다.
- **B.** Amazon QuickSight 에서 분석을 생성합니다. 모든 데이터 소스를 연결하고 새 데이터 세트를 만듭니다. 대시보드를 게시하여 데이터를 시각화합니다. 적절한 사용자 및 그룹과 대시보드를 공유합니다.
- **C.** Amazon S3 의 데이터에 대한 AWS Glue 테이블 및 크롤러를 생성합니다. AWS Glue 추출, 변환 및 로드(ETL) 작업을 생성하여 보고서를 생성합니다. 보고서를 Amazon S3 에 게시합니다. S3 버킷 정책을 사용하여 보고서에 대한 액세스를 제한합니다.
- **D.** Amazon S3 의 데이터에 대한 AWS Glue 테이블과 크롤러를 생성합니다. Amazon Athena 연합 쿼리를 사용하여 PostgreSQL 용 Amazon RDS 내의 데이터에 액세스합니다. Amazon Athena 를 사용하여 보고서를 생성합니다. 보고서를 Amazon S3 에 게시합니다. S3 버킷 정책을 사용하여 보고서에 대한 액세스를 제한합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q24

회사는 가장 최근 청구서에서 Amazon EC2 비용 증가를 관찰했습니다. 청구 팀은 몇 개의 EC2 인스턴스에 대한 인스턴스 유형의 원치 않는 수직적 확장을 발견했습니다. 솔루션 설계자는 지난 2 개월간의 EC2 비용을 비교하는 그래프를 생성하고 심층 분석을 수행하여 수직적 확장의 근본 원인을 식별해야 합니다. 솔루션 설계자는 운영 오버헤드가 가장 적은 정보를 어떻게 생성해야 합니까?

- **A.** AWS 예산을 사용하여 예산 보고서를 생성하고 인스턴스 유형에 따라 EC2 비용을 비교합니다.
- **B.** Cost Explorer 의 세분화된 필터링 기능을 사용하여 인스턴스 유형을 기반으로 EC2 비용에 대한 심층 분석을 수행합니다.
- **C.** AWS Billing and Cost Management 대시보드의 그래프를 사용하여 지난 2 개월 동안의 인스턴스 유형을 기준으로 EC2 비용을 비교합니다.
- **D.** AWS 비용 및 사용 보고서를 사용하여 보고서를 생성하고 Amazon S3 버킷으로 보냅니다. Amazon S3 와 함께 Amazon QuickSight 를 소스로 사용하여 인스턴스 유형을 기반으로 대화형 그래프를 생성합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q31

AWS 에서 웹 애플리케이션을 호스팅하는 회사는 모든 Amazon EC2 인스턴스를 보장하기를 원합니다. Amazon RDS DB 인스턴스. Amazon Redshift 클러스터는 태그로 구성됩니다. 회사는 이 검사를 구성하고 운영하는 노력을 최소화하기를 원합니다. 솔루션 설계자는 이를 달성하기 위해 무엇을 해야 합니까?

- **A.** AWS Config 규칙을 사용하여 적절하게 태그가 지정되지 않은 리소스를 정의하고 감지합니다.
- **B.** 비용 탐색기를 사용하여 제대로 태그가 지정되지 않은 리소스를 표시합니다. 해당 리소스에 수동으로 태그를 지정합니다.
- **C.** 적절한 태그 할당을 위해 모든 리소스를 확인하는 API 호출을 작성합니다. EC2 인스턴스에서 주기적으로 코드를 실행합니다.
- **D.** 적절한 태그 할당을 위해 모든 리소스를 확인하는 API 호출을 작성합니다. Amazon CloudWatch 를 통해 AWS Lambda 함수를 예약하여 코드를 주기적으로 실행합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q33

회사는 AWS 에서 온라인 마켓플레이스 웹 애플리케이션을 실행합니다. 이 애플리케이션은 피크 시간에 수십만 명의 사용자에게 서비스를 제공합니다. 이 회사는 수백만 건의 금융 거래 세부 정보를 다른 여러 내부 애플리케이션과 공유할 수 있는 확장 가능한 거의 실시간 솔루션이 필요합니다. 또한 지연 시간이 짧은 검색을 위해 문서 데이터베이스에 저장하기 전에 민감한 데이터를 제거하기 위해 트랜잭션을 처리해야 합니다. 이러한 요구 사항을 충족하기 위해 솔루션 설계자는 무엇을 권장해야 합니까?

- **A.** 트랜잭션 데이터를 Amazon DynamoDB 에 저장합니다. 쓰기 시 모든 트랜잭션에서 민감한 데이터를 제거하도록 DynamoDB 에서 규칙을 설정합니다. DynamoDB 스트림을 사용하여 다른 애플리케이션과 트랜잭션 데이터를 공유합니다.
- **B.** 트랜잭션 데이터를 Amazon Kinesis Data Firehose 로 스트리밍하여 Amazon DynamoDB 및 Amazon S3 에 데이터를 저장합니다. Kinesis Data Firehose 와 AWS Lambda 통합을 사용하여 민감한 데이터를 제거하십시오. 다른 애플리케이션은 Amazon S3 에 저장된 데이터를 사용할 수 있습니다.
- **C.** 트랜잭션 데이터를 Amazon Kinesis Data Streams 로 스트리밍합니다. AWS Lambda 통합을 사용하여 모든 트랜잭션에서 민감한 데이터를 제거한 다음 Amazon DynamoDB 에 트랜잭션 데이터를 저장합니다. 다른 애플리케이션은 Kinesis 데이터 스트림의 트랜잭션 데이터를 사용할 수 있습니다.
- **D.** 일괄 처리된 트랜잭션 데이터를 Amazon S3 에 파일로 저장합니다. Amazon S3 에서 파일을 업데이트하기 전에 AWS Lambda 를 사용하여 모든 파일을 처리하고 민감한 데이터를 제거하십시오. 그러면 Lambda 함수가 Amazon DynamoDB 에 데이터를 저장합니다. 다른 애플리케이션은 Amazon S3 에 저장된 트랜잭션 파일을 사용할 수 있습니다.

> [!answer]- 정답 보기
> **정답: C**

### Q40

회사에는 매일 1TB 의 상태 알림을 집합적으로 생성하는 수천 개의 에지 장치가 있습니다. 각 경고의 크기는 약 2KB 입니다. 솔루션 설계자는 향후 분석을 위해 경고를 수집하고 저장하는 솔루션을 구현해야 합니다. 회사는 고가용성 솔루션을 원합니다. 그러나 회사는 비용을 최소화해야 하며 추가 인프라  관리를 원하지 않습니다. 또한 회사는 즉각적인 분석을 위해 14 일 동안의 데이터를 유지하고 14 일이 지난 데이터를 보관하기를 원합니다. 이러한 요구 사항을 충족하는 가장 운영 효율성이 높은 솔루션은 무엇입니까?

- **A.** Amazon Kinesis Data Firehose 전송 스트림을 생성하여 알림을 수집합니다. Amazon S3 버킷에 알림을 전달하도록 Kinesis Data Firehose 스트림을 구성합니다. 14 일 후에 데이터를 Amazon S3 Glacier 로 전환하도록 S3 수명 주기 구성을 설정합니다.
- **B.** 두 가용 영역에서 Amazon EC2 인스턴스를 시작하고 Elastic Load Balancer 뒤에 배치하여 알림을 수집합니다. Amazon S3 버킷에 경고를 저장할 EC2 인스턴스에 대한 스크립트를 생성합니다. 14 일 후에 데이터를 Amazon S3 Glacier 로 전환하도록 S3 수명 주기 구성을 설정합니다.
- **C.** Amazon Kinesis Data Firehose 전송 스트림을 생성하여 알림을 수집합니다. Amazon OpenSearch Service(Amazon Elasticsearch Service) 클러스터에 알림을 전달하도록 Kinesis Data Firehose 스트림을 구성합니다. Amazon OpenSearch Service(Amazon Elasticsearch Service) 클러스터를 설정하여 매일 수동 스냅샷을 만들고 클러스터에서 14 일이 지난 데이터를 삭제합니다.
- **D.** Amazon Simple Queue Service(Amazon SQS) 표준 대기열을 생성하여 알림을 수집하고 메시지 보존 기간을 14 일로 설정합니다. SQS 대기열을 폴링하고, 메시지의 수명을 확인하고, 필요에 따라 메시지 데이터를 분석하도록 소비자를 구성합니다. 메시지가 14 일이 지난 경우 소비자는 메시지를 Amazon S3 버킷에 복사하고 SQS 대기열에서 메시지를 삭제해야 합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q41

회사의 애플리케이션은 데이터 수집을 위해 여러 SaaS(Software - as - a - Service) 소스와 통합됩니다. 이 회사는 Amazon EC2 인스턴스를 실행하여 데이터를 수신하고 분석을 위해 데이터를 Amazon S3 버킷에 업로드합니다. 데이터를 수신하고 업로드하는 동일한 EC2 인스턴스도 업로드가 완료되면 사용자에게 알림을 보냅니다. 회사는 느린 응용 프로그램 성능을 발견했으며 가능한 한 성능을 개선하려고 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** EC2 인스턴스가 확장할 수 있도록 Auto Scaling 그룹을 생성합니다. S3 버킷에 업로드가 완료되면 Amazon Simple Notification Service(Amazon SNS) 주제에 이벤트를 보내도록 S3 이벤트 알림을 구성합니다.
- **B.** Amazon AppFlow 흐름을 생성하여 각 SaaS 소스와 S3 버킷 간에 데이터를 전송합니다. S3 버킷에 업로드가 완료되면 Amazon Simple Notification Service(Amazon SNS) 주제에 이벤트를 보내도록 S3 이벤트 알림을 구성합니다.
- **C.** 각 SaaS 소스에 대해 Amazon EventBridge(Amazon CloudWatch Events) 규칙을 생성하여 출력 데이터를 보냅니다. S3 버킷을 규칙의 대상으로 구성합니다. S3 버킷에 업로드가 완료되면 이벤트를 전송하는 두 번째 EventBridge(Cloud Watch Events) 규칙을 생성합니다. Amazon Simple Notification Service(Amazon SNS) 주제를 두 번째 규칙의 대상으로 구성합니다.
- **D.** EC2 인스턴스 대신 사용할 Docker 컨테이너를 생성합니다. Amazon Elastic Container Service(Amazon ECS) 에서 컨테이너화된 애플리케이션을 호스팅합니다. S3 버킷에 업로드가 완료되면 Amazon Simple Notification Service(Amazon SNS) 주제에 이벤트를 보내도록 Amazon CloudWatch Container Insights 를 구성합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q49

회사는 매월 통화 기록 파일을 저장합니다. 사용자는 통화 후 1 년 이내에 파일에 무작위로 액세스하지만 1 년 이후에는 파일에 자주 액세스하지 않습니다. 이 회사는 사용자에게 1 년 미만의 파일을 가능한 한 빨리 쿼리하고 검색할 수 있는 기능을 제공하여 솔루션을 최적화하려고 합니다. 오래된 파일을 검색하는 데 있어 지연은 허용됩니다. 어떤 솔루션이 이러한 요구 사항을 가장 비용 효율적으로 충족합니까?

- **A.** Amazon S3 Glacier Instant Retrieval 에 태그가 있는 개별 파일을 저장합니다. 태그를 쿼리하여 S3 Glacier Instant Retrieval 에서 파일을 검색합니다.
- **B.** Amazon S3 Intelligent - Tiering 에 개별 파일을 저장합니다. S3 수명 주기 정책을 사용하여 1 년 후 파일을 S3 Glacier Flexible Retrieval 로 이동합니다. Amazon Athena 를 사용하여 Amazon S3 에 있는 파일을 쿼리하고 검색합니다. S3 Glacier Select 를 사용하여 S3 Glacier 에 있는 파일을 쿼리하고 검색합니다.
- **C.** Amazon S3 Standard 스토리지에 태그가 있는 개별 파일을 저장합니다. Amazon S3 Standard 스토리지의 각 아카이브에 대한 검색 메타데이터를 저장합니다. S3 수명 주기 정책을 사용하여 1 년 후에 파일을 S3 Glacier Instant Retrieval 로 이동합니다. Amazon S3 에서 메타데이터를 검색하여 파일을 쿼리하고 검색합니다.
- **D.** Amazon S3 Standard 스토리지에 개별 파일을 저장합니다. S3 수명 주기 정책을 사용하여 1 년 후에 파일을 S3 Glacier Deep Archive 로 이동합니다. Amazon RDS 에 검색 메타데이터를 저장합니다. Amazon RDS 에서 파일을 쿼리합니다. S3 Glacier Deep Archive 에서 파일을 검색합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q51

회사는 REST API 로 검색하기 위해 주문 배송 통계를 제공하는 애플리케이션을 개발 중입니다. 이 회사는 배송 통계를 추출하고 데이터를 읽기 쉬운 HTML 형식으로 구성하고 매일 아침 여러 이메일 주소로 보고서를 보내려고 합니다. 이러한 요구 사항을 충족하기 위해 솔루션 설계자는 어떤 단계 조합을 취해야 합니까? (2 개를 선택하세요.)

- **A.** 데이터를 Amazon Kinesis Data Firehose 로 보내도록 애플리케이션을 구성합니다.
- **B.** Amazon Simple Email Service(Amazon SES) 를 사용하여 데이터 형식을 지정하고 보고서를 이메일로 보냅니다.
- **C.** AWS Glue 작업을 호출하여 데이터에 대한 애플리케이션의 API 를 쿼리하는 Amazon EventBridge(Amazon CloudWatch Events) 예약 이벤트를 생성합니다.
- **D.** AWS Lambda 함수를 호출하여 데이터에 대한 애플리케이션의 API 를 쿼리하는 Amazon EventBridge(Amazon CloudWatch Events) 예약 이벤트를 생성합니다. E. Amazon S3 에 애플리케이션 데이터를 저장합니다. 보고서를 이메일로 보낼 S3 이벤트 대상으로 Amazon Simple Notification Service(Amazon SNS) 주제를 생성합니다.

> [!answer]- 정답 보기
> **정답: B, D**

### Q59

회사는 300 개 이상의 글로벌 웹사이트 및 애플리케이션을 호스팅합니다. 이 회사는 매일 30TB 이상의 클릭스트림 데이터를 분석할 플랫폼이 필요합니다. 솔루션 설계자는 클릭스트림 데이터를 전송하고 처리하기 위해 무엇을 해야 합니까?

- **A.** AWS Data Pipeline 을 설계하여 데이터를 Amazon S3 버킷에 보관하고 데이터로 Amazon EMR 클러스터를 실행하여 분석을 생성합니다.
- **B.** Amazon EC2 인스턴스의 Auto Scaling 그룹을 생성하여 데이터를 처리하고 Amazon Redshift 가 분석에 사용할 수 있도록 Amazon S3 데이터 레이크로 보냅니다.
- **C.** 데이터를 Amazon CloudFront 에 캐시합니다. Amazon S3 버킷에 데이터를 저장합니다. 객체가 S3 버킷에 추가될 때. AWS Lambda 함수를 실행하여 분석용 데이터를 처리합니다.
- **D.** Amazon Kinesis Data Streams 에서 데이터를 수집합니다. Amazon Kinesis Data Firehose 를 사용하여 Amazon S3 데이터 레이크로 데이터를 전송합니다. 분석을 위해 Amazon Redshift 에 데이터를 로드합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q77

회사는 애플리케이션에 대한 실시간 데이터 수집 아키텍처를 구성해야 합니다. 회사에는 데이터가 스트리밍될 때 데이터를 변환하는 프로세스인 API 와 데이터를 위한 스토리지 솔루션이 필요합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** Amazon EC2 인스턴스를 배포하여 Amazon Kinesis 데이터 스트림으로 데이터를 전송하는 API 를 호스팅합니다. Kinesis 데이터 스트림을 데이터 원본으로 사용하는 Amazon Kinesis Data Firehose 전송 스트림을 생성합니다. AWS Lambda 함수를 사용하여 데이터를 변환합니다. Kinesis Data Firehose 전송 스트림을 사용하여 데이터를 Amazon S3 로 보냅니다.
- **B.** Amazon EC2 인스턴스를 배포하여 AWS Glue 에 데이터를 전송하는 API 를 호스팅합니다. EC2 인스턴스에서 소스/ 대상 확인을 중지합니다. AWS Glue 를 사용하여 데이터를 변환하고 데이터를 Amazon S3 로 보냅니다.
- **C.** Amazon Kinesis 데이터 스트림으로 데이터를 보내도록 Amazon API Gateway API 를 구성합니다. Kinesis 데이터 스트림을 데이터 원본으로 사용하는 Amazon Kinesis Data Firehose 전송 스트림을 생성합니다. AWS Lambda 함수를 사용하여 데이터를 변환합니다. Kinesis Data Firehose 전송 스트림을 사용하여 데이터를 Amazon S3 로 보냅니다.
- **D.** 데이터를 AWS Glue 로 보내도록 Amazon API Gateway API 를 구성합니다. AWS Lambda 함수를 사용하여 데이터를 변환합니다. AWS Glue 를 사용하여 데이터를 Amazon S3 로 보냅니다.

> [!answer]- 정답 보기
> **정답: C**

### Q94

한 회사에서 사용자가 Amazon S3 에 작은 파일을 업로드하는 애플리케이션을 설계하고 있습니다. 사용자가 파일을 업로드한 후 데이터를 변환하고 나중에 분석할 수 있도록 데이터를 JSON 형식으로 저장하려면 파일에 일회성 단순 처리가 필요합니다. 각 파일은 업로드 후 최대한 빨리 처리해야 합니다. 수요는 다양할 것입니다. 어떤 날에는 사용자가 많은 수의 파일을 업로드합니다. 다른 날에는 사용자가 몇 개의 파일을 업로드하거나 파일을 업로드하지 않습니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** Amazon S3 에서 텍스트 파일을 읽도록 Amazon EMR 을 구성합니다. 처리 스크립트를 실행하여 데이터를 변환합니다. 결과 JSON 파일을 Amazon Aurora DB 클러스터에 저장합니다.
- **B.** Amazon SQS(Amazon Simple Queue Service) 대기열에 이벤트 알림을 보내도록 Amazon S3 를 구성합니다. Amazon EC2 인스턴스를 사용하여 대기열에서 읽고 데이터를 처리합니다. 결과 JSON 파일을 Amazon DynamoDB 에 저장합니다.
- **C.** 이벤트 알림을 Amazon Simple Queue Service(Amazon SQS) 대기열로 보내도록 Amazon S3 를 구성합니다. AWS Lambda 함수를 사용하여 대기열에서 읽고 데이터를 처리합니다. 결과 JSON 파일을 Amazon DynamoDB 에 저장합니다.
- **D.** 새 파일이 업로드될 때 Amazon Kinesis Data Streams 에 이벤트를 보내도록 Amazon EventBridge(Amazon CloudWatch Events) 를 구성합니다. AWS Lambda 함수를 사용하여 스트림에서 이벤트를 소비하고 데이터를 처리합니다. 결과 JSON 파일을 Amazon Aurora DB 클러스터에 저장합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q103

회사에 매일 같은 시간에 실행되는 AWS Glue 추출, 변환 및 로드(ETL) 작업이 있습니다. 작업은 Amazon S3 버킷에 있는 XML 데이터를 처리합니다. 매일 새로운 데이터가 S3 버킷에 추가됩니다. 솔루션 설계자는 AWS Glue 가 각 실행 중에 모든 데이터를 처리하고 있음을 알아차렸습니다. 솔루션 아키텍트는 AWS Glue 가 오래된 데이터를 재처리하지 못하도록 하려면 어떻게 해야 합니까?

- **A.** 작업 북마크를 사용하도록 작업을 편집합니다.
- **B.** 데이터가 처리된 후 데이터를 삭제하도록 작업을 편집합니다.
- **C.** NumberOfWorkers 필드를 1 로 설정하여 작업을 편집합니다.
- **D.** FindMatches 기계 학습(ML) 변환을 사용합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q107

자전거 공유 회사는 피크 운영 시간 동안 자전거의 위치를 추적하기 위해 다층 아키텍처를 개발하고 있습니다. 회사는 기존 분석 플랫폼에서 이러한 데이터 포인트를 사용하려고 합니다. 솔루션 설계자는 이 아키텍처를 지원하기 위해 가장 실행 가능한 다중 계층 옵션을 결정해야 합니다. 데이터 포인트는 REST API 에서 액세스할 수 있어야 합니다. 위치 데이터 저장 및 검색에 대한 이러한 요구 사항을 충족하는 작업은 무엇입니까?

- **A.** Amazon S3 와 함께 Amazon Athena 를 사용하십시오 .
- **B.** AWS Lambda 와 함께 Amazon API Gateway 를 사용합니다 .
- **C.** Amazon Redshift 와 함께 Amazon QuickSight 를 사용합니다 .
- **D.** Amazon Kinesis Data Analytics 와 함께 Amazon API Gateway 를 사용합니다 .

> [!answer]- 정답 보기
> **정답: B**

### Q113

회사는 보고를 위해 50TB 의 데이터를 사용합니다. 회사는 이 데이터를 온프레미스에서 AWS 로 이동하려고 합니다. 회사 데이터 센터의 사용자 지정 응용 프로그램은 매주 데이터 변환 작업을 실행합니다. 회사는 데이터 이전이 완료되고 가능한 한 빨리 이전 프로세스를 시작해야 할 때까지 응용 프로그램을 일시 중지할 계획입니다. 데이터 센터에는 추가 워크로드에 사용할 수 있는 네트워크 대역폭이 없습니다. 솔루션 설계자는 데이터를 전송하고 AWS 클라우드에서 계속 실행되도록 변환 작업을 구성해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** AWS DataSync 를 사용하여 데이터를 이동합니다. AWS Glue 를 사용하여 사용자 지정 변환 작업을 생성합니다.
- **B.** AWS Snowcone 디바이스에 데이터를 이동하도록 주문합니다. 장치에 변환 응용 프로그램을 배포합니다.
- **C.** AWS Snowball Edge Storage Optimized 디바이스를 주문합니다. 데이터를 장치에 복사합니다. AWS Glue 를 사용하여 사용자 지정 변환 작업을 생성합니다.
- **D.** Amazon EC2 컴퓨팅이 포함된 AWS Snowball Edge Storage Optimized 디바이스를 주문합니다. 데이터를 장치에 복사합니다. AWS 에서 새 EC2 인스턴스를 생성하여 변환 애플리케이션을 실행합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q114

한 회사는 사용자가 사진을 업로드하고 이미지에 액자를 추가할 수 있는 이미지 분석 응용 프로그램을 만들었습니다. 사용자는 이미지와 메타데이터를 업로드하여 이미지에 추가할 사진 프레임을 나타냅니다. 애플리케이션은 단일 Amazon EC2 인스턴스와 Amazon DynamoDB 를 사용하여 메타데이터를 저장합니다. 응용 프로그램이 대중화되고 사용자 수가 증가하고 있습니다. 회사는 동시 접속자 수가 시간과 요일에 따라 크게 달라질 것으로 예상하고 있습니다. 회사는 증가하는 사용자 기반의 요구 사항을 충족하도록 애플리케이션을 확장할 수 있는지 확인해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** AWS Lambda 를 사용하여 사진을 처리합니다. 사진과 메타데이터를 DynamoDB 에 저장합니다.
- **B.** Amazon Kinesis Data Firehose 를 사용하여 사진을 처리하고 사진과 메타데이터를 저장합니다.
- **C.** AWS Lambda 를 사용하여 사진을 처리합니다. Amazon S3 에 사진을 저장합니다. DynamoDB 를 유지하여 메타데이터를 저장합니다.
- **D.** EC2 인스턴스 수를 3 개로 늘립니다. 프로비저닝된 IOPS SSD(io2) Amazon Elastic Block Store(Amazon EBS) 볼륨을 사용하여 사진과 메타데이터를 저장합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q117

회사는 Amazon CloudWatch Logs 로그 그룹에 애플리케이션 로그를 저장합니다. 새로운 정책에 따라 회사는 거의 실시간으로 Amazon OpenSearch Service(Amazon Elasticsearch Service) 에 모든 애플리케이션 로그를 저장해야 합니다. 최소한의 운영 오버헤드로 이 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 로그를 Amazon OpenSearch Service(Amazon Elasticsearch Service) 로 스트리밍하도록 CloudWatch Logs 구독을 구성합니다.
- **B.** AWS Lambda 함수를 생성합니다. 로그 그룹을 사용하여 함수를 호출하여 Amazon OpenSearch Service(Amazon Elasticsearch Service) 에 로그를 기록합니다.
- **C.** Amazon Kinesis Data Firehose 전송 스트림을 생성합니다. 전송 스트림 소스로 로그 그룹을 구성합니다. Amazon OpenSearch Service(Amazon Elasticsearch Service) 를 전송 스트림의 대상으로 구성합니다.
- **D.** 각 애플리케이션 서버에 Amazon Kinesis Agent 를 설치하고 구성하여 Amazon Kinesis Data Streams 에 로그를 전달합니다. Amazon OpenSearch Service(Amazon Elasticsearch Service) 에 로그를 전달하도록 Kinesis Data Streams 를 구성합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q118

회사는 여러 가용 영역의 Amazon EC2 인스턴스에서 실행되는 웹 기반 애플리케이션을 구축하고 있습니다. 웹 애플리케이션은 약 900TB 크기의 텍스트 문서 저장소에 대한 액세스를 제공합니다. 회사는 웹 응용 프로그램이 수요가 많은 기간을 경험할 것으로 예상합니다. 솔루션 설계자는 텍스트 문서의 스토리지 구성 요소가 애플리케이션의 요구 사항을 항상 충족할 수 있도록 확장할 수 있는지 확인해야 합니다. 회사는 솔루션의 전체 비용에 대해 우려하고 있습니다. 어떤 스토리지 솔루션이 이러한 요구 사항을 가장 비용 효율적으로 충족합니까?

- **A.** Amazon Elastic Block Store(Amazon EBS)
- **B.** Amazon Elastic File System(Amazon EFS)
- **C.** Amazon OpenSearch Service(Amazon Elasticsearch Service)
- **D.** Amazon S3

> [!answer]- 정답 보기
> **정답: D**

### Q134

한 회사에서 애플리케이션을 서버리스 솔루션으로 이동하려고 합니다. 서버리스 솔루션은 SL 을 사용하여 기존 및 신규 데이터를 분석해야 합니다. 회사는 데이터를 Amazon S3 버킷에 저장합니다. 데이터는 암호화가 필요하며 다른 AWS 리전에 복제해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 새 S3 버킷을 생성합니다. 데이터를 새 S3 버킷에 로드합니다. S3 교차 리전 복제(CRR) 를 사용하여 암호화된 객체를 다른 리전의 S3 버킷에 복제합니다. AWS KMS 다중 리전 kay(SSE - KMS) 로 서버 측 암호화를 사용합니다. Amazon Athena 를 사용하여 데이터를 쿼리합니다.
- **B.** 새 S3 버킷을 생성합니다. 데이터를 새 S3 버킷에 로드합니다. S3 교차 리전 복제(CRR) 를 사용하여 암호화된 객체를 다른 리전의 S3 버킷에 복제합니다. AWS KMS 다중 리전 키(SSE - KMS) 로 서버 측 암호화를 사용합니다. Amazon RDS 를 사용하여 데이터를 쿼리합니다.
- **C.** 기존 S3 버킷에 데이터를 로드합니다. S3 교차 리전 복제(CRR) 를 사용하여 암호화된  객체를 다른 리전의 S3 버킷에 복제합니다. Amazon S3 관리형 암호화 키(SSE - S3) 로 서버 측 암호화를 사용합니다. Amazon Athena 를 사용하여 데이터를 쿼리합니다.
- **D.** 기존 S3 버킷에 데이터를 로드합니다. S3 교차 리전 복제(CRR) 를 사용하여 암호화된 객체를 다른 리전의 S3 버킷에 복제합니다. Amazon S3 관리형 암호화 키(SSE - S3) 로 서버 측 암호화를 사용합니다. Amazon RDS 를 사용하여 데이터를 쿼리합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q139

보고 팀은 Amazon S3 버킷에서 매일 파일을 수신합니다. 보고 팀은 이 초기 S3 버킷의 파일을 수동으로 검토하고 Amazon QuickSight 와 함께 사용하기 위해 매일 같은 시간에 분석 S3 버킷으로 복사합니다. 추가 팀이 초기 S3 버킷에 더 큰 크기의 더 많은 파일을 보내기 시작했습니다. 보고 팀은 파일이 초기 S3 버킷에 들어갈 때 자동으로 분석 S3 버킷을 이동하려고 합니다. 또한 보고 팀은 AWS Lambda 함수를 사용하여 복사된 데이터에서 패턴 일치 코드를 실행하려고 합니다. 또한 보고 팀은 데이터 파일을 Amazon SageMaker Pipelines 의 파이프라인으로 보내려고 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하기 위해 솔루션 설계자는 무엇을 해야 합니까?

- **A.** 분석 S3 버킷에 파일을 복사하는 Lambda 함수를 생성합니다. 분석 S3 버킷에 대한 S3 이벤트 알림을 생성합니다. 이벤트 알림의 대상으로 Lambda 및 SageMaker 파이프라인을 구성합니다. s3:ObjectCreated:Put 을 이벤트 유형으로 구성합니다.
- **B.** 분석 S3 버킷에 파일을 복사하는 Lambda 함수를 생성합니다. Amazon EventBridge(Amazon CloudWatch Events) 에 이벤트 알림을 보내도록 분석 S3 버킷을 구성합니다. EventBridge(CloudWatch 이벤트) 에서 ObjectCreated 규칙을 구성합니다. 규칙의 대상으로 Lambda 및 SageMaker 파이프라인을 구성합니다.
- **C.** S3 버킷 간에 S3 복제를 구성합니다. 분석 S3 버킷에 대한 S3 이벤트 알림을 생성합니다. 이벤트 알림의 대상으로 Lambda 및 SageMaker 파이프라인을 구성합니다.  s3:ObjectCreated:Put 을 이벤트 유형으로 구성합니다.
- **D.** S3 버킷 간에 S3 복제를 구성합니다. Amazon EventBridge(Amazon CloudWatch Events) 에 이벤트 알림을 보내도록 분석 S3 버킷을 구성합니다. EventBridge(CloudWatch 이벤트) 에서 ObjectCreated 규칙을 구성합니다. 규칙의 대상으로 Lambda 및 SageMaker 파이프라인을 구성합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q144

한 회사는 최근 글로벌 전자 상거래 애플리케이션의 데이터 저장소로 Amazon Aurora 를 사용하기 시작했습니다. 대규모 보고서가 실행되면 개발자는 전자상거래 애플리케이션의 성능이 좋지 않다고 보고합니다. Amazon CloudWatch 의 지표를 검토한 후 솔루션 설계자는 월별 보고서가 실행될 때 ReadIOPS 및 CPUUtilizalion 지표가 급증하고 있음을 발견했습니다. 가장 비용 효율적인 솔루션은 무엇입니까?

- **A.** 월별 보고를 Amazon Redshift 로 마이그레이션합니다.
- **B.** 월별 보고를 Aurora 복제본으로 마이그레이션합니다.
- **C.** Aurora 데이터베이스를 더 큰 인스턴스 클래스로 마이그레이션합니다.
- **D.** Aurora 인스턴스에서 프로비저닝된 IOPS 를 늘립니다.

> [!answer]- 정답 보기
> **정답: B**

### Q156

회사는 다른 데이터베이스에서 가져온 배치 데이터를 생성합니다. 이 회사는 또한 네트워크 센서 및 애플리케이션 API 에서 라이브 스트림 데이터를 생성합니다. 회사는 비즈니스 분석을 위해 모든 데이터를 한 곳으로 통합해야 합니다. 회사는 수신 데이터를 처리한 다음 다른 Amazon S3 버킷에 데이터를 준비해야 합니다. 팀은 나중에 일회성 쿼리를 실행하고 데이터를 비즈니스 인텔리전스 도구로 가져와 핵심 성과 지표(KPI) 를 표시합니다. 가장 적은 운영 오버헤드로 이러한 요구 사항을 충족하는 단계 조합은 무엇입니까? (2 개를 선택하세요.)

- **A.** 일회성 쿼리에는 Amazon Athena 를 사용하십시오. Amazon QuickSight 를 사용하여 KPI 용 대시보드를 생성합니다.
- **B.** 일회성 쿼리에 Amazon Kinesis Data Analytics 를 사용합니다. Amazon QuickSight 를 사용하여 KPI 용 대시보드를 생성합니다.
- **C.** 개별 레코드를 데이터베이스에서 Amazon Redshift 클러스터로 이동하는 사용자 지정 AWS Lambda 함수를 생성합니다.
- **D.** AWS Glue 추출, 변환 및 로드(ETL) 작업을 사용하여 데이터를 JSON 형식으로 변환합니다. 여러 Amazon OpenSearch Service(Amazon Elasticsearch Service) 클러스터에 데이터를 로드합니다. E. AWS Lake Formation 의 청사진을 사용하여 데이터 레이크에 수집할 수 있는 데이터를 식별합니다. AWS Glue 를 사용하여 소스를 크롤링하고, 데이터를 추출하고, 데이터를 Apache Parquet 형식으로 Amazon S3 에 로드합니다.

> [!answer]- 정답 보기
> **정답: A**
>
> , E

### Q164

회사에는 처리할 페이로드가 포함된 메시지를 보내는 발신자 애플리케이션과 페이로드가 포함된 메시지를 수신하기 위한 처리 애플리케이션의 두 가지 애플리케이션이 있습니다.  회사는 두 애플리케이션 간의 메시지를 처리하기 위해 AWS 서비스를 구현하려고 합니다. 발신자 애플리케이션은 매시간 약 1,000 개의 메시지를 보낼 수 있습니다. 메시지를 처리하는 데 최대 2 일이 걸릴 수 있습니다. 메시지를 처리하지 못한 경우 나머지 메시지 처리에 영향을 주지 않도록 보관해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족하고 운영상 가장 효율적입니까?

- **A.** Redis 데이터베이스를 실행하는 Amazon EC2 인스턴스를 설정합니다. 인스턴스를 사용하도록 두 애플리케이션을 모두 구성합니다. 메시지를 각각 저장, 처리 및 삭제합니다.
- **B.** Amazon Kinesis 데이터 스트림을 사용하여 발신자 애플리케이션에서 메시지를 수신합니다. 처리 애플리케이션을 Kinesis Client Library(KCL) 와 통합합니다.
- **C.** 발신자 및 프로세서 애플리케이션을 Amazon Simple Queue Service(Amazon SQS) 대기열과 통합합니다. 처리에 실패한 메시지를 수집하도록 배달 못한 편지 대기열을 구성합니다.
- **D.** 처리할 알림을 수신하려면 처리 애플리케이션을 Amazon Simple Notification Service(Amazon SNS) 주제에 구독합니다. 발신자 애플리케이션을 통합하여 SNS 주제에 씁니다.

> [!answer]- 정답 보기
> **정답: C**

### Q199

텔레마케팅 회사는 AWS 에서 고객 콜 센터 기능을 설계하고 있습니다. 이 회사는 여러 화자 인식을 제공하고 대본 파일을 생성하는 솔루션이 필요합니다. 회사는 비즈니스 패턴을 분석하기 위해 트랜스크립트 파일을 쿼리하려고 합니다. 기록 파일은 감사 목적으로 7 년 동안 저장되어야 합니다. 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 여러 화자 인식을 위해 Amazon Rekognition 을 사용하십시오. 성적표 파일을 Amazon S3 에 저장합니다. 성적표 파일 분석을 위해 기계 학습 모델을 사용합니다.
- **B.** 여러 화자 인식을 위해 Amazon Transcribe 를 사용합니다. 성적표 파일 분석에 Amazon Athena 를 사용합니다.
- **C.** 여러 화자 인식을 위해 Amazon Translate 를 사용합니다. Amazon Redshift 에 기록 파일을 저장합니다. 성적표 파일 분석에 SQL 쿼리를 사용합니다.
- **D.** 여러 화자 인식을 위해 Amazon Rekognition 을 사용합니다. 성적표 파일을 Amazon S3 에 저장합니다. 성적표 파일 분석에 Amazon Textract 를 사용하십시오.

> [!answer]- 정답 보기
> **정답: B**

### Q201

회사에서 모바일 앱 사용자를 대상으로 하는 마케팅 커뮤니케이션 서비스를 개발하고 있습니다. 회사는 SMS(Short Message Service) 를 통해 사용자에게 확인 메시지를 보내야 합니다. 사용자는 SMS 메시지에 회신할 수 있어야 합니다. 회사는 분석을 위해 응답을 1 년 동안 저장해야 합니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** Amazon Connect 통화 흐름을 생성하여 SMS 메시지를 보냅니다. AWS Lambda 를 사용하여 응답을 처리합니다.
- **B.** Amazon Pinpoint 여정을 구축하십시오. 분석 및 보관을 위해 이벤트를 Amazon Kinesis 데이터 스트림으로 보내도록 Amazon Pinpoint 를 구성합니다.
- **C.** Amazon Simple Queue Service(Amazon SQS) 를 사용하여 SMS 메시지를 배포합니다. AWS Lambda 를 사용하여 응답을 처리합니다.
- **D.** Amazon Simple Notification Service(Amazon SNS) FIFO 주제를 생성합니다. 분석 및 보관을 위해 Amazon Kinesis 데이터 스트림을 SNS 주제에 구독합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q206

회사에서 Amazon 머신 이미지(AMI) 를 관리하려고 합니다. 회사는 현재 AMI 가 생성된 동일한 AWS 리전에 AMI 를 복사합니다. 회사는 AWS API 호출을 캡처하고 회사 계정 내에서 Amazon EC2 CreateImage API 작업이 호출될 때마다 알림을 보내는 애플리케이션을 설계해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** AWS CloudTrail 로그를 쿼리하고 CreateImage API 호출이 감지되면 알림을 보내는 AWS Lambda 함수를 생성합니다.
- **B.** 업데이트된 로그가 Amazon S3 로 전송될 때 발생하는 Amazon Simple Notification Service(Amazon SNS) 알림으로 AWS CloudTrail 을 구성합니다. Amazon Athena 를 사용하여 새 테이블을 생성하고 API 호출이 감지되면 CreateImage 에서 쿼리합니다.
- **C.** CreateImage API 호출에 대한 Amazon EventBridge(Amazon CloudWatch Events) 규칙을 생성합니다. CreateImage API 호출이 감지되면 알림을 보내도록 대상을 Amazon Simple Notification Service(Amazon SNS) 주제로 구성합니다.
- **D.** Amazon Simple Queue Service(Amazon SQS) FIFO 대기열을 AWS CloudTrail 로그의  대상으로 구성합니다. CreateImage API 호출이 감지되면 Amazon Simple Notification Service(Amazon SNS) 주제에 알림을 보내는 AWS Lambda 함수를 생성합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q214

회사의 보고 시스템은 매일 수백 개의 .csv 파일을 Amazon S3 버킷에 전달합니다. 회사는 이러한 파일을 Apache Parquet 형식으로 변환하고 변환된 데이터 버킷에 파일을 저장해야 합니다. 최소한의 개발 노력으로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** Apache Spark 가 설치된 Amazon EMR 클러스터를 생성합니다. 데이터를 변환하는 Spark 애플리케이션을 작성합니다. EMRFS(EMR 파일 시스템) 를 사용하여 변환된 데이터 버킷에 파일을 씁니다.
- **B.** AWS Glue 크롤러를 생성하여 데이터를 검색합니다. AWS Glue 추출, 변환 및 로드(ETL) 작업을 생성하여 데이터를 변환합니다. 출력 단계에서 변환된 데이터 버킷을 지정합니다.
- **C.** AWS Batch 를 사용하여 Bash 구문으로 작업 정의를 생성하여 데이터를 변환하고 데이터를 변환된 데이터 버킷으로 출력합니다. 작업 정의를 사용하여 작업을 제출합니다. 어레이 작업을 작업 유형으로 지정합니다.
- **D.** 데이터를 변환하고 변환된 데이터 버킷으로 데이터를 출력하는 AWS Lambda 함수를 생성합니다. S3 버킷에 대한 이벤트 알림을 구성합니다. 이벤트 알림의 대상으로 Lambda 함수를 지정합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q220

솔루션 설계자는 Amazon API Gateway 를 사용하여 사용자의 요청을 수신할 새 API 를 설계하고 있습니다. 요청량은 매우 다양합니다. 단일 요청을 받지 않고 몇 시간이 지날 수 있습니다. 데이터 처리는 비동기식으로 이루어지지만 요청이 이루어진 후 몇 초 이내에 완료되어야 합니다. 최저 비용으로 요구 사항을 제공하기 위해 솔루션 설계자가 API 를 호출하도록 해야 하는 컴퓨팅 서비스는 무엇입니까?

- **A.** AWS Glue 작업
- **B.** AWS Lambda 함수
- **C.** Amazon Elastic Kubernetes Service(Amazon EKS) 에서 호스팅되는 컨테이너화된 서비스
- **D.** Amazon EC2 와 함께 Amazon ECS 에서 호스팅되는 컨테이너화된 서비스

> [!answer]- 정답 보기
> **정답: B**

### Q225

미디어 회사는 온프레미스에서 사용자 활동 데이터를 수집하고 분석합니다. 회사는 이 기능을 AWS 로 마이그레이션하려고 합니다. 사용자 활동 데이터 저장소는 계속해서 성장하여 크기가 페타바이트가 될 것입니다. 회사는 SQL 을 사용하여 기존 데이터 및 새 데이터의 온디맨드 분석을 용이하게 하는 고가용성 데이터 수집 솔루션을 구축해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 활동 데이터를 Amazon Kinesis 데이터 스트림으로 보냅니다. 데이터를 Amazon S3 버킷으로 전달하도록 스트림을 구성합니다.
- **B.** 활동 데이터를 Amazon Kinesis Data Firehose 전송 스트림으로 보냅니다. 데이터를 Amazon Redshift 클러스터로 전달하도록 스트림을 구성합니다.
- **C.** 활동 데이터를 Amazon S3 버킷에 배치합니다. 데이터가 S3 버킷에 도착하면 데이터에서 AWS Lambda 함수를 실행하도록 Amazon S3 를 구성합니다.
- **D.** 여러 가용 영역에 분산된 Amazon EC2 인스턴스에서 수집 서비스를 생성합니다. 데이터를 Amazon RDS 다중 AZ 데이터베이스로 전달하도록 서비스를 구성합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q226

회사는 Amazon EC2 인스턴스에서 실행되는 RESTful 웹 서비스 애플리케이션을 사용하여 수천 개의 원격 장치에서 데이터를 수집합니다. EC2 인스턴스는 원시 데이터를 수신하고 원시 데이터를 변환하며 모든 데이터를 Amazon S3 버킷에 저장합니다. 원격 장치의 수는 곧 수백만 개로 증가할 것입니다. 이 회사는 운영 오버헤드를 최소화하는 확장성이 뛰어난  솔루션이 필요합니다. 이러한 요구 사항을 충족하기 위해 솔루션 설계자는 어떤 단계 조합을 수행해야 합니까? (2 개 선택)

- **A.** AWS Glue 를 사용하여 Amazon S3 에서 원시 데이터를 처리합니다.
- **B.** Amazon Route 53 을 사용하여 트래픽을 다른 EC2 인스턴스로 라우팅합니다.
- **C.** 들어오는 데이터의 양을 수용하기 위해 더 많은 EC2 인스턴스를 추가합니다.
- **D.** 원시 데이터를 Amazon Simple Queue Service(Amazon SQS) 로 보냅니다. EC2 인스턴스를 사용하여 데이터를 처리합니다. E. Amazon API Gateway 를 사용하여 원시 데이터를 Amazon Kinesis 데이터 스트림으로 보냅니다. 데이터 스트림을 소스로 사용하여 데이터를 Amazon S3 에 전달하도록 Amazon Kinesis Data Firehose 를 구성합니다.

> [!answer]- 정답 보기
> **정답: A**
>
> , E

### Q238

회사에서 엔지니어 팀을 위해 개별 AWS 계정을 실험하려고 합니다. 회사는 지정된 달의 Amazon EC2 인스턴스 사용량이 각 계정의 특정 임계값을 초과하는 즉시 알림을 받기를 원합니다. 이 요구 사항을 가장 비용 효율적으로 충족하기 위해 솔루션 설계자는 무엇을 해야 합니까?

- **A.** Cost Explorer 를 사용하여 서비스별 비용에 대한 일일 보고서를 생성합니다. EC2 인스턴스별로 보고서를 필터링합니다. 임계값을 초과하면 Amazon Simple Email  Service(Amazon SES) 알림을 보내도록 Cost Explorer 를 구성합니다.
- **B.** Cost Explorer 를 사용하여 서비스별 월별 비용 보고서를 생성합니다. EC2 인스턴스별로 보고서를 필터링합니다. 임계값을 초과하면 Amazon Simple Email Service(Amazon SES) 알림을 보내도록 Cost Explorer 를 구성합니다.
- **C.** AWS 예산을 사용하여 각 계정에 대한 비용 예산을 생성합니다. 기간을 매월로 설정합니다. 범위를 EC2 인스턴스로 설정합니다. 예산에 대한 경고 임계값을 설정합니다. 임계값 초과 시 알림을 받도록 Amazon Simple Notification Service(Amazon SNS) 주제를 구성합니다.
- **D.** AWS 비용 및 사용 보고서를 사용하여 시간 단위로 보고서를 생성합니다. 보고서 데이터를 Amazon Athena 와 통합합니다. Amazon EventBridge 를 사용하여 Athena 쿼리를 예약합니다. 임계값 초과 시 알림을 받도록 Amazon Simple Notification Service(Amazon SNS) 주제를 구성합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q250

회사의 보안 팀이 VPC 흐름 로그에서 네트워크 트래픽을 캡처하도록 요청합니다. 로그는 90 일 동안 자주 액세스한 후 간헐적으로 액세스합니다. 솔루션 설계자는 로그를 구성할 때 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** Amazon CloudWatch 를 대상으로 사용하십시오. 90 일 만료로 CloudWatch 로그 그룹 설정
- **B.** Amazon Kinesis 를 대상으로 사용합니다. 항상 90 일 동안 로그를 유지하도록 Kinesis 스트림을 구성합니다.
- **C.** AWS CloudTrail 을 대상으로 사용합니다. Amazon S3 버킷에 저장하도록 CloudTrail 을 구성하고 S3 Intelligent - Tiering 을 활성화합니다.
- **D.** Amazon S3 를 대상으로 사용합니다. S3 수명 주기 정책을 활성화하여 90 일 후에 로그를 S3 Standard - Infrequent Access(S3 Standard - IA) 로 전환합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q257

회사는 AWS 계정의 모든 애플리케이션에서 Amazon EC2 Auto Scaling 이벤트를 보고하는 솔루션을 구축하고 있습니다. 회사는 Amazon S3 에 EC2 Auto Scaling 상태 데이터를 저장하기 위해 서버리스 솔루션을 사용해야 합니다. 그런 다음 회사는 Amazon S3 의 데이터를 사용하여 대시보드에서 거의 실시간 업데이트를 제공합니다. 솔루션은 EC2 인스턴스 시작 속도에 영향을 미치지 않아야 합니다. 회사는 이러한 요구 사항을 충족하기 위해 어떻게 데이터를 Amazon S3 로 이동해야 합니까?

- **A.** Amazon CloudWatch 지표 스트림을 사용하여 EC2 Auto Scaling 상태 데이터를 Amazon Kinesis Data Firehose 로 보냅니다. 데이터를 Amazon S3 에 저장합니다.
- **B.** Amazon EMR 클러스터를 시작하여 EC2 Auto Scaling 상태 데이터를 수집하고 데이터를 Amazon Kinesis Data Firehose 로 보냅니다. 데이터를 Amazon S3 에 저장합니다.
- **C.** Amazon EventBridge 규칙을 생성하여 일정에 따라 AWS Lambda 함수를 호출합니다. EC2 Auto Scaling 상태 데이터를 Amazon S3 로 직접 보내도록 Lambda 함수를 구성합니다.
- **D.** EC2 인스턴스를 시작하는 동안 부트스트랩 스크립트를 사용하여 Amazon Kinesis 에이전트를 설치합니다. EC2 Auto Scaling 상태 데이터를 수집하고 데이터를 Amazon Kinesis Data Firehose 로 보내도록 Kinesis 에이전트를 구성합니다. 데이터를 Amazon S3 에 저장합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q258

회사에는 매시간 수백 개의 .csv 파일을 Amazon S3 버킷에 배치하는 애플리케이션이 있습니다. 파일 크기는 1GB 입니다. 파일이 업로드될 때마다 회사는 파일을 Apache Parquet 형식으로 변환하고 출력 파일을 S3 버킷에 배치해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** .csv 파일을 다운로드하고 파일을 Parquet 형식으로 변환하고 출력 파일을 S3 버킷에 배치하는 AWS Lambda 함수를 생성합니다. 각 S3 PUT 이벤트에 대해 Lambda 함수를 호출합니다.
- **B.** Apache Spark 작업을 생성하여 .csv 파일을 읽고, 파일을 Parquet 형식으로 변환하고, 출력 파일을 S3 버킷에 배치합니다. Spark 작업을 호출하기 위해 각 S3 PUT 이벤트에 대한 AWS Lambda 함수를 생성합니다.
- **C.** 애플리케이션이 .csv 파일을 배치하는 S3 버킷에 대한 AWS Glue 테이블과 AWS Glue 크롤러를 생성합니다. Amazon Athena 를 주기적으로 사용하여 AWS Glue 테이블을 쿼리하고, 쿼리 결과를 Parquet 형식으로 변환하고, 출력 파일을 S3 버킷에 배치하도록 AWS Lambda 함수를 예약합니다.
- **D.** AWS Glue 추출, 변환 및 로드(ETL) 작업을 생성하여 .csv 파일을 Parquet 형식으로 변환하고 출력 파일을 S3 버킷에 배치합니다. 각 S3 PUT 이벤트에 대한 AWS Lambda 함수를 생성하여 ETL 작업을 호출합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q267

회사에 모바일 앱을 사용하는 백만 명의 사용자가 있습니다. 회사는 거의 실시간으로 데이터 사용량을 분석해야 합니다. 회사는 또한 거의 실시간으로 데이터를 암호화하고 추가 처리를 위해 데이터를 Apache Parquet 형식의 중앙 위치에 저장해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** Amazon Kinesis 데이터 스트림을 생성하여 Amazon S3 에 데이터를 저장합니다. 데이터를 분석할 Amazon Kinesis Data Analytics 애플리케이션을 생성합니다. AWS Lambda 함수를 호출하여 데이터를 Kinesis Data Analytics 애플리케이션으로 보냅니다.
- **B.** Amazon Kinesis 데이터 스트림을 생성하여 Amazon S3 에 데이터를 저장합니다. 데이터를 분석할 Amazon EMR 클러스터를 생성합니다. AWS Lambda 함수를 호출하여 데이터를 EMR 클러스터로 보냅니다.
- **C.** Amazon Kinesis Data Firehose 전송 스트림을 생성하여 Amazon S3 에 데이터를 저장합니다. 데이터를 분석할 Amazon EMR 클러스터를 생성합니다.
- **D.** Amazon Kinesis Data Firehose 전송 스트림을 생성하여 Amazon S3 에 데이터를 저장합니다. 데이터를 분석할 Amazon Kinesis Data Analytics 애플리케이션을 생성합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q269

전자 상거래 회사는 Amazon RDS 기반 웹 애플리케이션의 성능 저하를 발견했습니다. 성능 저하의 원인은 비즈니스 분석가가 트리거하는 읽기 전용 SQL 쿼리 수가 증가했기 때문입니다. 솔루션 설계자는 기존 웹 애플리케이션에 대한 최소한의 변경으로 문제를 해결해야 합니다. 솔루션 설계자는 무엇을 추천해야 합니까?

- **A.** 데이터를 Amazon DynamoDB 로 내보내고 비즈니스 분석가가 쿼리를 실행하도록 합니다.
- **B.** Amazon ElastiCache 에 데이터를 로드하고 비즈니스 분석가가 쿼리를 실행하도록 합니다.
- **C.** 기본 데이터베이스의 읽기 복제본을 생성하고 비즈니스 분석가가 쿼리를 실행하도록 합니다.
- **D.** 데이터를 Amazon Redshift 클러스터로 복사하고 비즈니스 분석가가 쿼리를 실행하도록 합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q278

회사에서 계층적 구조 관계로 직원 데이터를 저장하는 애플리케이션을 만들고자 합니다. 회사는 직원 데이터에 대한 트래픽이 많은 쿼리에 대한 최소 대기 시간 응답이 필요하며 민감한 데이터를 보호해야 합니다. 회사는 또한 직원 데이터에 재무 정보가 있는 경우 월별 이메일 메시지를 받아야 합니다. 이러한 요구 사항을 충족하기 위해 솔루션 설계자는 어떤 단계 조합을 수행해야 합니까? (2 개 선택)

- **A.** Amazon Redshift 를 사용하여 직원 데이터를 계층에 저장하십시오. 매월 Amazon S3 에 데이터를 언로드합니다.
- **B.** Amazon DynamoDB 를 사용하여 직원 데이터를 계층에 저장합니다. 매월 데이터를 Amazon S3 로 내보냅니다.
- **C.** AWS 계정에 대해 Amazon Macie 를 구성합니다. Macie 를 Amazon EventBridge 와 통합하여 월별 이벤트를 AWS Lambda 로 전송합니다.
- **D.** Amazon Athena 를 사용하여 Amazon S3 에서 직원 데이터를 분석합니다. Athena 를 Amazon QuickSight 와 통합하여 분석 대시보드를 게시하고 사용자와 대시보드를  공유합니다. E. AWS 계정에 대해 Amazon Macie 를 구성합니다. Macie 를 Amazon EventBridge 와 통합하여 Amazon Simple Notification Service(Amazon SNS) 구독을 통해 월별 알림을 보냅니다.

> [!answer]- 정답 보기
> **정답: B**
>
> , E

### Q280

회사는 웹 사이트에서 Amazon CloudFront 를 사용하고 있습니다. 회사는 CloudFront 배포에서 로깅을 활성화했으며 로그는 회사의 Amazon S3 버킷 중 하나에 저장됩니다. 회사는 로그에 대한 고급 분석을 수행하고 시각화를 구축해야 합니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** Amazon Athena 에서 표준 SQL 쿼리를 사용하여 S3 버킷의 CloudFront 로그를 분석합니다. AWS Glue 로 결과를 시각화합니다.
- **B.** Amazon Athena 에서 표준 SQL 쿼리를 사용하여 S3 버킷의 CloudFront 로그를 분석합니다. Amazon QuickSight 로 결과를 시각화합니다.
- **C.** Amazon DynamoDB 에서 표준 SQL 쿼리를 사용하여 S3 버킷의 CloudFront 로그를 분석합니다. AWS Glue 로 결과를 시각화합니다.
- **D.** Amazon DynamoDB 에서 표준 SQL 쿼리를 사용하여 S3 버킷의 CloudFront 로그를 분석합니다. Amazon QuickSight 로 결과를 시각화합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q284

예산 계획의 일환으로 경영진은 사용자별로 나열된 AWS 청구 항목에 대한 보고서를 원합니다. 데이터는 부서 예산을 만드는 데 사용됩니다. 솔루션 설계자는 이 보고서 정보를 얻는 가장 효율적인 방법을 결정해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** Amazon Athena 로 쿼리를 실행하여 보고서를 생성합니다.
- **B.** Cost Explorer 에서 보고서를 생성하고 보고서를 다운로드합니다.
- **C.** 청구 대시보드에서 청구서 세부 정보에 액세스하고 청구서를 다운로드합니다.
- **D.** Amazon Simple Email Service(Amazon SES) 로 알리도록 AWS 예산에서 비용 예산을 수정합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q285

회사는 Amazon S3 를 사용하여 정적 웹 사이트를 호스팅합니다. 회사는 웹 페이지에 연락처 양식을 추가하려고 합니다. 연락처 양식에는 사용자가 이름, 이메일 주소, 전화번호 및 사용자 메시지를 입력할 수 있는 동적 서버 측 구성 요소가 있습니다. 회사는 매월 100 회 미만의 사이트 방문이 있을 것으로 예상합니다. 이러한 요구 사항을 가장 비용 효율적으로 충족하는 솔루션은 무엇입니까?

- **A.** Amazon Elastic Container Service(Amazon ECS) 에서 동적 문의 양식 페이지를  호스팅합니다. 타사 이메일 공급자에 연결하도록 Amazon Simple Email Service(Amazon SES) 를 설정합니다.
- **B.** Amazon Simple Email Service(Amazon SES) 를 호출하는 AWS Lambda 백엔드로 Amazon API Gateway 엔드포인트를 생성합니다.
- **C.** Amazon Lightsail 을 배포하여 정적 웹 페이지를 동적으로 변환합니다. 클라이언트 측 스크립팅을 사용하여 연락처 양식을 작성하십시오. 양식을 Amazon WorkMail 과 통합합니다.
- **D.** t2.micro Amazon EC2 인스턴스를 생성합니다. LAMP(Linux, Apache, MySQL, PHP/Perl/Python) 스택을 배포하여 웹 페이지를 호스팅합니다. 클라이언트 측 스크립팅을 사용하여 연락처 양식을 작성하십시오. 양식을 Amazon WorkMail 과 통합합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q292

한 회사가 여러 소스에서 실시간 스트리밍 데이터를 수집할 새로운 데이터 플랫폼을 준비하고 있습니다. 회사는 Amazon S3 에 데이터를 쓰기 전에 데이터를 변환해야 합니다. 회사는 SQL 을 사용하여 변환된 데이터를 쿼리할 수 있는 기능이 필요합니다. 이러한 요구 사항을 충족하는 솔루션은 무엇입니까? ( 두 가지를 선택하세요.)

- **A.** Amazon Kinesis Data Streams 를 사용하여 데이터를 스트리밍합니다. Amazon Kinesis Data Analytics 를 사용하여 데이터를 변환합니다. Amazon Kinesis Data Firehose 를 사용하여 Amazon S3 에 데이터를 씁니다. Amazon Athena 를 사용하여 Amazon S3 에서 변환된 데이터를 쿼리합니다.
- **B.** Amazon Managed Streaming for Apache Kafka(Amazon MSK) 를 사용하여 데이터를 스트리밍합니다. AWS Glue 를 사용하여 데이터를 변환하고 데이터를 Amazon S3 에 씁니다. Amazon Athena 를 사용하여 Amazon S3 에서 변환된 데이터를 쿼리합니다.
- **C.** AWS Database Migration Service(AWS DMS) 를 사용하여 데이터를 수집합니다. Amazon EMR 을 사용하여 데이터를 변환하고 Amazon S3 에 데이터를 씁니다. Amazon Athena 를 사용하여 Amazon S3 에서 변환된 데이터를 쿼리합니다.
- **D.** Amazon Managed Streaming for Apache Kafka(Amazon MSK) 를 사용하여 데이터를 스트리밍합니다. Amazon Kinesis Data Analytics 를 사용하여 데이터를 변환하고 데이터를 Amazon S3 에 씁니다. Amazon RDS 쿼리 편집기를 사용하여 Amazon S3 에서 변환된 데이터를 쿼리합니다. E. Amazon Kinesis Data Streams 를 사용하여 데이터를 스트리밍합니다. AWS Glue 를 사용하여 데이터를 변환합니다. Amazon Kinesis Data Fir

> [!answer]- 정답 보기
> **정답: A, B**

### Q308

회사에 통합 결제를 사용하는 여러 AWS 계정이 있습니다. 이 회사는 90 일 동안 여러 개의 활성 고성능 Amazon RDS for Oracle 온디맨드 DB 인스턴스를 실행합니다. 회사의 재무 팀은 통합 결제 계정 및 기타 모든 AWS 계정에서 AWS Trusted Advisor 에 액세스할 수 있습니다. 재무 팀은 적절한 AWS 계정을 사용하여 RDS 에 대한 Trusted Advisor 확인 권장 사항에 액세스해야 합니다. 재무팀은 적절한 Trusted Advisor 수표를 검토하여 RDS 비용을 줄여야 합니다. 이러한 요구 사항을 충족하기 위해 재무 팀은 어떤 조합의 단계를 수행해야 합니까? (2 개 선택)

- **A.** RDS 인스턴스가 실행 중인 계정의 Trusted Advisor 권장 사항을 사용합니다.
- **B.** 통합 결제 계정의 Trusted Advisor 권장 사항을 사용하여 모든 RDS 인스턴스 확인을 동시에 확인합니다.
- **C.** Amazon RDS 예약 인스턴스 최적화에 대한 Trusted Advisor 검사를 검토합니다.
- **D.** Amazon RDS 유휴 DB 인스턴스에 대한 Trusted Advisor 검사를 검토합니다. E. Amazon Redshift 예약 노드 최적화에 대한 Trusted Advisor 검사를 검토합니다.

> [!answer]- 정답 보기
> **정답: B, D**

### Q309

솔루션 설계자는 스토리지 비용을 최적화해야 합니다. 솔루션 설계자는 더 이상 액세스하지 않거나 거의 액세스하지 않는 Amazon S3 버킷을 식별해야 합니다. 최소한의 운영 오버헤드로 이 목표를 달성할 수 있는 솔루션은 무엇입니까?

- **A.** 고급 활동 메트릭에 대한 S3 Storage Lens 대시보드를 사용하여 버킷 액세스 패턴을 분석합니다.
- **B.** AWS Management Console 에서 S3 대시보드를 사용하여 버킷 액세스 패턴을  분석합니다.
- **C.** 버킷에 대한 Amazon CloudWatch BucketSizeBytes 지표를 켭니다. Amazon Athena 에서 메트릭 데이터를 사용하여 버킷 액세스 패턴을 분석합니다.
- **D.** S3 객체 모니터링을 위해 AWS CloudTrail 을 켭니다. Amazon CloudWatch Logs 와 통합된 CloudTrail 로그를 사용하여 버킷 액세스 패턴을 분석합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q311

한 회사에서 AWS 를 사용하여 보험 견적을 처리할 웹 애플리케이션을 설계하고 있습니다. 사용자는 애플리케이션에서 견적을 요청합니다. 견적은 견적 유형별로 구분되어야 하며, 24 시간 이내에 응답해야 하며 분실해서는 안 됩니다. 솔루션은 운영 효율성을 극대화하고 유지 보수를 최소화해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** 견적 유형에 따라 여러 Amazon Kinesis 데이터 스트림을 생성합니다. 적절한 데이터 스트림으로 메시지를 보내도록 웹 애플리케이션을 구성합니다. Kinesis Client Library(KCL) 를 사용하여 자체 데이터 스트림에서 메시지를 풀링하도록 애플리케이션 서버의 각 백엔드 그룹을 구성합니다.
- **B.** 각 견적 유형에 대해 AWS Lambda 함수 및 Amazon Simple Notification Service(Amazon SNS) 주제를 생성합니다. 연결된 SNS 주제에 Lambda 함수를 구독합니다. 견적 요청을 적절한 SNS 주제에 게시하도록 애플리케이션을 구성합니다.
- **C.** 단일 Amazon Simple Notification Service(Amazon SNS) 주제를 생성합니다. SNS 주제에 대한 Amazon Simple Queue Service(Amazon SQS) 대기열을 구독합니다. 견적 유형에 따라 적절한 SQS 대기열에 메시지를 게시하도록 SNS 메시지 필터링을 구성합니다. 자체 SQS 대기열을 사용하도록 각 백엔드 애플리케이션 서버를 구성합니다.
- **D.** 데이터 스트림을 Amazon OpenSearch Service 클러스터로 전달하기 위해 견적 유형을 기반으로 여러 Amazon Kinesis Data Firehose 전달 스트림을 생성합니다. 적절한 전송 스트림으로 메시지를 보내도록 애플리케이션을 구성합니다. OpenSearch Service 에서 메시지를 검색하고 그에 따라 처리하도록 애플리케이션 서버의 각 백엔드 그룹을 구성합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q317

회사에서 레거시 애플리케이션을 사용하여 데이터를 CSV 형식으로 생성합니다. 레거시 애플리케이션은 출력 데이터를 Amazon S3 에 저장합니다. 이 회사는 복잡한 SQL 쿼리를 수행하여 Amazon Redshift 및 Amazon S3 에만 저장된 데이터를 분석할 수 있는 새로운 상용 기성품(COTS) 애플리케이션을 배포하고 있습니다. 그러나 COTS 애플리케이션은 레거시 애플리케이션이 생성하는 .csv 파일을 처리할 수 없습니다. 회사는 레거시 애플리케이션을 업데이트하여 다른 형식으로 데이터를 생성할 수 없습니다. 회사는 COTS 애플리케이션이 레거시 애플리케이션이 생성하는 데이터를 사용할 수 있도록 솔루션을 구현해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 일정에 따라 실행되는 AWS Glue 추출, 변환 및 로드(ETL) 작업을 생성합니다. .csv 파일을 처리하고 처리된 데이터를 Amazon Redshift 에 저장하도록 ETL 작업을 구성합니다.
- **B.** Amazon EC2 인스턴스에서 실행되는 Python 스크립트를 개발하여 .csv 파일을 .sql 파일로 변환합니다. Cron 일정에서 Python 스크립트를 호출하여 출력 파일을 Amazon S3 에  저장합니다.
- **C.** AWS Lambda 함수와 Amazon DynamoDB 테이블을 생성합니다. S3 이벤트를 사용하여 Lambda 함수를 호출합니다. ETL( 추출, 변환 및 로드) 작업을 수행하여 .csv 파일을 처리하고 처리된 데이터를 DynamoDB 테이블에 저장하도록 Lambda 함수를 구성합니다.
- **D.** Amazon EventBridge 를 사용하여 매주 일정에 따라 Amazon EMR 클러스터를 시작합니다. 추출, 변환 및 로드(ETL) 작업을 수행하여 .csv 파일을 처리하고 처리된 데이터를 Amazon Redshift 테이블에 저장하도록 EMR 클러스터를 구성합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q320

회사에서 Amazon EC2 인스턴스 플릿을 사용하여 온프레미스 데이터 소스에서 데이터를 수집하고 있습니다. 데이터는 JSON 형식이며 수집 속도는 최대 1MB/s 입니다. EC2 인스턴스가 재부팅되면 진행 중인 데이터가 손실됩니다. 회사의 데이터 과학 팀은 거의 실시간으로 수집된 데이터를 쿼리하려고 합니다. 데이터 손실을 최소화하면서 확장 가능한 거의 실시간 데이터 쿼리를 제공하는 솔루션은 무엇입니까?

- **A.** Amazon Kinesis Data Streams 에 데이터를 게시하고 Kinesis Data Analytics 를 사용하여 데이터를 쿼리합니다.
- **B.** Amazon Redshift 를 대상으로 사용하여 Amazon Kinesis Data Firehose 에 데이터를  게시합니다. Amazon Redshift 를 사용하여 데이터를 쿼리합니다.
- **C.** 수집된 데이터를 EC2 인스턴스 스토어에 저장합니다. Amazon S3 를 대상으로 Amazon Kinesis Data Firehose 에 데이터를 게시합니다. Amazon Athena 를 사용하여 데이터를 쿼리합니다.
- **D.** 수집된 데이터를 Amazon Elastic Block Store(Amazon EBS) 볼륨에 저장합니다. Redis 용 Amazon ElastiCache 에 데이터를 게시합니다. Redis 채널을 구독하여 데이터를 쿼리합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q341

회사에는 AWS Lake Formation 에서 관리하는 Amazon S3 데이터 레이크가 있습니다. 이 회사는 데이터 레이크의 데이터를 Amazon Aurora MySQL 데이터베이스에 저장된 운영 데이터와 결합하여 Amazon QuickSight 에서 시각화를 생성하려고 합니다. 회사는 회사의 마케팅 팀이 데이터베이스의 열 하위 집합에만 액세스할 수 있도록 열 수준 권한을 적용하려고 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** Amazon EMR 을 사용하여 데이터베이스에서 QuickSight SPICE 엔진으로 직접 데이터를 수집하십시오. 필요한 열만 포함합니다.
- **B.** AWS Glue Studio 를 사용하여 데이터베이스에서 S3 데이터 레이크로 데이터를 수집합니다. IAM 정책을 QuickSight 사용자에게 연결하여 열 수준 액세스 제어를 적용합니다. QuickSight 에서 Amazon S3 를 데이터 원본으로 사용합니다.
- **C.** AWS Glue Elastic Views 를 사용하여 Amazon S3 의 데이터베이스에 대한 구체화된 보기를 생성합니다. QuickSight 사용자에 대한 열 수준 액세스 제어를 적용하려면 S3 버킷 정책을 생성합니다. QuickSight 에서 Amazon S3 를 데이터 원본으로 사용합니다.
- **D.** Lake Formation 청사진을 사용하여 데이터베이스에서 S3 데이터 레이크로 데이터를 수집합니다. Lake Formation 을 사용하여 QuickSight 사용자에 대한 열 수준 액세스 제어를 적용합니다. QuickSight 에서 Amazon Athena 를 데이터 원본으로 사용합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q351

회사에서 데이터 관리 애플리케이션을 AWS 로 이전하고 있습니다. 회사는 이벤트 기반 아키텍처로 전환하려고 합니다. 아키텍처는 워크플로의 다양한 측면을 수행하면서 더 많이 분산되고 서버리스 개념을 사용해야 합니다. 회사는 또한 운영 오버헤드를 최소화하기를  원합니다. 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** AWS Glue 에서 워크플로를 구축합니다. AWS Glue 를 사용하여 AWS Lambda 함수를 호출하여 워크플로 단계를 처리합니다.
- **B.** AWS Step Functions 에서 워크플로를 구축합니다. Amazon EC2 인스턴스에 애플리케이션을 배포합니다. Step Functions 를 사용하여 EC2 인스턴스에서 워크플로 단계를 호출합니다.
- **C.** Amazon EventBridge 에서 워크플로를 구축합니다. EventBridge 를 사용하여 일정에 따라 AWS Lambda 함수를 호출하여 워크플로 단계를 처리합니다.
- **D.** AWS Step Functions 에서 워크플로를 구축합니다. Step Functions 를 사용하여 상태 머신을 생성합니다. 상태 시스템을 사용하여 AWS Lambda 함수를 호출하여 워크플로 단계를 처리합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q361

A company hosts a multiplayer gaming application on AWS. The company wants the application to read data with sub - millisecond latency and run one - time queries on historical data. Which solution will meet these requirements with the LEAST operational overhead?

- **A.** Use Amazon RDS for data that is frequently accessed. Run a periodic custom script to export the data to an Amazon S3 bucket.
- **B.** Store the data directly in an Amazon S3 bucket. Implement an S3 Lifecycle policy to move older data to S3 Glacier Deep Archive for long - term storage. Run one - time queries on the data in Amazon S3 by using Amazon Athena.
- **C.** Use Amazon DynamoDB with DynamoDB Accelerator (DAX) for data that is frequently accessed. Export the data to an Amazon S3 bucket by using DynamoDB table export. Run one - time queries on the data in Amazon S3 by using Amazon Athena.
- **D.** Use Amazon DynamoDB for data that is frequently accessed. Turn on streaming to Amazon Kinesis Data Streams. Use Amazon Kinesis Data Firehose to read the data from Kinesis Data Streams. Store the records in an Amazon S3 bucket.

> [!answer]- 정답 보기
> **정답: C**

### Q362

회사는 특정 지불 ID 에 대한 메시지가 전송된 순서대로 수신되어야 하는 지불 처리 시스템을 사용합니다. 그렇지 않으면 결제가 잘못 처리될 수 있습니다. 솔루션 설계자는 이 요구 사항을 충족하기 위해 어떤 조치를 취해야 합니까? (2 개 선택)

- **A.** 결제 ID 를 파티션 키로 사용하여 Amazon DynamoDB 테이블에 메시지를 씁니다.
- **B.** 결제 ID 를 파티션 키로 사용하여 Amazon Kinesis 데이터 스트림에 메시지를 씁니다.
- **C.** 결제 ID 를 키로 사용하여 Amazon ElastiCache for Memcached 클러스터에 메시지를 씁니다.
- **D.** Amazon Simple Queue Service(Amazon SQS) 대기열에 메시지를 씁니다. 결제 ID 를 사용하도록 메시지 속성을 설정합니다. E. Amazon Simple Queue Service(Amazon SQS) FIFO 대기열에 메시지를 씁니다. 결제 ID 를 사용할 메시지 그룹을 설정합니다.

> [!answer]- 정답 보기
> **정답: B**
>
> , E

### Q373

회사에 자동차의 loT 센서에서 데이터를 수집하는 애플리케이션이 있습니다. 데이터는 Amazon Kinesis Data 를 통해 Amazon S3 에 스트리밍 및 저장됩니다. 소방 호스. 데이터는 매년 수조 개의 S3 객체를 생성합니다. 매일 아침 회사는 지난 30 일 동안의 데이터를 사용하여 일련의 기계 학습(ML) 모델을 재교육합니다. 매년 4 회 회사는 이전 12 개월의 데이터를 사용하여 분석을 수행하고 다른 ML 모델을 교육합니다. 데이터는 최대 1 년 동안 최소한의 지연으로 사용할 수 있어야 합니다. 1 년 후에는 데이터를 보관 목적으로 보관해야 합니다.  이러한 요구 사항을 가장 비용 효율적으로 충족하는 스토리지 솔루션은 무엇입니까?

- **A.** S3 Intelligent - Tiering 스토리지 클래스를 사용합니다. 1 년 후 객체를 S3 Glacier Deep Archive 로 전환하는 S3 수명 주기 정책을 생성합니다.
- **B.** S3 Intelligent - Tiering 스토리지 클래스를 사용합니다. 1 년 후 자동으로 객체를 S3 Glacier Deep Archive 로 이동하도록 S3 Intelligent - Tiering 을 구성합니다.
- **C.** S3 Standard - Infrequent Access(S3 Standard - IA) 스토리지 클래스를 사용합니다. 1 년 후 객체를 S3 Glacier Deep Archive 로 전환하는 S3 수명 주기 정책을 생성합니다.
- **D.** S3 Standard 스토리지 클래스를 사용합니다. 30 일 후에 객체를 S3 Standard - Infrequent Access(S3 Standard - IA) 로 전환한 다음 1 년 후에 S3 Glacier Deep Archive 로 전환하는 S3 수명 주기 정책을 생성합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q375

전자상거래 회사는 주문 처리 작업을 완료하기 위해 여러 서버리스 기능과 AWS 서비스를 포함하는 분산 애플리케이션을 구축하고 있습니다. 이러한 작업에는 워크플로의 일부로 수동 승인이 필요합니다. 솔루션 설계자는 주문 처리 애플리케이션을 위한 아키텍처를 설계해야 합니다. 솔루션은 여러 AWS Lambda 기능을 반응형 서버리스 애플리케이션으로 결합할 수 있어야 합니다. 솔루션은 또한 Amazon EC2 인스턴스, 컨테이너 또는 온프레미스 서버에서 실행되는 데이터 및 서비스를 오케스트레이션해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** AWS Step Functions 를 사용하여 애플리케이션을 구축하십시오.
- **B.** AWS Glue 작업에서 모든 애플리케이션 구성 요소를 통합합니다.
- **C.** Amazon Simple Queue Service(Amazon SQS) 를 사용하여 애플리케이션을 구축합니다.
- **D.** AWS Lambda 함수와 Amazon EventBridge 이벤트를 사용하여 애플리케이션을 구축합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q386

전자상거래 회사는 AWS 에서 다중 계층 애플리케이션을 실행하고 있습니다. 프런트 엔드 및 백엔드 계층은 모두 Amazon EC2 에서 실행되고 데이터베이스는 Amazon RDS for MySQL 에서 실행됩니다. 백엔드 계층은 RDS 인스턴스와 통신합니다. 성능 저하를 일으키는 데이터베이스에서 동일한 데이터 세트를 반환하라는 호출이 자주 있습니다. 백엔드의 성능을 개선하려면 어떤 조치를 취해야 합니까?

- **A.** Amazon SNS 를 구현하여 데이터베이스 호출을 저장합니다.
- **B.** Amazon ElastiCache 를 구현하여 대규모 데이터 세트를 캐싱합니다.
- **C.** 데이터베이스 호출을 캐시하기 위해 RDS for MySQL 읽기 전용 복제본을 구현합니다.
- **D.** Amazon Kinesis Data Firehose 를 구현하여 호출을 데이터베이스로 스트리밍합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q393

결제 처리 회사는 고객과의 모든 음성 통신을 녹음하고 오디오 파일을 Amazon S3 버킷에 저장합니다. 회사는 오디오 파일에서 텍스트를 캡처해야 합니다. 회사는 텍스트에서 고객에게 속한 모든 개인 식별 정보(PII) 를 제거해야 합니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** Amazon Kinesis Video Streams 를 사용하여 오디오 파일을 처리합니다. AWS Lambda 함수를 사용하여 알려진 PII 패턴을 스캔합니다.
- **B.** 오디오 파일이 S3 버킷에 업로드되면 AWS Lambda 함수를 호출하여 Amazon Textract 작업을 시작하여 통화 녹음을 분석합니다.
- **C.** PII 수정을 켠 상태로 Amazon Transcribe 전사 작업을 구성합니다. 오디오 파일이 S3 버킷에 업로드되면 AWS Lambda 함수를 호출하여 전사 작업을 시작합니다. 출력을 별도의  S3 버킷에 저장합니다.
- **D.** 트랜스크립션이 켜진 오디오 파일을 수집하는 Amazon Connect 고객 응대 흐름을 생성합니다. 알려진 PII 패턴을 스캔하기 위해 AWS Lambda 함수를 포함합니다. 오디오 파일이 S3 버킷에 업로드되면 Amazon EventBridge 를 사용하여 고객 응대 흐름을 시작하십시오.

> [!answer]- 정답 보기
> **정답: C**

### Q402

회사는 애플리케이션에서 생성하는 대량의 스트리밍 데이터를 수집하고 처리해야 합니다. 이 애플리케이션은 Amazon EC2 인스턴스에서 실행되며 기본 설정으로 구성된 Amazon Kinesis Data Streams 로 데이터를 전송합니다. 격일로 애플리케이션은 데이터를 소비하고 비즈니스 인텔리전스(BI) 처리를 위해 데이터를 Amazon S3 버킷에 기록합니다. 회사는 Amazon S3 가 애플리케이션이 Kinesis Data Streams 로 보내는 모든 데이터를 수신하지 못하는 것을 관찰합니다. 솔루션 설계자는 이 문제를 해결하기 위해 무엇을 해야 합니까?

- **A.** 데이터 보존 기간을 수정하여 Kinesis Data Streams 기본 설정을 업데이트합니다.
- **B.** Kinesis Producer Library(KPL) 를 사용하여 Kinesis Data Streams 로 데이터를 전송하도록 애플리케이션을 업데이트합니다.
- **C.** Kinesis Data Streams 로 전송되는 데이터의 처리량을 처리하도록 Kinesis 샤드 수를 업데이트합니다.
- **D.** S3 버킷 내에서 S3 버전 관리를 켜서 S3 버킷에 수집된 모든 객체의 모든 버전을 보존합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q416

빠르게 성장하는 글로벌 전자상거래 회사는 AWS 에서 웹 애플리케이션을 호스팅하고 있습니다. 웹 애플리케이션에는 정적 콘텐츠와 동적 콘텐츠가 포함됩니다. 웹사이트는 Amazon RDS 데이터베이스에 OLTP( 온라인 거래 처리) 데이터를 저장합니다. 웹사이트 사용자의 페이지 로드 속도가 느립니다. 이 문제를 해결하기 위해 솔루션 아키텍트가 취해야 할 조치 조합은 무엇입니까? (2 개 선택)

- **A.** Amazon Redshift 클러스터를 구성합니다.
- **B.** Amazon CloudFront 배포를 설정합니다.
- **C.** Amazon S3 에서 동적 웹 콘텐츠를 호스팅합니다.
- **D.** RDS DB 인스턴스에 대한 읽기 전용 복제본을 생성합니다. E. RDS DB 인스턴스에 대한 다중 AZ 배포를 구성합니다.

> [!answer]- 정답 보기
> **정답: B, D**

### Q432

한 전자상거래 회사에서 기계 학습(ML) 알고리즘을 사용하여 모델을 구축하고 훈련하려고 합니다. 회사는 모델을 사용하여 복잡한 시나리오를 시각화하고 고객 데이터의 추세를 감지합니다. 아키텍처 팀은 ML 모델을 보고 플랫폼과 통합하여 증강 데이터를 분석하고 비즈니스 인텔리전스 대시보드에서 직접 데이터를 사용하려고 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** AWS Glue 를 사용하여 ML 변환을 생성하여 모델을 구축하고 교육합니다. Amazon OpenSearch Service 를 사용하여 데이터를 시각화합니다.
- **B.** Amazon SageMaker 를 사용하여 모델을 구축하고 교육합니다. Amazon QuickSight 를 사용하여 데이터를 시각화합니다.
- **C.** AWS Marketplace 에서 사전 구축된 ML Amazon 머신 이미지(AMI) 를 사용하여 모델을 구축하고 교육합니다. Amazon OpenSearch Service 를 사용하여 데이터를 시각화합니다.
- **D.** Amazon QuickSight 를 사용하여 계산된 필드를 사용하여 모델을 구축하고 교육합니다. Amazon QuickSight 를 사용하여 데이터를 시각화합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q442

한 회사가 여러 AWS 계정에 몇 페타바이트의 데이터를 저장합니다. 이 회사는 AWS Lake Formation 을 사용하여 데이터 레이크를 관리합니다. 회사의 데이터 과학 팀은 분석 목적으로 회사의 엔지니어링 팀과 계정에서 선택한 데이터를 안전하게 공유하려고 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 필요한 데이터를 공통 계정에 복사하십시오. 해당 계정에서 IAM 액세스 역할을 생성합니다. 엔지니어링 팀 계정의 사용자를 신뢰할 수 있는 엔터티로 포함하는 권한 정책을 지정하여 액세스 권한을 부여합니다.
- **B.** 필요한 엔지니어링 팀 사용자가 데이터에 액세스할 수 있도록 데이터가 저장된 각 계정에서 Lake Formation 권한 부여 명령을 사용합니다.
- **C.** AWS Data Exchange 를 사용하여 필요한 데이터를 필요한 엔지니어링 팀 계정에 비공개로 게시합니다.
- **D.** Lake Formation 태그 기반 액세스 제어를 사용하여 엔지니어링 팀 계정에 필요한 데이터에 대한 교차 계정 권한을 승인하고 부여합니다.

> [!answer]- 정답 보기
> **정답: D**
