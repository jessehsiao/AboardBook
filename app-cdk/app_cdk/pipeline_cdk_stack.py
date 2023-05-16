from constructs import Construct
import aws_cdk as cdk
from aws_cdk import (
    Stack, 
    aws_codebuild as codebuild,
    aws_codepipeline as codepipeline,
    aws_codepipeline_actions as codepipeline_actions,
)

class PipelineCdkStack(Stack):

    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create a new CodePipeline called CICD_Pipeline
        pipeline = codepipeline.Pipeline (
            self, "AboardBook_Backend_CICD_Pipeline",
            cross_account_keys = False
        )


        source_output = codepipeline.Artifact()
        unit_test_output = codepipeline.Artifact()

        # Pipeline code will go here
        source_action = codepipeline_actions.GitHubSourceAction(
            action_name="Github_Source",
            output=source_output,
            owner="jessehsiao",
            repo="AboardBook-Backend",
            oauth_token=cdk.SecretValue.secrets_manager("arn:aws:secretsmanager:ap-northeast-1:207600944624:secret:github-AboardBook-kOSO9c"),
            # oauthToken = cdk.SecretValue.plainText("my-github-token-AboardBook"), 
            branch="main"
        )

        codeQualityBuild = codebuild.PipelineProject(
            self, "Code Quality",
            build_spec=codebuild.BuildSpec.from_source_filename("./buildspec_test.yml"),
            environment=codebuild.BuildEnvironment(
                build_image=codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
                privileged=True,
                compute_type=codebuild.ComputeType.LARGE,
            ),
        )

        build_action = codepipeline_actions.CodeBuildAction(
            action_name="Unit-Test",
            project=codeQualityBuild,
            input=source_output,  # The build action must use the CodeCommitSourceAction output as input.
            outputs=[unit_test_output]
        )


        
        pipeline.add_stage(
            stage_name = "Source",
            actions = [source_action]
        )

        pipeline.add_stage(
            stage_name="Code-Quality-Testing",
            actions=[build_action]
        )   