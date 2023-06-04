#!/usr/bin/env python3
import os

import aws_cdk as cdk
from app_cdk.app_cdk_stack import AppCdkStack
from app_cdk.pipeline_cdk_stack import PipelineCdkStack
from app_cdk.ecr_cdk_stack import EcrCdkStack


app = cdk.App()

ecr_stack = EcrCdkStack(app, 'ecr-stack')

test_aboardbook_stack = AppCdkStack(
    app,
    'test-aboardbook-stack',
    ecr_repository=ecr_stack.ecr_data
)

PipelineCdkStack(
    app,
    "pipeline-stack-AboardBook",
    ecr_repository=ecr_stack.ecr_data
)

app.synth()
