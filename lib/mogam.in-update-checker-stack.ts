import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';

export class MogamInUpdateCheckerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const checkerFunction = new lambda.Function(this, 'checker', {
      code: lambda.Code.fromAsset("resources"),
      handler: "index.checker",
      runtime: lambda.Runtime.NODEJS_14_X
    });

    const checkerRule = new events.Rule(this, 'updateCheckerRule', {
      schedule: events.Schedule.cron({minute: "*/1"}) // TODO: 実行間隔伸ばす
    });
    checkerRule.addTarget(new eventsTargets.LambdaFunction(checkerFunction))
  }
}
