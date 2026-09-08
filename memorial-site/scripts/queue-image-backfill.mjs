import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

const args = process.argv.slice(2);
const valueAfter = name => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : '';
};
const submissionId = valueAfter('--submission-id');
const all = args.includes('--all');
const execute = args.includes('--execute');
const confirmedAll = args.includes('--confirm-all');

if ((!submissionId && !all) || (submissionId && all)) {
  throw new Error('Use exactly one of --submission-id <uuid> or --all. Dry-run is the default.');
}
if (all && execute && !confirmedAll) {
  throw new Error('Full execution requires --all --execute --confirm-all. Review the dry-run first.');
}

const required = name => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};
const region = required('MEMORIAL_AWS_REGION');
const credentials = {
  accessKeyId: required('MEMORIAL_AWS_ACCESS_KEY_ID'),
  secretAccessKey: required('MEMORIAL_AWS_SECRET_ACCESS_KEY'),
};
const tableName = required('MEMORIAL_DYNAMODB_TABLE');
const queueUrl = required('MEMORIAL_IMAGE_QUEUE_URL');
const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region, credentials }));
const sqs = new SQSClient({ region, credentials });

const needsProcessing = item => item?.status === 'PUBLISHED' && (item.publishedFiles ?? []).some(file =>
  file.type?.startsWith('image/') && (!file.webKey || !file.thumbKey || file.processingStatus !== 'READY')
);

const candidates = [];
if (submissionId) {
  const response = await db.send(new GetCommand({ TableName: tableName, Key: { PK: `SUBMISSION#${submissionId}`, SK: 'META' } }));
  if (needsProcessing(response.Item)) candidates.push(response.Item);
} else {
  let exclusiveStartKey;
  do {
    const response = await db.send(new QueryCommand({
      TableName: tableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :status',
      ExpressionAttributeValues: { ':status': 'STATUS#PUBLISHED' },
      ExclusiveStartKey: exclusiveStartKey,
    }));
    candidates.push(...(response.Items ?? []).filter(needsProcessing));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);
}

console.log(`${execute ? 'EXECUTE' : 'DRY RUN'}: ${candidates.length} submission(s) need derivatives.`);
for (const item of candidates) {
  console.log(`- ${item.submissionId}`);
  if (execute) await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify({ submissionId: item.submissionId }) }));
}
