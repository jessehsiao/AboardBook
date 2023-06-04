from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    Duration
)

from constructs import Construct

class AppCdkStack(Stack):

    @property
    def ecs_service_data(self):
        '''
        return list: [backend container, frontend container]
        '''
        return self.service
    
    def __init__(self, scope: Construct, construct_id: str, ecr_repository, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        vpc = ec2.Vpc(self, 'aboardbook-vpc')

        ecs_cluster = ecs.Cluster(self, f'{id}-ecs-cluster', vpc=vpc)

        backend_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self,
            'backend-service',
            cluster=ecs_cluster,
            memory_limit_mib=2048,
            desired_count=1,
            cpu=512,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_ecr_repository(ecr_repository, tag='aboardbook-backend-latest'),
                container_port=5000,
                container_name='aboardbook-backend'
            )
        )

        frontend_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self,
            'frontend-service',
            cluster=ecs_cluster,
            memory_limit_mib=2048,
            desired_count=1,
            cpu=512,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_ecr_repository(ecr_repository, tag='aboardbook-frontend-latest'),
                container_port=3000,
                container_name='aboardbook-frontend'
            )
        )

        backend_service.target_group.configure_health_check(
            healthy_threshold_count=2,
            unhealthy_threshold_count=2,
            timeout=Duration.seconds(10),
            interval=Duration.seconds(11)
        )

        frontend_service.target_group.configure_health_check(
            healthy_threshold_count=2,
            unhealthy_threshold_count=2,
            timeout=Duration.seconds(10),
            interval=Duration.seconds(11)
        )

        backend_service.target_group.set_attribute('deregistration_delay.timeout_seconds', '5')
        frontend_service.target_group.set_attribute('deregistration_delay.timeout_seconds', '5')


        service = [backend_service, frontend_service]

        self.service = service