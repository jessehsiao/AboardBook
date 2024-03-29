from constructs import Construct
import aws_cdk as cdk
from aws_cdk import (
    Stack, 
    aws_codebuild as codebuild,
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as codepipeline_actions,
    aws_iam as iam
)
import os

class PipelineCdkStack(Stack):

    def __init__(self, scope: Construct, id: str, ecr_repository, test_app_fargate, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create a new CodePipeline called CICD_Pipeline
        pipeline = codepipeline.Pipeline (
            self, "AboardBook_CICD_Pipeline",
            cross_account_keys = False
        )

        source_output = codepipeline.Artifact()
        unit_test_output = codepipeline.Artifact()
        docker_build_output_backend = codepipeline.Artifact()
        docker_build_output_frontend = codepipeline.Artifact()


        # Pipeline code will go here
        # Github source
        source_action = codepipeline_actions.GitHubSourceAction(
            action_name="Github_Source",
            output=source_output,
            owner="jessehsiao",
            repo="AboardBook",
            oauth_token=cdk.SecretValue.secrets_manager("arn:aws:secretsmanager:ap-northeast-1:273214402619:secret:github-AboardBook-Ysp7nz"),
            # oauthToken = cdk.SecretValue.plainText("my-github-token-AboardBook"), 
            branch="main"
        )

        codeQualityBuild = codebuild.PipelineProject(
            self, "Code Quality",
            build_spec=codebuild.BuildSpec.from_source_filename("./Backend/buildspec_test.yml"),
            environment=codebuild.BuildEnvironment(
                build_image=codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
                privileged=True,
                compute_type=codebuild.ComputeType.LARGE,
            ),
        )


        docker_build_project_backend = codebuild.PipelineProject(
            self, "Docker Build Backend",
            build_spec=codebuild.BuildSpec.from_source_filename("./buildspec_docker_backend.yml"),
            environment=codebuild.BuildEnvironment(
                build_image=codebuild.LinuxBuildImage.STANDARD_5_0,
                privileged=True,
                compute_type=codebuild.ComputeType.LARGE,
                environment_variables={
                    "IMAGE_TAG_BACKEND": codebuild.BuildEnvironmentVariable(
                        type=codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                        value='aboardbook-backend-latest'
                    ),
                    "IMAGE_REPO_URI": codebuild.BuildEnvironmentVariable(
                        type=codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                        value=ecr_repository.repository_uri
                    ),
                    "AWS_DEFAULT_REGION": codebuild.BuildEnvironmentVariable(
                        type=codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                        value=os.environ["CDK_DEFAULT_REGION"]
                    )
                }
            ),
        )

        docker_build_project_frontend = codebuild.PipelineProject(
            self, "Docker Build Frontend",
            build_spec=codebuild.BuildSpec.from_source_filename("./buildspec_docker_frontend.yml"),
            environment=codebuild.BuildEnvironment(
                build_image=codebuild.LinuxBuildImage.STANDARD_5_0,
                privileged=True,
                compute_type=codebuild.ComputeType.LARGE,
                environment_variables={
                    "IMAGE_TAG_FRONTEND": codebuild.BuildEnvironmentVariable(
                        type=codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                        value='aboardbook-frontend-latest'
                    ),
                    "IMAGE_REPO_URI": codebuild.BuildEnvironmentVariable(
                        type=codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                        value=ecr_repository.repository_uri
                    ),
                    "AWS_DEFAULT_REGION": codebuild.BuildEnvironmentVariable(
                        type=codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                        value=os.environ["CDK_DEFAULT_REGION"]
                    )
                }
            ),
        )

        docker_build_project_backend.add_to_role_policy(iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            actions=[
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:GetRepositoryPolicy",
                "ecr:DescribeRepositories",
                "ecr:ListImages",
                "ecr:DescribeImages",
                "ecr:BatchGetImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:PutImage"
            ],
            resources=['*'],
        ))

        docker_build_project_frontend.add_to_role_policy(iam.PolicyStatement(
            effect=iam.Effect.ALLOW,
            actions=[
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:GetRepositoryPolicy",
                "ecr:DescribeRepositories",
                "ecr:ListImages",
                "ecr:DescribeImages",
                "ecr:BatchGetImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:PutImage"
            ],
            resources=['*'],
        ))


        build_action = codepipeline_actions.CodeBuildAction(
            action_name="Unit-Test",
            project=codeQualityBuild,
            input=source_output,  # The build action must use the CodeCommitSourceAction output as input.
            outputs=[unit_test_output]
        )

        docker_build_action_backend = codepipeline_actions.CodeBuildAction(
            action_name="Docker-Build-Backend",
            project=docker_build_project_backend,
            input=source_output,
            outputs=[docker_build_output_backend],
            run_order = 1
        )

        docker_build_action_frontend = codepipeline_actions.CodeBuildAction(
            action_name="Docker-Build-Frontend",
            project=docker_build_project_frontend,
            input=source_output,
            outputs=[docker_build_output_frontend],
            run_order = 2
        )

        pipeline.add_stage(
            stage_name = "Source",
            actions = [source_action]
        )

        pipeline.add_stage(
            stage_name="Code-Quality-Testing",
            actions=[build_action]
        )   

        pipeline.add_stage(
            stage_name="Docker-Build",
            actions=[docker_build_action_backend, docker_build_action_frontend]
        )


        pipeline.add_stage(
          stage_name='Deploy-Test-ENV',
          actions=[
            codepipeline_actions.EcsDeployAction(
                action_name='Deploy-Test-Backend',
                service=test_app_fargate[0].service,
                input=docker_build_output_backend,
                run_order=1
            ), 
            codepipeline_actions.EcsDeployAction(
                action_name='Deploy-Test-Frontend',
                service=test_app_fargate[1].service,
                input=docker_build_output_frontend,
                run_order=2
            )
          ]
        )
        
        