import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  CloudFormationClient,
  CreateStackCommand,
  DescribeStacksCommand,
  UpdateStackCommand,
  waitUntilStackCreateComplete,
  waitUntilStackUpdateComplete,
} from '@aws-sdk/client-cloudformation';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const region = process.env.MEMORIAL_AWS_REGION ?? 'ap-northeast-2';
const bucket = process.env.MEMORIAL_S3_BUCKET;
const accessKeyId = process.env.MEMORIAL_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.MEMORIAL_AWS_SECRET_ACCESS_KEY;
const stackName = process.env.MEMORIAL_IMAGE_STACK_NAME ?? 'father-memorial-image-pipeline';
const codeKey = process.env.MEMORIAL_IMAGE_CODE_KEY ?? 'infrastructure/image-processor.zip';

if (!bucket || !accessKeyId || !secretAccessKey) {
  throw new Error('MEMORIAL_S3_BUCKET and AWS deployment credentials are required.');
}

const credentials = { accessKeyId, secretAccessKey };
const cloudformation = new CloudFormationClient({ region, credentials });
const s3 = new S3Client({ region, credentials });

const projectRoot = resolve(import.meta.dirname, '..');
const templateBody = await readFile(resolve(projectRoot, 'infra/image-pipeline-stack.yaml'), 'utf8');
const packageBody = await readFile(resolve(projectRoot, 'infra/dist/image-processor.zip'));

async function describeStack() {
  try {
    const response = await cloudformation.send(new DescribeStacksCommand({ StackName: stackName }));
    return response.Stacks?.[0] ?? null;
  } catch (error) {
    if (error?.name === 'ValidationError' && String(error.message).includes('does not exist')) return null;
    throw error;
  }
}

const existing = await describeStack();
console.log(JSON.stringify({
  phase: 'preflight',
  stackName,
  existingStackStatus: existing?.StackStatus ?? null,
  region,
  bucket,
  codeKey,
}));

await s3.send(new PutObjectCommand({
  Bucket: bucket,
  Key: codeKey,
  Body: packageBody,
  ContentType: 'application/zip',
  ServerSideEncryption: 'AES256',
}));
console.log(JSON.stringify({ phase: 'package-uploaded', bytes: packageBody.length, codeKey }));

const stackInput = {
  StackName: stackName,
  TemplateBody: templateBody,
  Capabilities: ['CAPABILITY_NAMED_IAM'],
  Parameters: [
    { ParameterKey: 'ExistingBucketName', ParameterValue: bucket },
    { ParameterKey: 'ExistingTableName', ParameterValue: 'father-memorial-content' },
    { ParameterKey: 'ExistingNetlifyIamUser', ParameterValue: 'father-memorial-netlify-uploader' },
    { ParameterKey: 'ImageProcessorCodeKey', ParameterValue: codeKey },
  ],
  Tags: [
    { Key: 'Project', Value: 'father-memorial' },
    { Key: 'Component', Value: 'image-pipeline' },
  ],
};

if (!existing) {
  await cloudformation.send(new CreateStackCommand(stackInput));
  const waiter = await waitUntilStackCreateComplete(
    { client: cloudformation, maxWaitTime: 900, minDelay: 5, maxDelay: 15 },
    { StackName: stackName },
  );
  if (waiter.state !== 'SUCCESS') throw new Error(`Stack creation did not succeed: ${waiter.state}`);
} else {
  try {
    await cloudformation.send(new UpdateStackCommand(stackInput));
    const waiter = await waitUntilStackUpdateComplete(
      { client: cloudformation, maxWaitTime: 900, minDelay: 5, maxDelay: 15 },
      { StackName: stackName },
    );
    if (waiter.state !== 'SUCCESS') throw new Error(`Stack update did not succeed: ${waiter.state}`);
  } catch (error) {
    if (!String(error?.message).includes('No updates are to be performed')) throw error;
  }
}

const deployed = await describeStack();
const outputs = Object.fromEntries((deployed?.Outputs ?? []).map((entry) => [entry.OutputKey, entry.OutputValue]));
console.log(JSON.stringify({ phase: 'complete', stackStatus: deployed?.StackStatus, outputs }));
