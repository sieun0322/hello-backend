---
tags: #performance #serverless #caching #practice
source_pdf: SAA-C03_Examtopics_V18.35_KOR.txt
---
# Practice: 고성능 아키텍처 (Domain 3)

> Lambda, ElastiCache, CloudFront, ECS, API Gateway, SQS, Kinesis 관련 문제

**총 문제 수:** 60개

## Related Concepts
[[컴퓨팅-스케일링]], [[캐싱전략]], [[서버리스-아키텍처]]

---

### Q4

애플리케이션은 VPC 의 Amazon EC2 인스턴스에서 실행됩니다. 애플리케이션은 Amazon S3 버킷에 저장된 로그를 처리합니다. EC2 인스턴스는 인터넷 연결 없이 S3 버킷에 액세스해야 합니다. Amazon S3 에 대한 프라이빗 네트워크 연결을 제공하는 솔루션은 무엇입니까?

- **A.** S3 버킷에 대한 게이트웨이 VPC 엔드포인트를 생성합니다.
- **B.** Amazon CloudWatch Logs 로 로그를 스트리밍합니다. 로그를 S3 버킷으로 내보냅니다.
- **C.** Amazon EC2 에 인스턴스 프로파일을 생성하여 S3 액세스를 허용합니다.
- **D.** S3 엔드포인트에 액세스하기 위한 프라이빗 링크가 있는 Amazon API Gateway API 를 생성합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q7

회사에 들어오는 메시지를 수집하는 응용 프로그램이 있습니다. 그러면 수십 개의 다른 애플리케이션과 마이크로서비스가 이러한 메시지를 빠르게 소비합니다. 메시지 수는 급격하게 변하며 때로는 초당 100,000 개로 갑자기 증가하기도 합니다. 이 회사는 솔루션을 분리하고 확장성을 높이고자 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** Amazon Kinesis Data Analytics 에 대한 메시지를 유지합니다. 메시지를 읽고 처리하도록 소비자 애플리케이션을 구성합니다.
- **B.** Auto Scaling 그룹의 Amazon EC2 인스턴스에 수집 애플리케이션을 배포하여 CPU 지표를 기반으로 EC2 인스턴스 수를 확장합니다.
- **C.** 단일 샤드를 사용하여 Amazon Kinesis Data Streams 에 메시지를 씁니다. AWS Lambda 함수를 사용하여 메시지를 사전 처리하고 Amazon DynamoDB 에 저장합니다. 메시지를 처리하기 위해 DynamoDB 에서 읽도록 소비자 애플리케이션을 구성합니다.
- **D.** 여러 Amazon Simple Queue Service(Amazon SOS) 구독이 있는 Amazon Simple Notification Service(Amazon SNS) 주제에 메시지를 게시합니다 . 대기열의 메시지를 처리하도록 소비자 애플리케이션을 구성합니다 .

> [!answer]- 정답 보기
> **정답: D**

### Q8

회사에서 분산 애플리케이션을 AWS 로 마이그레이션하고 있습니다. 애플리케이션은 다양한 워크로드를 처리합니다. 레거시 플랫폼은 여러 컴퓨팅 노드에서 작업을 조정하는 기본 서버로 구성됩니다. 이 회사는 탄력성과 확장성을 극대화하는 솔루션으로 애플리케이션을 현대화하려고 합니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 아키텍처를 어떻게 설계해야 합니까?

- **A.** 작업의 대상으로 Amazon Simple Queue Service(Amazon SQS) 대기열을 구성합니다. Auto Scaling 그룹에서 관리되는 Amazon EC2 인스턴스로 컴퓨팅 노드를 구현합니다. 예약된 조정을 사용하도록 EC2 Auto Scaling 을 구성합니다.
- **B.** 작업의 대상으로 Amazon Simple Queue Service(Amazon SQS) 대기열을 구성합니다. Auto Scaling 그룹에서 관리되는 Amazon EC2 인스턴스로 컴퓨팅 노드를 구현합니다. 대기열 크기에 따라 EC2 Auto Scaling 을 구성합니다.
- **C.** Auto Scaling 그룹에서 관리되는 Amazon EC2 인스턴스로 기본 서버와 컴퓨팅 노드를 구현합니다. 작업의 대상으로 AWS CloudTrail 을 구성합니다. 기본 서버의 부하를 기반으로 EC2 Auto Scaling 을 구성합니다.
- **D.** Auto Scaling 그룹에서 관리되는 Amazon EC2 인스턴스로 기본 서버와 컴퓨팅 노드를 구현합니다. 작업의 대상으로 Amazon EventBridge(Amazon CloudWatch Events) 를 구성합니다. 컴퓨팅 노드의 부하를 기반으로 EC2 Auto Scaling 을 구성합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q10

회사는 AWS 에서 전자 상거래 웹 애플리케이션을 구축하고 있습니다. 애플리케이션은 처리할 Amazon API Gateway REST API 에 새 주문에 대한 정보를 보냅니다. 회사는 주문이 접수된 순서대로 처리되기를 원합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** API Gateway 통합을 사용하여 애플리케이션이 주문을 수신할 때 Amazon Simple Notification Service(Amazon SNS) 주제에 메시지를 게시합니다. AWS Lambda 함수를 주제에 구독하여 처리를 수행합니다.
- **B.** API Gateway 통합을 사용하여 애플리케이션이 주문을 수신할 때 Amazon Simple Queue Service(Amazon SQS) FIFO 대기열에 메시지를 보냅니다. 처리를 위해 AWS Lambda 함수를 호출하도록 SQS FIFO 대기열을 구성합니다.
- **C.** API Gateway 권한 부여자를 사용하여 애플리케이션이 주문을 처리하는 동안 모든 요청을 차단합니다.
- **D.** API Gateway 통합을 사용하여 애플리케이션이 주문을 수신할 때 Amazon Simple Queue Service(Amazon SQS) 표준 대기열에 메시지를 보냅니다. 처리를 위해 AWS Lambda 함수를 호출하도록 SQS 표준 대기열을 구성합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q12

글로벌 회사는 ALB(Application Load Balancer) 뒤의 Amazon EC2 인스턴스에서 웹 애플리케이션을 호스팅합니다. 웹 애플리케이션에는 정적 데이터와 동적 데이터가 있습니다. 회사는 정적 데이터를 Amazon S3 버킷에 저장합니다. 회사는 정적 데이터 및 동적  데이터의 성능을 개선하고 대기 시간을 줄이기를 원합니다. 회사는 Amazon Route 53 에 등록된 자체 도메인 이름을 사용하고 있습니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** S3 버킷과 ALB 를 오리진으로 포함하는 Amazon CloudFront 배포를 생성합니다. CloudFront 배포로 트래픽을 라우팅하도록 Route 53 을 구성합니다.
- **B.** ALB 가 오리진인 Amazon CloudFront 배포를 생성합니다. S3 버킷을 엔드포인트로 포함하는 AWS Global Accelerator 표준 액셀러레이터를 생성합니다. CloudFront 배포로 트래픽을 라우팅하도록 Route 53 을 구성합니다.
- **C.** S3 버킷을 오리진으로 포함하는 Amazon CloudFront 배포를 생성합니다. ALB 및 CloudFront 배포를 엔드포인트로 포함하는 AWS Global Accelerator 표준 액셀러레이터를 생성합니다. 가속기 DNS 이름을 가리키는 사용자 지정 도메인 이름을 만듭니다. 사용자 지정 도메인 이름을 웹 애플리케이션의 끝점으로 사용합니다.
- **D.** ALB 가 오리진인 Amazon CloudFront 배포를 생성합니다. S3 버킷을 엔드포인트로 포함하는 AWS Global Accelerator 표준 액셀러레이터를 생성합니다. 두 개의 도메인 이름을 만듭니다. 하나의 도메인 이름이 동적 콘텐츠의 CloudFront DNS 이름을 가리키도록 합니다. 다른 도메인 이름이 정적 콘텐츠에 대한 가속기 DNS 이름을 가리키도록 합니다. 도메인 이름을 웹 애플리케이션의 끝점으로 사용합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q13

회사는 AWS 인프라에 대한 월별 유지 관리를 수행합니다. 이러한 유지 관리 활동 중에 회사는 여러 AWS 리전에서 MySQL 용 Amazon RDS 데이터베이스에 대한 자격 증명을 교체해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 자격 증명을 AWS Secrets Manager 에 암호로 저장합니다. 필요한 리전에 대해 다중 리전 비밀 복제를 사용합니다. 일정에 따라 보안 암호를 교체하도록 Secrets Manager 를 구성합니다.
- **B.** 보안 문자열 파라미터를 생성하여 AWS Systems Manager 에 자격 증명을 보안 암호로 저장합니다. 필요한 리전에 대해 다중 리전 비밀 복제를 사용합니다. 일정에 따라 암호를 교체하도록 Systems Manager 를 구성합니다.
- **C.** 서버 측 암호화(SSE) 가 활성화된 Amazon S3 버킷에 자격 증명을 저장합니다. Amazon EventBridge(Amazon CloudWatch Events) 를 사용하여 AWS Lambda 함수를 호출하여 자격 증명을 교체합니다.
- **D.** AWS Key Management Service(AWS KMS) 다중 리전 고객 관리형 키를 사용하여 자격 증명을 비밀로 암호화합니다. Amazon DynamoDB 전역 테이블에 암호를 저장합니다. AWS Lambda 함수를 사용하여 DynamoDB 에서 암호를 검색합니다. RDS API 를 사용하여 비밀을 교체합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q14

회사는 Application Load Balancer 뒤의 Amazon EC2 인스턴스에서 전자 상거래 애플리케이션을 실행합니다. 인스턴스는 여러 가용 영역에 걸쳐 Amazon EC2 Auto Scaling 그룹에서 실행됩니다. Auto Scaling 그룹은 CPU 사용률 메트릭을 기반으로 확장됩니다. 전자 상거래 애플리케이션은 대규모 EC2 인스턴스에서 호스팅되는 MySQL 8.0 데이터베이스에 트랜잭션 데이터를 저장합니다. 애플리케이션 로드가 증가하면 데이터베이스의 성능이 빠르게 저하됩니다. 애플리케이션은 쓰기 트랜잭션보다 더 많은 읽기 요청을 처리합니다. 이 회사는 고가용성을 유지하면서 예측할 수 없는 읽기 워크로드의 수요를 충족하도록 데이터베이스를 자동으로 확장하는 솔루션을 원합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** 리더 및 컴퓨팅 기능을 위해 단일 노드와 함께 Amazon Redshift 를 사용하십시오.
- **B.** 단일 AZ 배포와 함께 Amazon RDS 사용 다른 가용 영역에 리더 인스턴스를 추가하도록 Amazon RDS 를 구성합니다.
- **C.** 다중 AZ 배포와 함께 Amazon Aurora 를 사용합니다. Aurora 복제본을 사용하여 Aurora Auto Scaling 을 구성합니다.
- **D.** EC2 스팟 인스턴스와 함께 Memcached 용 Amazon ElastiCache 를 사용합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q18

애플리케이션 개발 팀은 큰 이미지를 더 작은 압축 이미지로 변환하는 마이크로서비스를 설계하고 있습니다. 사용자가 웹 인터페이스를 통해 이미지를 업로드하면 마이크로 서비스는 이미지를 Amazon S3 버킷에 저장하고, AWS Lambda 함수로 이미지를 처리 및 압축하고, 다른 S3 버킷에 압축된 형태로 이미지를 저장해야 합니다. 솔루션 설계자는 내구성이 있는 상태 비저장 구성 요소를 사용하여 이미지를 자동으로 처리하는 솔루션을 설계해야 합니다. 이러한 요구 사항을 충족하는 작업 조합은 무엇입니까? (2 개를 선택하세요.)

- **A.** Amazon Simple Queue Service(Amazon SQS) 대기열을 생성합니다. 이미지가 S3 버킷에 업로드될 때 SQS 대기열에 알림을 보내도록 S3 버킷을 구성합니다.
- **B.** Amazon Simple Queue Service(Amazon SQS) 대기열을 호출 소스로 사용하도록 Lambda 함수를 구성합니다. SQS 메시지가 성공적으로 처리되면 대기열에서 메시지를 삭제합니다.
- **C.** 새 업로드에 대해 S3 버킷을 모니터링하도록 Lambda 함수를 구성합니다. 업로드된 이미지가 감지되면 메모리의 텍스트 파일에 파일 이름을 쓰고 텍스트 파일을 사용하여 처리된 이미지를 추적합니다.
- **D.** Amazon EC2 인스턴스를 시작하여 Amazon Simple Queue Service(Amazon SQS) 대기열을 모니터링합니다. 항목이 대기열에 추가되면 EC2 인스턴스의 텍스트 파일에 파일 이름을 기록하고 Lambda 함수를 호출합니다. E. Amazon EventBridge(Amazon CloudWatch Events) 이벤트를 구성하여 S3 버킷을 모니터링합니다. 이미지가 업로드되면 추가 처리를 위해 애플리케이션 소유자의 이메일 주소와 함께 Amazon ample Notification Service(Amazon SNS

> [!answer]- 정답 보기
> **정답: A, B**

### Q21

전자 상거래 회사는 AWS 에서 하루 1 회 웹 사이트를 시작하려고 합니다. 매일 24 시간 동안 정확히 하나의 제품을 판매합니다. 회사는 피크 시간 동안 밀리초 지연 시간으로 시간당 수백만 개의 요청을 처리할 수 있기를 원합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** Amazon S3 를 사용하여 다른 S3 버킷에 전체 웹 사이트를 호스팅합니다. Amazon CloudFront 배포를 추가합니다. S3 버킷을 배포의 오리진으로 설정합니다. Amazon S3 에 주문 데이터를 저장합니다.
- **B.** 여러 가용 영역의 Auto Scaling 그룹에서 실행되는 Amazon EC2 인스턴스에 전체 웹 사이트를 배포합니다. ALB(Application Load Balancer) 를 추가하여 웹 사이트 트래픽을  분산합니다. 백엔드 API 에 대해 다른 ALB 를 추가하십시오. MySQL 용 Amazon RDS 에 데이터를 저장합니다.
- **C.** 컨테이너에서 실행되도록 전체 애플리케이션을 마이그레이션합니다. Amazon Elastic Kubernetes Service(Amazon EKS) 에서 컨테이너를 호스팅합니다. Kubernetes 클러스터 자동 확장 처리를 사용하여 트래픽 버스트를 처리할 포드 수를 늘리거나 줄입니다. MySQL 용 Amazon RDS 에 데이터를 저장합니다.
- **D.** Amazon S3 버킷을 사용하여 웹 사이트의 정적 콘텐츠를 호스팅합니다. Amazon CloudFront 배포를 배포합니다. S3 버킷을 오리진으로 설정합니다. 백엔드 API 에 Amazon API Gateway 및 AWS Lambda 함수를 사용합니다. Amazon DynamoDB 에 데이터를 저장합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q25

회사에서 응용 프로그램을 설계하고 있습니다. 애플리케이션은 AWS Lambda 함수를 사용하여 Amazon API Gateway 를 통해 정보를 수신하고 Amazon Aurora PostgreSQL 데이터베이스에 정보를 저장합니다. 개념 증명 단계에서 회사는 데이터베이스에 로드해야 하는 대용량 데이터를 처리하기 위해 Lambda 할당량을 크게 늘려야 합니다. 솔루션 설계자는 확장성을 개선하고 구성 노력을 최소화하기 위해 새로운 설계를 권장해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** Lambda 함수 코드를 Amazon EC2 인스턴스에서 실행되는 Apache Tomcat 코드로 리팩터링합니다. 네이티브 JDBC(Java Database Connectivity) 드라이버를 사용하여 데이터베이스를 연결합니다.
- **B.** 플랫폼을 Aurora 에서 Amazon DynamoDProvision a DynamoDB Accelerator(DAX) 클러스터로 변경합니다. DAX 클라이언트 SDK 를 사용하여 DAX 클러스터에서 기존 DynamoDB API 호출을 가리킵니다.
- **C.** 두 개의 Lambda 함수를 설정합니다. 정보를 수신할 하나의 기능을 구성하십시오. 정보를 데이터베이스에 로드하도록 다른 기능을 구성하십시오. Amazon Simple Notification Service(Amazon SNS) 를 사용하여 Lambda 함수를 통합합니다.
- **D.** 두 개의 Lambda 함수를 설정합니다. 정보를 수신할 하나의 기능을 구성하십시오. 정보를 데이터베이스에 로드하도록 다른 기능을 구성하십시오. Amazon Simple Queue Service(Amazon SQS) 대기열을 사용하여 Lambda 함수를 통합합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q26

회사는 AWS 클라우드 배포를 검토하여 Amazon S3 버킷에 무단 구성 변경이 없는지 확인해야 합니다. 솔루션 설계자는 이 목표를 달성하기 위해 무엇을 해야 합니까?

- **A.** 적절한 규칙으로 AWS Config 를 켭니다.
- **B.** 적절한 검사를 통해 AWS Trusted Advisor 를 켭니다.
- **C.** 적절한 평가 템플릿으로 Amazon Inspector 를 켭니다.
- **D.** Amazon S3 서버 액세스 로깅을 켭니다. Amazon EventBridge(Amazon Cloud Watch Events) 를 구성합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q29

회사는 UDP 연결을 사용하는 VoIP(Voice over Internet Protocol) 서비스를 제공합니다. 이 서비스는 Auto Scaling 그룹에서 실행되는 Amazon EC2 인스턴스로 구성됩니다. 회사는 여러 AWS 리전에 배포하고 있습니다. 회사는 지연 시간이 가장 짧은 리전으로 사용자를 라우팅해야 합니다. 이 회사는 또한 지역 간 자동 장애 조치가 필요합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** NLB(Network Load Balancer) 및 연결된 대상 그룹을 배포합니다. 대상 그룹을 Auto Scaling 그룹과 연결합니다. 각 리전에서 NLB 를 AWS Global Accelerator 엔드포인트로 사용합니다.
- **B.** ALB(Application Load Balancer) 및 연결된 대상 그룹을 배포합니다. 대상 그룹을 Auto Scaling 그룹과 연결합니다. 각 리전에서 ALB 를 AWS Global Accelerator 엔드포인트로 사용합니다.
- **C.** NLB(Network Load Balancer) 및 연결된 대상 그룹을 배포합니다. 대상 그룹을 Auto Scaling 그룹과 연결합니다. 각 NLB 의 별칭을 가리키는 Amazon Route 53 지연 시간 레코드를 생성합니다. 지연 시간 레코드를 오리진으로 사용하는 Amazon CloudFront 배포를 생성합니다.
- **D.** ALB(Application Load Balancer) 및 연결된 대상 그룹을 배포합니다. 대상 그룹을 Auto Scaling 그룹과 연결합니다. 각 ALB 의 별칭을 가리키는 Amazon Route 53 가중치 레코드를 생성합니다. 가중 레코드를 오리진으로 사용하는 Amazon CloudFront 배포를 배포합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q31

AWS 에서 웹 애플리케이션을 호스팅하는 회사는 모든 Amazon EC2 인스턴스를 보장하기를 원합니다. Amazon RDS DB 인스턴스. Amazon Redshift 클러스터는 태그로 구성됩니다. 회사는 이 검사를 구성하고 운영하는 노력을 최소화하기를 원합니다. 솔루션 설계자는 이를 달성하기 위해 무엇을 해야 합니까?

- **A.** AWS Config 규칙을 사용하여 적절하게 태그가 지정되지 않은 리소스를 정의하고 감지합니다.
- **B.** 비용 탐색기를 사용하여 제대로 태그가 지정되지 않은 리소스를 표시합니다. 해당 리소스에 수동으로 태그를 지정합니다.
- **C.** 적절한 태그 할당을 위해 모든 리소스를 확인하는 API 호출을 작성합니다. EC2 인스턴스에서 주기적으로 코드를 실행합니다.
- **D.** 적절한 태그 할당을 위해 모든 리소스를 확인하는 API 호출을 작성합니다. Amazon CloudWatch 를 통해 AWS Lambda 함수를 예약하여 코드를 주기적으로 실행합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q32

개발 팀은 다른 팀이 액세스할 웹사이트를 호스팅해야 합니다. 웹사이트 콘텐츠는 HTML, CSS, 클라이언트 측 JavaScript 및 이미지로 구성됩니다. 웹 사이트 호스팅에 가장 비용 효율적인 방법은 무엇입니까?

- **A.** 웹 사이트를 컨테이너화하고 AWS Fargate 에서 호스팅합니다.
- **B.** Amazon S3 버킷을 생성하고 거기에서 웹 사이트를 호스팅합니다.
- **C.** Amazon EC2 인스턴스에 웹 서버를 배포하여 웹 사이트를 호스팅합니다.
- **D.** Express.js 프레임워크를 사용하는 AWS Lambda 대상으로 Application Load Balancer 를 구성합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q33

회사는 AWS 에서 온라인 마켓플레이스 웹 애플리케이션을 실행합니다. 이 애플리케이션은 피크 시간에 수십만 명의 사용자에게 서비스를 제공합니다. 이 회사는 수백만 건의 금융 거래 세부 정보를 다른 여러 내부 애플리케이션과 공유할 수 있는 확장 가능한 거의 실시간 솔루션이 필요합니다. 또한 지연 시간이 짧은 검색을 위해 문서 데이터베이스에 저장하기 전에 민감한 데이터를 제거하기 위해 트랜잭션을 처리해야 합니다. 이러한 요구 사항을 충족하기 위해 솔루션 설계자는 무엇을 권장해야 합니까?

- **A.** 트랜잭션 데이터를 Amazon DynamoDB 에 저장합니다. 쓰기 시 모든 트랜잭션에서 민감한 데이터를 제거하도록 DynamoDB 에서 규칙을 설정합니다. DynamoDB 스트림을 사용하여 다른 애플리케이션과 트랜잭션 데이터를 공유합니다.
- **B.** 트랜잭션 데이터를 Amazon Kinesis Data Firehose 로 스트리밍하여 Amazon DynamoDB 및 Amazon S3 에 데이터를 저장합니다. Kinesis Data Firehose 와 AWS Lambda 통합을 사용하여 민감한 데이터를 제거하십시오. 다른 애플리케이션은 Amazon S3 에 저장된 데이터를 사용할 수 있습니다.
- **C.** 트랜잭션 데이터를 Amazon Kinesis Data Streams 로 스트리밍합니다. AWS Lambda 통합을 사용하여 모든 트랜잭션에서 민감한 데이터를 제거한 다음 Amazon DynamoDB 에 트랜잭션 데이터를 저장합니다. 다른 애플리케이션은 Kinesis 데이터 스트림의 트랜잭션 데이터를 사용할 수 있습니다.
- **D.** 일괄 처리된 트랜잭션 데이터를 Amazon S3 에 파일로 저장합니다. Amazon S3 에서 파일을 업데이트하기 전에 AWS Lambda 를 사용하여 모든 파일을 처리하고 민감한 데이터를 제거하십시오. 그러면 Lambda 함수가 Amazon DynamoDB 에 데이터를 저장합니다. 다른 애플리케이션은 Amazon S3 에 저장된 트랜잭션 파일을 사용할 수 있습니다.

> [!answer]- 정답 보기
> **정답: C**

### Q35

한 회사가 AWS 클라우드에서 공개 웹 애플리케이션 출시를 준비하고 있습니다. 아키텍처는 Elastic Load Balancer(ELB) 뒤의 VPC 내 Amazon EC2 인스턴스로 구성됩니다. DNS 에는 타사 서비스가 사용됩니다. 회사의 솔루션 설계자는 대규모 DDoS 공격을 감지하고 보호하기 위한 솔루션을 권장해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** 계정에서 Amazon GuardDuty 를 활성화합니다.
- **B.** EC2 인스턴스에서 Amazon Inspector 를 활성화합니다.
- **C.** AWS Shield 를 활성화하고 여기에 Amazon Route 53 을 할당합니다.
- **D.** AWS Shield Advanced 를 활성화하고 ELB 를 할당합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q38

회사는 Amazon S3 에서 정적 웹 사이트를 호스팅하고 DNS 에 Amazon Route 53 을 사용하고 있습니다. 웹 사이트는 전 세계적으로 수요가 증가하고 있습니다. 회사는 웹 사이트에 액세스하는 사용자의 대기 시간을 줄여야 합니다. 어떤 솔루션이 이러한 요구 사항을 가장 비용 효율적으로 충족합니까?

- **A.** 웹 사이트가 포함된 S3 버킷을 모든 AWS 리전에 복제합니다. Route 53 지리적 위치 라우팅 항목을 추가합니다.
- **B.** AWS Global Accelerator 에서 액셀러레이터를 프로비저닝합니다. 제공된 IP 주소를 S3 버킷과 연결합니다. 액셀러레이터의 IP 주소를 가리키도록 Route 53 항목을 편집합니다.
- **C.** S3 버킷 앞에 Amazon CloudFront 배포를 추가합니다. CloudFront 배포를 가리키도록 Route 53 항목을 편집합니다.
- **D.** 버킷에서 S3 Transfer Acceleration 을 활성화합니다. 새 엔드포인트를 가리키도록 Route 53 항목을 편집합니다.

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

### Q45

회사에는 다음으로 구성된 데이터 수집 워크플로가 있습니다. • 새로운 데이터 전송에 대한 알림을 위한 Amazon Simple Notification Service(Amazon SNS) 주제 • 데이터를 처리하고 메타데이터를 기록하는 AWS Lambda 함수  회사는 네트워크 연결 문제로 인해 수집 워크플로가 때때로 실패하는 것을 관찰했습니다. 이러한 장애가 발생하면 회사에서 수동으로 작업을 다시 실행하지 않는 한 Lambda 함수는 해당 데이터를 수집하지 않습니다. Lambda 함수가 향후 모든 데이터를 수집하도록 하려면 솔루션 설계자가 취해야 하는 작업 조합은 무엇입니까? (2 개를 선택하세요.)

- **A.** 여러 가용 영역에 Lambda 함수를 배포합니다.
- **B.** Amazon Simple Queue Service(Amazon SQS) 대기열을 생성하고 SNS 주제를 구독합니다.
- **C.** Lambda 함수에 할당된 CPU 와 메모리를 늘립니다.
- **D.** Lambda 함수에 대해 프로비저닝된 처리량을 늘립니다. E. Amazon Simple Queue Service(Amazon SQS) 대기열에서 읽도록 Lambda 함수를 수정합니다.

> [!answer]- 정답 보기
> **정답: B**
>
> , E

### Q46

회사에 매장에 마케팅 서비스를 제공하는 애플리케이션이 있습니다. 서비스는 매장 고객의 이전 구매를 기반으로 합니다. 상점은 SFTP 를 통해 거래 데이터를 회사에 업로드하고 데이터를 처리 및 분석하여 새로운 마케팅 제안을 생성합니다. 일부 파일의 크기는 200GB 를 초과할 수 있습니다. 최근에 회사는 일부 상점에서 포함되어서는 안 되는 개인 식별 정보(PII) 가 포함된 파일을 업로드했음을 발견했습니다. 회사는 PII 가 다시 공유될 경우 관리자에게 경고를 주기를 원합니다. 회사는 또한 문제 해결을 자동화하기를 원합니다. 최소한의 개발 노력으로 이러한 요구 사항을 충족하기 위해 솔루션 설계자는 무엇을 해야 합니까?

- **A.** Amazon S3 버킷을 보안 전송 지점으로 사용하십시오. Amazon Inspector 를 사용하여 버킷의 객체를 스캔합니다. 객체에 PII 가 포함된 경우 S3 수명 주기 정책을 트리거하여 PII 가 포함된 객체를 제거합니다.
- **B.** Amazon S3 버킷을 보안 전송 지점으로 사용합니다. Amazon Macie 를 사용하여 버킷의 객체를 스캔합니다. 객체에 PII 가 포함된 경우 Amazon Simple Notification Service(Amazon SNS) 를 사용하여 관리자에게 PII 가 포함된 객체를 제거하라는 알림을 트리거합니다.
- **C.** AWS Lambda 함수에서 사용자 지정 스캔 알고리즘을 구현합니다. 객체가 버킷에 로드될 때 함수를 트리거합니다. 객체에 PII 가 포함된 경우 Amazon Simple Notification Service(Amazon SNS) 를 사용하여 관리자에게 PII 가 포함된 객체를 제거하라는 알림을 트리거합니다.
- **D.** AWS Lambda 함수에서 사용자 지정 스캔 알고리즘을 구현합니다. 객체가 버킷에 로드될 때 함수를 트리거합니다. 객체에 PII 가 포함된 경우 Amazon Simple Email Service(Amazon SES) 를 사용하여 관리자에게 알림을 트리거하고 S3 수명 주기 정책을 트리거하여 PII 가 포함된 고기를 제거합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q48

회사 웹 사이트는 항목 카탈로그에 Amazon EC2 인스턴스 스토어를 사용합니다. 회사는 카탈로그의 가용성이 높고 카탈로그가 내구성 있는 위치에 저장되기를 원합니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** 카탈로그를 Redis 용 Amazon ElastiCache 로 이동합니다.
- **B.** 더 큰 인스턴스 스토어로 더 큰 EC2 인스턴스를 배포합니다.
- **C.** 인스턴스 스토어에서 Amazon S3 Glacier Deep Archive 로 카탈로그를 이동합니다.
- **D.** 카탈로그를 Amazon Elastic File System(Amazon EFS) 파일 시스템으로 이동합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q50

회사에 1,000 개의 Amazon EC2 Linux 인스턴스에서 실행되는 프로덕션 워크로드가 있습니다. 워크로드는 타사 소프트웨어에 의해 구동됩니다. 회사는 중요한 보안 취약성을 수정하기 위해 가능한 한 빨리 모든 EC2 인스턴스에서 타사 소프트웨어를 패치해야 합니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** AWS Lambda 함수를 생성하여 모든 EC2 인스턴스에 패치를 적용합니다.
- **B.** 모든 EC2 인스턴스에 패치를 적용하도록 AWS Systems Manager Patch Manager 를 구성합니다.
- **C.** AWS Systems Manager 유지 관리 기간을 예약하여 모든 EC2 인스턴스에 패치를 적용합니다.
- **D.** AWS Systems Manager Run Command 를 사용하여 모든 EC2 인스턴스에 패치를 적용하는 사용자 지정 명령을 실행합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q51

회사는 REST API 로 검색하기 위해 주문 배송 통계를 제공하는 애플리케이션을 개발 중입니다. 이 회사는 배송 통계를 추출하고 데이터를 읽기 쉬운 HTML 형식으로 구성하고 매일 아침 여러 이메일 주소로 보고서를 보내려고 합니다. 이러한 요구 사항을 충족하기 위해 솔루션 설계자는 어떤 단계 조합을 취해야 합니까? (2 개를 선택하세요.)

- **A.** 데이터를 Amazon Kinesis Data Firehose 로 보내도록 애플리케이션을 구성합니다.
- **B.** Amazon Simple Email Service(Amazon SES) 를 사용하여 데이터 형식을 지정하고 보고서를 이메일로 보냅니다.
- **C.** AWS Glue 작업을 호출하여 데이터에 대한 애플리케이션의 API 를 쿼리하는 Amazon EventBridge(Amazon CloudWatch Events) 예약 이벤트를 생성합니다.
- **D.** AWS Lambda 함수를 호출하여 데이터에 대한 애플리케이션의 API 를 쿼리하는 Amazon EventBridge(Amazon CloudWatch Events) 예약 이벤트를 생성합니다. E. Amazon S3 에 애플리케이션 데이터를 저장합니다. 보고서를 이메일로 보낼 S3 이벤트 대상으로 Amazon Simple Notification Service(Amazon SNS) 주제를 생성합니다.

> [!answer]- 정답 보기
> **정답: B, D**

### Q52

회사에서 온프레미스 애플리케이션을 AWS 로 마이그레이션하려고 합니다. 애플리케이션은 수십 기가바이트에서 수백 테라바이트까지 다양한 크기의 출력 파일을 생성합니다. 애플리케이션 데이터는 표준 파일 시스템 구조로 저장되어야 합니다. 회사는 자동으로 확장되는 솔루션을 원합니다. 고가용성이며 최소한의 운영 오버헤드가 필요합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** Amazon Elastic Container Service(Amazon ECS) 에서 컨테이너로 실행되도록 애플리케이션을 마이그레이션합니다. 스토리지에 Amazon S3 를 사용합니다.
- **B.** Amazon Elastic Kubernetes Service(Amazon EKS) 에서 컨테이너로 실행되도록 애플리케이션을 마이그레이션합니다. 스토리지에 Amazon Elastic Block Store(Amazon EBS) 를 사용합니다.
- **C.** 다중 AZ Auto Scaling 그룹의 Amazon EC2 인스턴스로 애플리케이션을 마이그레이션합니다. 스토리지에 Amazon Elastic File System(Amazon EFS) 을 사용합니다.
- **D.** 다중 AZ Auto Scaling 그룹의 Amazon EC2 인스턴스로 애플리케이션을 마이그레이션합니다. 스토리지에 Amazon Elastic Block Store(Amazon EBS) 를 사용합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q56

회사는 Amazon Route 53 에 도메인 이름을 등록했습니다. 이 회사는 ca - central - 1 리전의 Amazon API Gateway 를 백엔드 마이크로서비스 API 의 공용 인터페이스로 사용합니다. 타사 서비스는 API 를 안전하게 사용합니다. 회사는 타사 서비스에서 HTTPS 를 사용할 수 있도록 회사의 도메인 이름 및 해당 인증서로 API 게이트웨이 URL 을 설계하려고 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** API Gateway 에서 Name="Endpoint - URL" 및 Value="Company Domain Name" 으로 단계 변수를 생성하여 기본 URL 을 덮어씁니다. 회사의 도메인 이름과 연결된 공인 인증서를 AWS Certificate Manager(ACM) 로 가져옵니다.
- **B.** 회사의 도메인 이름으로 Route 53 DNS 레코드를 생성합니다. 별칭 레코드가 리전 API 게이트웨이 단계 엔드포인트를 가리키도록 합니다. 회사의 도메인 이름과 연결된 공인 인증서를 us - east - 1 리전의 AWS Certificate Manager(ACM) 로 가져옵니다.
- **C.** 리전 API 게이트웨이 엔드포인트를 생성합니다. API Gateway 엔드포인트를 회사의 도메인 이름과 연결합니다. 회사의 도메인 이름과 연결된 공인 인증서를 동일한 리전의 AWS Certificate Manager(ACM) 로 가져옵니다. API Gateway 엔드포인트에 인증서를 연결합니다. API Gateway 엔드포인트로 트래픽을 라우팅하도록 Route 53 을 구성합니다.
- **D.** 리전 API 게이트웨이 엔드포인트를 생성합니다. API Gateway 엔드포인트를 회사의 도메인 이름과 연결합니다. 회사의 도메인 이름과 연결된 공인 인증서를 us - east - 1 리전의 AWS Certificate Manager(ACM) 로 가져옵니다. API Gateway API 에 인증서를 연결합니다. 회사의 도메인 이름으로 Route 53 DNS 레코드를 생성합니다. A 레코드가 회사의 도메인 이름을 가리키도록 합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q57

한 회사에서 인기 있는 소셜 미디어 웹사이트를 운영하고 있습니다. 웹사이트는 사용자에게 이미지를 업로드하여 다른 사용자와 공유할 수 있는 기능을 제공합니다. 회사는 이미지에 부적절한 콘텐츠가 포함되지 않았는지 확인하고 싶습니다. 회사는 개발 노력을 최소화하는 솔루션이 필요합니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** Amazon Comprehend 를 사용하여 부적절한 콘텐츠를 감지합니다. 신뢰도가 낮은  예측에는 인적 검토를 사용합니다.
- **B.** Amazon Rekognition 을 사용하여 부적절한 콘텐츠를 감지합니다. 신뢰도가 낮은 예측에는 인적 검토를 사용합니다.
- **C.** Amazon SageMaker 를 사용하여 부적절한 콘텐츠를 감지합니다. 신뢰도가 낮은 예측에 레이블을 지정하려면 정답을 사용합니다.
- **D.** AWS Fargate 를 사용하여 사용자 지정 기계 학습 모델을 배포하여 부적절한 콘텐츠를 감지합니다. 신뢰도가 낮은 예측에 레이블을 지정하려면 정답을 사용합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q58

회사는 확장성 및 가용성에 대한 요구 사항을 충족하기 위해 컨테이너에서 중요한 응용 프로그램을 실행하려고 합니다. 회사는 중요한 응용 프로그램의 유지 관리에 집중하는 것을 선호합니다. 회사는 컨테이너화된 워크로드를 실행하는 기본 인프라의 프로비저닝 및 관리에 대한 책임을 원하지 않습니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** Amazon EC2 인스턴스를 사용하고 인스턴스에 Docker 를 설치합니다.
- **B.** Amazon EC2 작업자 노드에서 Amazon Elastic Container Service(Amazon ECS) 를 사용합니다.
- **C.** AWS Fargate 에서 Amazon Elastic Container Service(Amazon ECS) 를 사용합니다.
- **D.** Amazon Elastic Container Service(Amazon ECS) 에 최적화된 Amazon 머신 이미지(AMI) 의 Amazon EC2 인스턴스를 사용합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q59

회사는 300 개 이상의 글로벌 웹사이트 및 애플리케이션을 호스팅합니다. 이 회사는 매일 30TB 이상의 클릭스트림 데이터를 분석할 플랫폼이 필요합니다. 솔루션 설계자는 클릭스트림 데이터를 전송하고 처리하기 위해 무엇을 해야 합니까?

- **A.** AWS Data Pipeline 을 설계하여 데이터를 Amazon S3 버킷에 보관하고 데이터로 Amazon EMR 클러스터를 실행하여 분석을 생성합니다.
- **B.** Amazon EC2 인스턴스의 Auto Scaling 그룹을 생성하여 데이터를 처리하고 Amazon Redshift 가 분석에 사용할 수 있도록 Amazon S3 데이터 레이크로 보냅니다.
- **C.** 데이터를 Amazon CloudFront 에 캐시합니다. Amazon S3 버킷에 데이터를 저장합니다. 객체가 S3 버킷에 추가될 때. AWS Lambda 함수를 실행하여 분석용 데이터를 처리합니다.
- **D.** Amazon Kinesis Data Streams 에서 데이터를 수집합니다. Amazon Kinesis Data Firehose 를 사용하여 Amazon S3 데이터 레이크로 데이터를 전송합니다. 분석을 위해 Amazon Redshift 에 데이터를 로드합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q61

한 회사가 AWS 에서 2 계층 웹 애플리케이션을 개발하고 있습니다. 회사 개발자는 백엔드 Amazon RDS 데이터베이스에 직접 연결되는 Amazon EC2 인스턴스에 애플리케이션을 배포했습니다. 회사는 애플리케이션에 데이터베이스 자격 증명을 하드코딩해서는 안 됩니다. 또한 회사는 정기적으로 데이터베이스 자격 증명을 자동으로 교체하는 솔루션을 구현해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 인스턴스 메타데이터에 데이터베이스 자격 증명을 저장합니다. Amazon EventBridge(Amazon CloudWatch Events) 규칙을 사용하여 RDS 자격 증명과 인스턴스 메타데이터를 동시에 업데이트하는 예약된 AWS Lambda 함수를 실행합니다.
- **B.** 암호화된 Amazon S3 버킷의 구성 파일에 데이터베이스 자격 증명을 저장합니다. Amazon EventBridge(Amazon CloudWatch Events) 규칙을 사용하여 RDS 자격 증명과 구성 파일의 자격 증명을 동시에 업데이트하는 예약된 AWS Lambda 함수를 실행합니다. S3 버전 관리를 사용하여 이전 값으로 폴백하는 기능을 보장합니다.
- **C.** 데이터베이스 자격 증명을 AWS Secrets Manager 에 암호로 저장합니다. 보안 비밀에 대한 자동 순환을 켭니다. EC2 역할에 필요한 권한을 연결하여 보안 암호에 대한 액세스 권한을 부여합니다.
- **D.** 데이터베이스 자격 증명을 AWS Systems Manager Parameter Store 에 암호화된 파라미터로 저장합니다. 암호화된 매개변수에 대해 자동 회전을 켭니다. EC2 역할에 필요한 권한을 연결하여 암호화된 파라미터에 대한 액세스 권한을 부여합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q62

회사에서 AWS 에 새로운 공개 웹 애플리케이션을 배포하고 있습니다. 애플리케이션은 ALB(Application Load Balancer) 뒤에서 실행됩니다. 애플리케이션은 외부 CA( 인증 기관) 에서 발급한 SSL/TLS 인증서를 사용하여 에지에서 암호화해야 합니다. 인증서가 만료되기 전에 매년 인증서를 교체해야 합니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** AWS Certificate Manager(ACM) 를 사용하여 SSL/TLS 인증서를 발급합니다. 인증서를 ALB 에 적용합니다. 관리형 갱신 기능을 사용하여 인증서를 자동으로 교체합니다.
- **B.** AWS Certificate Manager(ACM) 를 사용하여 SSL/TLS 인증서를 발급합니다. 인증서에서 키 자료를 가져옵니다. AL 에 인증서 적용 관리되는 갱신 기능을 사용하여 인증서를 자동으로 교체합니다.
- **C.** AWS Certificate Manager(ACM) 사설 인증 기관을 사용하여 루트 CA 에서 SSL/TLS 인증서를 발급합니다. 인증서를 ALB 에 적용합니다. 관리형 갱신 기능을 사용하여 인증서를 자동으로 교체합니다.
- **D.** AWS Certificate Manager(ACM) 를 사용하여 SSL/TLS 인증서를 가져옵니다 . 인증서를 ALB 에 적용합니다 . Amazon EventBridge(Amazon CloudWatch Events) 를 사용하여 인증서가 만료될 때 알림을 보냅니다 . 인증서를 수동으로 교체합니다 .

> [!answer]- 정답 보기
> **정답: D**

### Q63

회사는 AWS 에서 인프라를 실행하고 문서 관리 애플리케이션에 대해 700,000 명의 등록 기반을 보유하고 있습니다. 회사는 큰 .pdf 파일을 .jpg 이미지 파일로 변환하는 제품을 만들려고 합니다. .pdf 파일의 크기는 평균 5MB 입니다. 회사는 원본 파일과 변환 파일을 보관해야 합니다. 솔루션 설계자는 시간이 지남에 따라 빠르게 증가할 수요를 수용할 수 있는 확장 가능한 솔루션을 설계해야 합니다. 어떤 솔루션이 이러한 요구 사항을 가장 비용 효율적으로 충족합니까?

- **A.** .pdf 파일을 Amazon S3 에 저장합니다. AWS Lambda 함수를 호출하여 파일을 .jpg 형식으로 변환하고 Amazon S3 에 다시 저장하도록 S3 PUT 이벤트를 구성합니다.
- **B.** .pdf 파일을 Amazon DynamoD 에 저장 DynamoDB 스트림 기능을 사용하여 AWS Lambda 함수를 호출하여 파일을 .jpg 형식으로 변환하고 DynamoDB 에 다시 저장합니다.
- **C.** Amazon EC2 인스턴스 , Amazon Elastic Block Store(Amazon EBS) 스토리지 및 Auto Scaling 그룹이 포함된 AWS Elastic Beanstalk 애플리케이션에 .pdf 파일을 업로드합니다 . EC2 인스턴스의 프로그램을 사용하여 파일을 .jpg 형식으로 변환합니다. .pdf 파일과 .jpg 파일을 EBS 스토어에 저장합니다.
- **D.** .pdf 파일을 Amazon EC2 인스턴스 , Amazon Elastic File System(Amazon EFS) 스토리지 및 Auto Scaling 그룹이 포함된 AWS Elastic Beanstalk 애플리케이션에 업로드합니다 . EC2 인스턴스의 프로그램을 사용하여 파일을 .jpg 형식으로 변환합니다. .pdf 파일과 .jpg 파일을 EBS 스토어에 저장합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q65

병원은 최근 Amazon API Gateway 및 AWS Lambda 와 함께 RESTful API 를 배포했습니다. 병원은 API Gateway 및 Lambda 를 사용하여 PDF 형식 및 JPEG 형식의 보고서를 업로드합니다. 병원은 보고서에서 보호되는 건강 정보(PHI) 를 식별하기 위해 Lambda 코드를 수정해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 기존 Python 라이브러리를 사용하여 보고서에서 텍스트를 추출하고 추출된 텍스트에서 PHI 를 식별합니다.
- **B.** Amazon Textract 를 사용하여 보고서에서 텍스트를 추출합니다. Amazon SageMaker 를 사용하여 추출된 텍스트에서 PHI 를 식별합니다.
- **C.** Amazon Textract 를 사용하여 보고서에서 텍스트를 추출합니다. Amazon Comprehend Medical 을 사용하여 추출된 텍스트에서 PHI 를 식별합니다.
- **D.** Amazon Rekognition 을 사용하여 보고서에서 텍스트를 추출합니다. Amazon  Comprehend Medical 을 사용하여 추출된 텍스트에서 PHI 를 식별합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q67

회사는 여러 Amazon EC2 인스턴스에서 애플리케이션을 호스팅합니다. 애플리케이션은 Amazon SQS 대기열의 메시지를 처리하고 Amazon RDS 테이블에 쓰고 대기열에서 메시지를 삭제합니다. RDS 테이블에서 가끔 중복 레코드가 발견됩니다. SQS 대기열에는 중복 메시지가 없습니다. 메시지가 한 번만 처리되도록 솔루션 설계자는 무엇을 해야 합니까?

- **A.** CreateQueue API 호출을 사용하여 새 대기열을 만듭니다.
- **B.** AddPermission API 호출을 사용하여 적절한 권한을 추가합니다.
- **C.** ReceiveMessage API 호출을 사용하여 적절한 대기 시간을 설정합니다.
- **D.** ChangeMessageVisibility API 호출을 사용하여 가시성 시간 초과를 늘립니다.

> [!answer]- 정답 보기
> **정답: D**

### Q69

회사는 Application Load Balancer 뒤의 Amazon EC2 인스턴스에서 비즈니스 크리티컬 웹 애플리케이션을 실행하고 있습니다. EC2 인스턴스는 Auto Scaling 그룹에 있습니다. 애플리케이션은 단일 가용 영역에 배포된 Amazon Aurora PostgreSQL 데이터베이스를 사용합니다. 회사는 다운타임과 데이터 손실을 최소화하면서 애플리케이션의 고가용성을 원합니다. 최소한의 운영 노력으로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** EC2 인스턴스를 다른 AWS 리전에 배치합니다. Amazon Route 53 상태 확인을 사용하여 트래픽을 리디렉션합니다. Aurora PostgreSQL 교차 리전 복제를 사용합니다.
- **B.** 여러 가용 영역을 사용하도록 Auto Scaling 그룹을 구성합니다. 데이터베이스를 다중 AZ 로 구성합니다. 데이터베이스에 대한 Amazon RDS 프록시 인스턴스를 구성합니다.
- **C.** 하나의 가용 영역을 사용하도록 Auto Scaling 그룹을 구성합니다. 데이터베이스의 시간별 스냅샷을 생성합니다. 장애가 발생한 경우 스냅샷에서 데이터베이스를 복구합니다.
- **D.** 여러 AWS 리전을 사용하도록 Auto Scaling 그룹을 구성합니다. 애플리케이션의 데이터를 Amazon S3 에 씁니다. S3 이벤트 알림을 사용하여 AWS Lambda 함수를 시작하여 데이터베이스에 데이터를 씁니다.

> [!answer]- 정답 보기
> **정답: B**

### Q72

회사는 동일한 AWS 리전에 있는 Amazon S3 버킷에서 사진을 자주 업로드 및 다운로드해야 하는 사진 처리 애플리케이션을 실행합니다. 솔루션 설계자는 데이터 전송 비용이 증가한다는 사실을 알게 되었고 이러한 비용을 줄이기 위한 솔루션을 구현해야 합니다. 솔루션 설계자는 이 요구 사항을 어떻게 충족할 수 있습니까?

- **A.** Amazon API Gateway 를 퍼블릭 서브넷에 배포하고 이를 통해 S3 호출을 라우팅하도록 라우팅 테이블을 조정합니다.
- **B.** NAT 게이트웨이를 퍼블릭 서브넷에 배포하고 S3 버킷에 대한 액세스를 허용하는 엔드포인트 정책을 연결합니다.
- **C.** 애플리케이션을 퍼블릭 서브넷에 배포하고 S3 버킷에 액세스하기 위해 인터넷 게이트웨이를 통해 라우팅하도록 허용합니다.
- **D.** S3 VPC 게이트웨이 엔드포인트를 VPC 에 배포하고 S3 버킷에 대한 액세스를 허용하는 엔드포인트 정책을 연결합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q75

한 회사에서 애플리케이션의 성능을 개선하기 위해 다계층 애플리케이션을 온프레미스에서 AWS 클라우드로 이동하려고 합니다. 애플리케이션은 RESTful 서비스를 통해 서로 통신하는 애플리케이션 계층으로 구성됩니다. 한 계층이 오버로드되면 트랜잭션이 삭제됩니다. 솔루션 설계자는 이러한 문제를 해결하고 애플리케이션을 현대화하는 솔루션을 설계해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족하고 운영상 가장 효율적입니까?

- **A.** Amazon API Gateway 를 사용하고 애플리케이션 계층으로 AWS Lambda 함수에 트랜잭션을 전달합니다. Amazon Simple Queue Service(Amazon SQS) 를 애플리케이션 서비스 간의 통신 계층으로 사용합니다.
- **B.** Amazon CloudWatch 지표를 사용하여 애플리케이션 성능 기록을 분석하여 성능 장애 동안 서버의 최대 사용률을 결정합니다. 최대 요구 사항을 충족하도록 애플리케이션 서버의 Amazon EC2 인스턴스 크기를 늘립니다.
- **C.** Amazon Simple Notification Service(Amazon SNS) 를 사용하여 Auto Scaling 그룹의 Amazon EC2 에서 실행되는 애플리케이션 서버 간의 메시징을 처리합니다 . Amazon CloudWatch 를 사용하여 SNS 대기열 길이를 모니터링하고 필요에 따라 확장 및 축소합니다.
- **D.** Amazon Simple Queue Service(Amazon SQS) 를 사용하여 Auto Scaling 그룹의 Amazon EC2 에서 실행되는 애플리케이션 서버 간의 메시징을 처리합니다 . Amazon CloudWatch 를 사용하여 SQS 대기열 길이를 모니터링하고 통신 오류가 감지되면 확장합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q77

회사는 애플리케이션에 대한 실시간 데이터 수집 아키텍처를 구성해야 합니다. 회사에는 데이터가 스트리밍될 때 데이터를 변환하는 프로세스인 API 와 데이터를 위한 스토리지 솔루션이 필요합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** Amazon EC2 인스턴스를 배포하여 Amazon Kinesis 데이터 스트림으로 데이터를 전송하는 API 를 호스팅합니다. Kinesis 데이터 스트림을 데이터 원본으로 사용하는 Amazon Kinesis Data Firehose 전송 스트림을 생성합니다. AWS Lambda 함수를 사용하여 데이터를 변환합니다. Kinesis Data Firehose 전송 스트림을 사용하여 데이터를 Amazon S3 로 보냅니다.
- **B.** Amazon EC2 인스턴스를 배포하여 AWS Glue 에 데이터를 전송하는 API 를 호스팅합니다. EC2 인스턴스에서 소스/ 대상 확인을 중지합니다. AWS Glue 를 사용하여 데이터를 변환하고 데이터를 Amazon S3 로 보냅니다.
- **C.** Amazon Kinesis 데이터 스트림으로 데이터를 보내도록 Amazon API Gateway API 를 구성합니다. Kinesis 데이터 스트림을 데이터 원본으로 사용하는 Amazon Kinesis Data Firehose 전송 스트림을 생성합니다. AWS Lambda 함수를 사용하여 데이터를 변환합니다. Kinesis Data Firehose 전송 스트림을 사용하여 데이터를 Amazon S3 로 보냅니다.
- **D.** 데이터를 AWS Glue 로 보내도록 Amazon API Gateway API 를 구성합니다. AWS Lambda 함수를 사용하여 데이터를 변환합니다. AWS Glue 를 사용하여 데이터를 Amazon S3 로 보냅니다.

> [!answer]- 정답 보기
> **정답: C**

### Q78

회사는 사용자 트랜잭션 데이터를 Amazon DynamoDB 테이블에 보관해야 합니다. 회사는 데이터를 7 년간 보관해야 합니다. 이러한 요구 사항을 충족하는 가장 운영 효율성이 높은 솔루션은 무엇입니까?

- **A.** DynamoDB 지정 시간 복구를 사용하여 테이블을 지속적으로 백업합니다.
- **B.** AWS Backup 을 사용하여 테이블에 대한 백업 일정 및 보존 정책을 생성합니다.
- **C.** DynamoDB 콘솔을 사용하여 테이블의 주문형 백업을 생성합니다. 백업을 Amazon S3 버킷에 저장합니다. S3 버킷에 대한 S3 수명 주기 구성을 설정합니다.
- **D.** AWS Lambda 함수를 호출하는 Amazon EventBridge(Amazon CloudWatch Events) 규칙을 생성합니다. 테이블을 백업하고 Amazon S3 버킷에 백업을 저장하도록 Lambda 함수를 구성합니다. S3 버킷에 대한 S3 수명 주기 구성을 설정합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q81

솔루션 설계자는 AWS 에 배포되는 새 애플리케이션을 위한 클라우드 아키텍처를 설계하고 있습니다. 처리할 작업 수에 따라 필요에 따라 애플리케이션 노드를 추가 및 제거하면서  프로세스가 병렬로 실행되어야 합니다. 프로세서 응용 프로그램은 상태 비저장입니다. 솔루션 설계자는 응용 프로그램이 느슨하게 연결되어 있고 작업 항목이 영구적으로 저장되어 있는지 확인해야 합니다. 솔루션 설계자는 어떤 디자인을 사용해야 합니까?

- **A.** 처리해야 하는 작업을 보낼 Amazon SNS 주제를 생성합니다. 프로세서 애플리케이션으로 구성된 Amazon 머신 이미지(AMI) 를 생성합니다. AMI 를 사용하는 시작 구성을 생성합니다. 시작 구성을 사용하여 Auto Scaling 그룹을 생성합니다. CPU 사용량에 따라 노드를 추가 및 제거하도록 Auto Scaling 그룹에 대한 조정 정책을 설정합니다.
- **B.** 처리해야 하는 작업을 보관할 Amazon SQS 대기열을 생성합니다. 프로세서 애플리케이션으로 구성된 Amazon 머신 이미지(AMI) 를 생성합니다. AMI 를 사용하는 시작 구성을 생성합니다. 시작 구성을 사용하여 Auto Scaling 그룹을 생성합니다. Auto Scaling 그룹의 조정 정책을 설정하여 네트워크 사용량에 따라 노드를 추가 및 제거합니다.
- **C.** 처리해야 하는 작업을 보관할 Amazon SQS 대기열을 생성합니다. 프로세서 애플리케이션으로 구성된 Amazon 머신 이미지(AMI) 를 생성합니다. AMI 를 사용하는 시작 템플릿을 생성합니다. 시작 템플릿을 사용하여 Auto Scaling 그룹을 생성합니다. SQS 대기열의 항목 수에 따라 노드를 추가 및 제거하도록 Auto Scaling 그룹에 대한 조정 정책을 설정합니다.
- **D.** 처리해야 하는 작업을 보낼 Amazon SNS 주제를 생성합니다. 프로세서 애플리케이션으로 구성된 Amazon 머신 이미지(AMI) 를 생성합니다. AMI 를 사용하는 시작 템플릿을 생성합니다. 시작 템플릿을 사용하여 Auto Scaling 그룹을 생성합니다. SNS 주제에 게시된 메시지 수에 따라 노드를 추가 및 제거하도록 Auto Scaling 그룹에 대한 조정 정책을 설정합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q82

회사는 AWS 클라우드에서 웹 애플리케이션을 호스팅합니다. 회사는 AWS Certificate Manager(ACM) 로 가져온 인증서를 사용하도록 Elastic Load Balancer 를 구성합니다. 각 인증서가 만료되기 30 일 전에 회사 보안팀에 알려야 합니다. 솔루션 설계자는 이 요구 사항을 충족하기 위해 무엇을 권장해야 합니까?

- **A.** ACM 에 규칙을 추가하여 인증서가 만료되기 30 일 전부터 매일 Amazon Simple Notification Service(Amazon SNS) 주제에 사용자 지정 메시지를 게시합니다.
- **B.** 30 일 이내에 만료되는 인증서를 확인하는 AWS Config 규칙을 생성합니다. AWS Config 가 비준수 리소스를 보고할 때 Amazon Simple Notification Service(Amazon SNS) 를 통해 사용자 지정 알림을 호출하도록 Amazon EventBridge(Amazon CloudWatch Events) 를 구성합니다.
- **C.** AWS Trusted Advisor 를 사용하여 30 일 이내에 만료되는 인증서를 확인합니다. 상태 변경 확인에 대한 Trusted Advisor 지표를 기반으로 하는 Amazon CloudWatch 경보를 생성합니다. Amazon Simple Notification Service(Amazon SNS) 를 통해 사용자 지정 알림을 보내도록 경보를 구성합니다.
- **D.** 30 일 이내에 만료되는 모든 인증서를 감지하는 Amazon EventBridge(Amazon CloudWatch Events) 규칙을 생성합니다. AWS Lambda 함수를 호출하도록 규칙을 구성합니다. Amazon Simple Notification Service(Amazon SNS) 를 통해 사용자 지정 알림을 보내도록 Lambda 함수를 구성합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q83

회사의 동적 웹 사이트는 미국의 온프레미스 서버를 사용하여 호스팅됩니다. 이 회사는 유럽에서 제품을 출시하고 있으며 새로운 유럽 사용자를 위해 사이트 로딩 시간을 최적화하려고 합니다. 사이트의 백엔드는 미국에 있어야 합니다. 제품이 며칠 안에 출시되며 즉각적인 솔루션이 필요합니다. 솔루션 설계자는 무엇을 권장해야 합니까?

- **A.** us - east - 1 에서 Amazon EC2 인스턴스를 시작하고 사이트를 마이그레이션합니다.
- **B.** 웹사이트를 Amazon S3 로 이동합니다. 지역 간 교차 지역 복제를 사용합니다.
- **C.** 온프레미스 서버를 가리키는 사용자 지정 오리진과 함께 Amazon CloudFront 를 사용합니다.
- **D.** 온프레미스 서버를 가리키는 Amazon Route 53 지리 근접 라우팅 정책을 사용합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q87

회사는 Amazon API Gateway API 에 의해 호출되는 AWS Lambda 함수에서 애플리케이션을 호스팅합니다. Lambda 함수는 고객 데이터를 Amazon Aurora MySQL 데이터베이스에 저장합니다. 회사에서 데이터베이스를 업그레이드할 때마다 Lambda 함수는 업그레이드가 완료될 때까지 데이터베이스 연결을 설정하지 못합니다. 그 결과 일부 이벤트에 대한 고객 데이터가 기록되지 않습니다. 솔루션 설계자는 데이터베이스 업그레이드 중에 생성되는 고객 데이터를 저장하는 솔루션을 설계해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** Lambda 함수와 데이터베이스 사이에 위치하도록 Amazon RDS 프록시를 프로비저닝합니다. RDS 프록시에 연결하도록 Lambda 함수를 구성합니다.
- **B.** Lambda 함수의 실행 시간을 최대로 늘립니다. 데이터베이스에 고객 데이터를 저장하는 코드에서 재시도 메커니즘을 만듭니다.
- **C.** 고객 데이터를 Lambda 로컬 스토리지에 유지합니다. 고객 데이터를 데이터베이스에 저장하기 위해 로컬 스토리지를 스캔하도록 새로운 Lambda 함수를 구성합니다.
- **D.** Amazon Simple Queue Service(Amazon SQS) FIFO 대기열에 고객 데이터를 저장합니다. 대기열을 폴링하고 고객 데이터를 데이터베이스에 저장하는 새 Lambda 함수를 생성합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q90

회사에서 SQL 데이터베이스를 사용하여 공개적으로 액세스할 수 있는 영화 데이터를 저장하고 있습니다. 데이터베이스는 Amazon RDS 단일 AZ DB 인스턴스에서 실행됩니다.  스크립트는 데이터베이스에 추가된 새로운 영화의 수를 기록하기 위해 매일 임의의 간격으로 쿼리를 실행합니다. 스크립트는 업무 시간 동안의 최종 합계를 보고해야 합니다. 회사의 개발 팀은 스크립트가 실행 중일 때 데이터베이스 성능이 개발 작업에 부적절하다는 것을 알아차렸습니다. 솔루션 설계자는 이 문제를 해결하기 위한 솔루션을 권장해야 합니다. 최소한의 운영 오버헤드로 이 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** DB 인스턴스를 다중 AZ 배포로 수정합니다.
- **B.** 데이터베이스의 읽기 전용 복제본을 생성합니다. 읽기 전용 복제본만 쿼리하도록 스크립트를 구성합니다.
- **C.** 개발 팀에게 매일 일과가 끝날 때 데이터베이스의 항목을 수동으로 내보내도록 지시합니다.
- **D.** Amazon ElastiCache 를 사용하여 스크립트가 데이터베이스에 대해 실행하는 일반적인 쿼리를 캐시합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q94

한 회사에서 사용자가 Amazon S3 에 작은 파일을 업로드하는 애플리케이션을 설계하고 있습니다. 사용자가 파일을 업로드한 후 데이터를 변환하고 나중에 분석할 수 있도록 데이터를 JSON 형식으로 저장하려면 파일에 일회성 단순 처리가 필요합니다. 각 파일은 업로드 후 최대한 빨리 처리해야 합니다. 수요는 다양할 것입니다. 어떤 날에는 사용자가 많은 수의 파일을 업로드합니다. 다른 날에는 사용자가 몇 개의 파일을 업로드하거나 파일을 업로드하지 않습니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** Amazon S3 에서 텍스트 파일을 읽도록 Amazon EMR 을 구성합니다. 처리 스크립트를 실행하여 데이터를 변환합니다. 결과 JSON 파일을 Amazon Aurora DB 클러스터에 저장합니다.
- **B.** Amazon SQS(Amazon Simple Queue Service) 대기열에 이벤트 알림을 보내도록 Amazon S3 를 구성합니다. Amazon EC2 인스턴스를 사용하여 대기열에서 읽고 데이터를 처리합니다. 결과 JSON 파일을 Amazon DynamoDB 에 저장합니다.
- **C.** 이벤트 알림을 Amazon Simple Queue Service(Amazon SQS) 대기열로 보내도록 Amazon S3 를 구성합니다. AWS Lambda 함수를 사용하여 대기열에서 읽고 데이터를 처리합니다. 결과 JSON 파일을 Amazon DynamoDB 에 저장합니다.
- **D.** 새 파일이 업로드될 때 Amazon Kinesis Data Streams 에 이벤트를 보내도록 Amazon EventBridge(Amazon CloudWatch Events) 를 구성합니다. AWS Lambda 함수를 사용하여 스트림에서 이벤트를 소비하고 데이터를 처리합니다. 결과 JSON 파일을 Amazon Aurora DB 클러스터에 저장합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q98

이미지 처리 회사에는 사용자가 이미지를 업로드하는 데 사용하는 웹 응용 프로그램이 있습니다. 애플리케이션은 이미지를 Amazon S3 버킷에 업로드합니다. 회사는 객체 생성 이벤트를 Amazon Simple Queue Service(Amazon SQS) 표준 대기열에 게시하도록 S3 이벤트 알림을 설정했습니다. SQS 대기열은 이미지를 처리하고 결과를 이메일을 통해 사용자에게 보내는 AWS Lambda 함수의 이벤트 소스 역할을 합니다. 사용자는 업로드된 모든 이미지에 대해 여러 이메일 메시지를 수신하고 있다고 보고합니다. 솔루션 설계자는 SQS 메시지가 Lambda 함수를 두 번 이상 호출하여 여러 이메일 메시지를 생성한다고 판단합니다. 솔루션 설계자는 이 문제를 최소한의 운영 오버헤드로 해결하기 위해 무엇을 해야 합니까?

- **A.** ReceiveMessage 대기 시간을 30 초로 늘려 SQS 대기열에서 긴 폴링을 설정합니다.
- **B.** SQS 표준 대기열을 SQS FIFO 대기열로 변경합니다. 메시지 중복 제거 ID 를 사용하여 중복 메시지를 버리십시오.
- **C.** SQS 대기열의 가시성 제한 시간을 함수 제한 시간과 일괄 처리 창 제한 시간의 합계보다 큰 값으로 늘립니다.
- **D.** 처리 전에 메시지를 읽은 직후 SQS 대기열에서 각 메시지를 삭제하도록 Lambda 함수를 수정합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q100

회사의 컨테이너화된 애플리케이션은 Amazon EC2 인스턴스에서 실행됩니다. 애플리케이션은 다른 비즈니스 애플리케이션과 통신하기 전에 보안 인증서를 다운로드해야 합니다. 회사는 거의 실시간으로 인증서를 암호화하고 해독할 수 있는 매우 안전한 솔루션을 원합니다. 또한 솔루션은 데이터가 암호화된 후 고가용성 스토리지에 데이터를 저장해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 암호화된 인증서에 대한 AWS Secrets Manager 암호를 생성합니다. 필요에 따라 인증서를 수동으로 업데이트합니다. 세분화된 IAM 액세스를 사용하여 데이터에 대한 액세스를 제어합니다.
- **B.** Python 암호화 라이브러리를 사용하여 암호화 작업을 수신하고 수행하는 AWS Lambda 함수를 생성합니다. 함수를 Amazon S3 버킷에 저장합니다.
- **C.** AWS Key Management Service(AWS KMS) 고객 관리형 키를 생성합니다. EC2 역할이 암호화 작업에 KMS 키를 사용하도록 허용합니다. 암호화된 데이터를 Amazon S3 에 저장합니다.
- **D.** AWS Key Management Service(AWS KMS) 고객 관리형 키를 생성합니다. EC2 역할이 암호화 작업에 KMS 키를 사용하도록 허용합니다. 암호화된 데이터를 Amazon Elastic Block Store(Amazon EBS) 볼륨에 저장합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q105

회사에서 새로운 서버리스 워크로드를 배포할 준비를 하고 있습니다. 솔루션 설계자는 최소 권한 원칙을 사용하여 AWS Lambda 함수를 실행하는 데 사용할 권한을 구성해야 합니다. Amazon EventBridge(Amazon CloudWatch Events) 규칙이 함수를 호출합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** lambda:InvokeFunction 을 작업으로, * 를 보안 주체로 사용하여 함수에 실행 역할을 추가합니다.
- **B.** 작업으로 lambda:InvokeFunction 을 사용하고 보안 주체로 Service: lambda.amazonaws.com 을 사용하여 함수에 실행 역할을 추가합니다.
- **C.** 작업으로 lambda:* 를 사용하고 보안 주체로 Service: events.amazonaws.com 을 사용하여 리소스 기반 정책을 함수에 추가합니다.
- **D.** lambda:InvokeFunction 을 작업으로, Service: events.amazonaws.com 을 보안 주체로 사용하여 리소스 기반 정책을 함수에 추가합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q107

자전거 공유 회사는 피크 운영 시간 동안 자전거의 위치를 추적하기 위해 다층 아키텍처를 개발하고 있습니다. 회사는 기존 분석 플랫폼에서 이러한 데이터 포인트를 사용하려고 합니다. 솔루션 설계자는 이 아키텍처를 지원하기 위해 가장 실행 가능한 다중 계층 옵션을 결정해야 합니다. 데이터 포인트는 REST API 에서 액세스할 수 있어야 합니다. 위치 데이터 저장 및 검색에 대한 이러한 요구 사항을 충족하는 작업은 무엇입니까?

- **A.** Amazon S3 와 함께 Amazon Athena 를 사용하십시오 .
- **B.** AWS Lambda 와 함께 Amazon API Gateway 를 사용합니다 .
- **C.** Amazon Redshift 와 함께 Amazon QuickSight 를 사용합니다 .
- **D.** Amazon Kinesis Data Analytics 와 함께 Amazon API Gateway 를 사용합니다 .

> [!answer]- 정답 보기
> **정답: B**

### Q108

한 회사에 Amazon RDS 의 데이터베이스에 목록을 저장하는 자동차 판매 웹사이트가 있습니다. 자동차가 판매되면 웹사이트에서 목록을 제거해야 하고 데이터를 여러 대상 시스템으로 보내야 합니다. 솔루션 아키텍트는 어떤 디자인을 추천해야 할까요?

- **A.** Amazon RDS 의 데이터베이스가 업데이트되어 대상이 소비할 Amazon Simple Queue Service(Amazon SQS) 대기열로 정보를 보내도록 업데이트될 때 트리거되는 AWS Lambda 함수를 생성합니다.
- **B.** Amazon RDS 의 데이터베이스가 대상이 사용할 Amazon Simple Queue Service(Amazon SQS) FIFO 대기열로 정보를 보내도록 업데이트될 때 트리거되는 AWS Lambda 함수를 생성합니다.
- **C.** RDS 이벤트 알림을 구독하고 여러 Amazon Simple Notification Service(Amazon SNS)  주제로 팬아웃된 Amazon Simple Queue Service(Amazon SQS) 대기열을 보냅니다 . AWS Lambda 함수를 사용하여 대상을 업데이트합니다.
- **D.** RDS 이벤트 알림을 구독하고 Amazon Simple Notification Service(Amazon SNS) 주제를 여러 Amazon Simple Queue Service(Amazon SQS) 대기열로 보냅니다 . AWS Lambda 함수를 사용하여 대상을 업데이트합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q110

소셜 미디어 회사는 사용자가 웹사이트에 이미지를 업로드할 수 있도록 합니다. 웹 사이트는 Amazon EC2 인스턴스에서 실행됩니다. 업로드 요청 중에 웹 사이트는 이미지의 크기를 표준 크기로 조정하고 크기가 조정된 이미지를 Amazon S3 에 저장합니다. 사용자가 웹 사이트에 대한 느린 업로드 요청을 경험하고 있습니다. 회사는 애플리케이션 내 커플링을 줄이고 웹사이트 성능을 개선해야 합니다. 솔루션 설계자는 이미지 업로드를 위한 운영상 가장 효율적인 프로세스를 설계해야 합니다. 이러한 요구 사항을 충족하기 위해 솔루션 설계자가 취해야 하는 조치의 조합은 무엇입니까? (2 개를 선택하세요.)

- **A.** S3 Glacier 에 이미지를 업로드하도록 애플리케이션을 구성합니다.
- **B.** 원본 이미지를 Amazon S3 에 업로드하도록 웹 서버를 구성합니다.
- **C.** 미리 서명된 URL 을 사용하여 각 사용자의 브라우저에서 Amazon S3 로 이미지를 직접 업로드하도록 애플리케이션 구성
- **D.** 이미지가 업로드될 때 AWS Lambda 함수를 호출하도록 S3 이벤트 알림을 구성합니다. 기능을 사용하여 이미지 크기를 조정합니다.  E. 업로드된 이미지의 크기를 조정하기 위해 일정에 따라 AWS Lambda 함수를 호출하는 Amazon EventBridge(Amazon CloudWatch Events) 규칙을 생성합니다.

> [!answer]- 정답 보기
> **정답: C, D**

### Q112

회사는 들어오는 요청을 처리하는 온프레미스 서버 집합에서 컨테이너화된 웹 애플리케이션을 호스팅합니다. 요청 수가 빠르게 증가하고 있습니다. 온프레미스 서버는 증가된 요청 수를 처리할 수 없습니다. 회사는 최소한의 코드 변경과 최소한의 개발 노력으로 애플리케이션을 AWS 로 옮기기를 원합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** Amazon Elastic Container Service(Amazon ECS) 에서 AWS Fargate 를 사용하여 Service Auto Scaling 으로 컨테이너화된 웹 애플리케이션을 실행합니다. Application Load Balancer 를 사용하여 수신 요청을 배포합니다.
- **B.** 두 개의 Amazon EC2 인스턴스를 사용하여 컨테이너화된 웹 애플리케이션을 호스팅합니다. Application Load Balancer 를 사용하여 수신 요청을 배포합니다.
- **C.** 지원되는 언어 중 하나를 사용하는 새 코드와 함께 AWS Lambda 를 사용합니다. 로드를 지원하기 위해 여러 Lambda 함수를 생성합니다. Amazon API Gateway 를 Lambda 함수에 대한 진입점으로 사용합니다.
- **D.** AWS ParallelCluster 와 같은 고성능 컴퓨팅(HPC) 솔루션을 사용하여 적절한 규모로 들어오는 요청을 처리할 수 있는 HPC 클러스터를 설정합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q114

한 회사는 사용자가 사진을 업로드하고 이미지에 액자를 추가할 수 있는 이미지 분석 응용 프로그램을 만들었습니다. 사용자는 이미지와 메타데이터를 업로드하여 이미지에 추가할 사진 프레임을 나타냅니다. 애플리케이션은 단일 Amazon EC2 인스턴스와 Amazon DynamoDB 를 사용하여 메타데이터를 저장합니다. 응용 프로그램이 대중화되고 사용자 수가 증가하고 있습니다. 회사는 동시 접속자 수가 시간과 요일에 따라 크게 달라질 것으로 예상하고 있습니다. 회사는 증가하는 사용자 기반의 요구 사항을 충족하도록 애플리케이션을 확장할 수 있는지 확인해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?

- **A.** AWS Lambda 를 사용하여 사진을 처리합니다. 사진과 메타데이터를 DynamoDB 에 저장합니다.
- **B.** Amazon Kinesis Data Firehose 를 사용하여 사진을 처리하고 사진과 메타데이터를 저장합니다.
- **C.** AWS Lambda 를 사용하여 사진을 처리합니다. Amazon S3 에 사진을 저장합니다. DynamoDB 를 유지하여 메타데이터를 저장합니다.
- **D.** EC2 인스턴스 수를 3 개로 늘립니다. 프로비저닝된 IOPS SSD(io2) Amazon Elastic Block Store(Amazon EBS) 볼륨을 사용하여 사진과 메타데이터를 저장합니다.

> [!answer]- 정답 보기
> **정답: C**

### Q116

회사는 회사 웹 사이트에 널리 사용되는 CMS( 콘텐츠 관리 시스템) 를 사용합니다. 그러나 필요한 패치 및 유지 관리가 부담됩니다. 회사는 웹사이트를 재설계하고 있으며 새로운 솔루션을 원합니다. 웹사이트는 1 년에 4 번 업데이트되며 사용 가능한 동적 콘텐츠가 필요하지 않습니다. 솔루션은 높은 확장성과 향상된 보안을 제공해야 합니다. 최소한의 운영 오버헤드로 이러한 요구 사항을 충족하는 변경 조합은 무엇입니까? (2 개를 선택하세요.)

- **A.** HTTPS 기능을 사용하도록 웹 사이트 앞에 Amazon CloudFront 를 구성합니다.
- **B.** 웹 사이트 앞에 AWS WAF 웹 ACL 을 배포하여 HTTPS 기능을 제공합니다.
- **C.** 웹 사이트 콘텐츠를 관리하고 제공하기 위해 AWS Lambda 함수를 생성 및 배포합니다.
- **D.** 새 웹 사이트와 Amazon S3 버킷을 생성합니다. 정적 웹 사이트 호스팅이 활성화된 S3 버킷에 웹 사이트를 배포합니다. E. 새 웹사이트를 만듭니다. Application Load Balancer 뒤에서 Amazon EC2 인스턴스의 Auto Scaling 그룹을 사용하여 웹 사이트를 배포합니다.

> [!answer]- 정답 보기
> **정답: A, D**

### Q117

회사는 Amazon CloudWatch Logs 로그 그룹에 애플리케이션 로그를 저장합니다. 새로운 정책에 따라 회사는 거의 실시간으로 Amazon OpenSearch Service(Amazon Elasticsearch Service) 에 모든 애플리케이션 로그를 저장해야 합니다. 최소한의 운영 오버헤드로 이 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 로그를 Amazon OpenSearch Service(Amazon Elasticsearch Service) 로 스트리밍하도록 CloudWatch Logs 구독을 구성합니다.
- **B.** AWS Lambda 함수를 생성합니다. 로그 그룹을 사용하여 함수를 호출하여 Amazon OpenSearch Service(Amazon Elasticsearch Service) 에 로그를 기록합니다.
- **C.** Amazon Kinesis Data Firehose 전송 스트림을 생성합니다. 전송 스트림 소스로 로그 그룹을 구성합니다. Amazon OpenSearch Service(Amazon Elasticsearch Service) 를 전송 스트림의 대상으로 구성합니다.
- **D.** 각 애플리케이션 서버에 Amazon Kinesis Agent 를 설치하고 구성하여 Amazon Kinesis Data Streams 에 로그를 전달합니다. Amazon OpenSearch Service(Amazon Elasticsearch Service) 에 로그를 전달하도록 Kinesis Data Streams 를 구성합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q119

글로벌 회사는 Amazon API Gateway 를 사용하여 us - east - 1 리전 및 ap - southeast - 2 리전의 로열티 클럽 사용자를 위한 REST API 를 설계하고 있습니다. 솔루션 설계자는 SQL 주입 및 교차 사이트 스크립팅 공격으로부터 여러 계정에서 이러한 API Gateway 관리 REST API 를 보호하는 솔루션을 설계해야 합니다. 최소한의 관리 노력으로 이러한 요구 사항을 충족하는 솔루션은 무엇입니까?

- **A.** 두 리전에 AWS WAF 를 설정합니다. 리전 웹 ACL 을 API 단계와 연결합니다.
- **B.** 두 리전에 AWS Firewall Manager 를 설정합니다. AWS WAF 규칙을 중앙에서 구성합니다.
- **C.** 목욕 리전에서 AWS Shield 를 설정합니다. 리전 웹 ACL 을 API 단계와 연결합니다.
- **D.** 한 리전에서 AWS Shield 를 설정합니다. 리전 웹 ACL 을 API 단계와 연결합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q120

한 회사는 us - west - 2 리전의 NLB(Network Load Balancer) 뒤에 있는 3 개의 Amazon EC2 인스턴스에 자체 관리형 DNS 솔루션을 구현했습니다. 회사 사용자의 대부분은 미국과 유럽에 있습니다. 회사는 솔루션의 성능과 가용성을 개선하기를 원합니다. 회사는 eu - west - 1 리전에서 3 개의 EC2 인스턴스를 시작 및 구성하고 EC2 인스턴스를 새 NLB 의 대상으로 추가합니다. 회사에서 트래픽을 모든 EC2 인스턴스로 라우팅하는 데 사용할 수 있는 솔루션은 무엇입니까?

- **A.** 두 NLB 중 하나로 요청을 라우팅하는 Amazon Route 53 지리적 위치 라우팅 정책을 생성합니다. Amazon CloudFront 배포를 생성합니다. Route 53 레코드를 배포의 오리진으로 사용합니다.
- **B.** AWS Global Accelerator 에서 표준 액셀러레이터를 생성합니다. us - west - 2 및 eu - west - 1 에서 엔드포인트 그룹을 생성합니다. 엔드포인트 그룹에 대한 엔드포인트로 두 개의 NLB 를 추가하십시오.
- **C.** 탄력적 IP 주소를 6 개의 EC2 인스턴스에 연결합니다. 6 개의 EC2 인스턴스 중 하나로 요청을 라우팅하는 Amazon Route 53 지리적 위치 라우팅 정책을 생성합니다. Amazon CloudFront 배포를 생성합니다. Route 53 레코드를 배포의 오리진으로 사용합니다.
- **D.** 2 개의 NLB 를 2 개의 ALB(Application Load Balancer) 로 교체합니다. 두 ALB 중 하나로 요청을 라우팅하는 Amazon Route 53 지연 시간 라우팅 정책을 생성합니다. Amazon CloudFront 배포를 생성합니다. Route 53 레코드를 배포의 오리진으로 사용합니다.

> [!answer]- 정답 보기
> **정답: B**

### Q123

회사에 두 개의 Amazon EC2 인스턴스에서 호스팅되는 동적 웹 애플리케이션이 있습니다. 회사에는 SSL 종료를 수행하기 위해 각 인스턴스에 있는 자체 SSL 인증서가 있습니다. 최근 트래픽이 증가하고 있으며 운영팀은 SSL 암호화 및 복호화로 인해 웹 서버의 컴퓨팅 용량이 최대 한도에 도달했다고 판단했습니다. 솔루션 설계자는 애플리케이션의 성능을 향상시키기 위해 무엇을 해야 합니까?

- **A.** AWS Certificate Manager(ACM) 를 사용하여 새 SSL 인증서를 생성합니다. 각 인스턴스에 ACM 인증서를 설치합니다.
- **B.** Amazon S3 버킷 생성 SSL 인증서를 S3 버킷으로 마이그레이션합니다. SSL 종료를 위해 버킷을 참조하도록 EC2 인스턴스를 구성합니다.
- **C.** 다른 EC2 인스턴스를 프록시 서버로 생성합니다. SSL 인증서를 새 인스턴스로 마이그레이션하고 기존 EC2 인스턴스에 직접 연결하도록 구성합니다.
- **D.** SSL 인증서를 AWS Certificate Manager(ACM) 로 가져옵니다. ACM 의 SSL 인증서를 사용하는 HTTPS 리스너로 Application Load Balancer 를 생성합니다.

> [!answer]- 정답 보기
> **정답: D**

### Q124

회사에 많은 Amazon EC2 인스턴스를 사용하여 완료하는 매우 동적인 배치 처리 작업이 있습니다. 작업은 본질적으로 상태 비저장이며 부정적인 영향 없이 주어진 시간에 시작 및 중지할 수 있으며 일반적으로 완료하는 데 총 60 분 이상이 걸립니다. 회사는 솔루션 설계자에게 작업 요구 사항을 충족하는 확장 가능하고 비용 효율적인 솔루션을 설계하도록 요청했습니다. 솔루션 설계자는 무엇을 권장해야 합니까?

- **A.** EC2 스팟 인스턴스를 구현합니다.
- **B.** EC2 예약 인스턴스 구매.
- **C.** EC2 온디맨드 인스턴스를 구현합니다.
- **D.** AWS Lambda 에서 처리를 구현합니다.

> [!answer]- 정답 보기
> **정답: A**

### Q128

회사에서 AWS 클라우드의 컨테이너에서 애플리케이션을 실행하려고 합니다. 이러한 애플리케이션은 상태 비저장이며 기본 인프라 내에서 중단을 허용할 수 있습니다. 회사는 비용과 운영 오버헤드를 최소화하는 솔루션이 필요합니다. 솔루션 설계자는 이러한 요구 사항을 충족하기 위해 무엇을 해야 합니까?

- **A.** Amazon EC2 Auto Scaling 그룹의 스팟 인스턴스를 사용하여 애플리케이션 컨테이너를 실행합니다.
- **B.** Amazon Elastic Kubernetes Service(Amazon EKS) 관리형 노드 그룹에서 스팟 인스턴스를 사용합니다.
- **C.** Amazon EC2 Auto Scaling 그룹의 온디맨드 인스턴스를 사용하여 애플리케이션 컨테이너를 실행합니다.
- **D.** Amazon Elastic Kubernetes Service(Amazon EKS) 관리형 노드 그룹에서 온디맨드 인스턴스를 사용합니다.

> [!answer]- 정답 보기
> **정답: B**
