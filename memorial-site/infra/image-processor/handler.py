from __future__ import annotations

import json
import logging
import os
from pathlib import PurePosixPath

import boto3

from image_utils import render_webp

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

BUCKET = os.environ["MEMORIAL_S3_BUCKET"]
TABLE_NAME = os.environ["MEMORIAL_DYNAMODB_TABLE"]

s3 = boto3.client("s3")
table = boto3.resource("dynamodb").Table(TABLE_NAME)


def _derived_key(prefix: str, submission_id: str, published_key: str) -> str:
    stem = PurePosixPath(published_key).stem
    return f"{prefix}/{submission_id}/{stem}.webp"


def _process_submission(submission_id: str) -> None:
    response = table.get_item(Key={"PK": f"SUBMISSION#{submission_id}", "SK": "META"})
    item = response.get("Item")
    if not item or item.get("status") != "PUBLISHED":
        LOGGER.warning("Skipping missing or non-public submission %s", submission_id)
        return

    files = item.get("publishedFiles") or []
    failures: list[str] = []
    changed = False

    for file in files:
        media_type = str(file.get("type") or "")
        published_key = str(file.get("publishedKey") or "")
        if not media_type.startswith("image/") or not published_key.startswith("published/"):
            continue
        if file.get("processingStatus") == "READY" and file.get("webKey") and file.get("thumbKey"):
            continue

        changed = True
        try:
            original = s3.get_object(Bucket=BUCKET, Key=published_key)["Body"].read()
            web_bytes, web_size = render_webp(original, 2560, 82)
            thumb_bytes, thumb_size = render_webp(original, 640, 72)
            web_key = _derived_key("web", submission_id, published_key)
            thumb_key = _derived_key("thumb", submission_id, published_key)

            common = {"Bucket": BUCKET, "ContentType": "image/webp", "CacheControl": "private, max-age=31536000"}
            s3.put_object(**common, Key=web_key, Body=web_bytes)
            s3.put_object(**common, Key=thumb_key, Body=thumb_bytes)
            file["webKey"] = web_key
            file["thumbKey"] = thumb_key
            file["processingStatus"] = "READY"
            LOGGER.info("Processed %s: web=%s thumb=%s", published_key, web_size, thumb_size)
        except Exception as error:  # noqa: BLE001 - each file must retain original fallback
            file.pop("webKey", None)
            file.pop("thumbKey", None)
            file["processingStatus"] = "FAILED"
            failures.append(published_key)
            LOGGER.exception("Failed to process %s", published_key)

    if changed:
        table.update_item(
            Key={"PK": f"SUBMISSION#{submission_id}", "SK": "META"},
            UpdateExpression="SET publishedFiles = :files",
            ConditionExpression="#status = :published",
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={":files": files, ":published": "PUBLISHED"},
        )

    if failures:
        raise RuntimeError(f"Image processing failed for {len(failures)} file(s); originals remain available")


def lambda_handler(event, _context):
    failures = []
    for record in event.get("Records", []):
        try:
            message = json.loads(record["body"])
            submission_id = str(message.get("submissionId") or "")
            if not submission_id:
                raise ValueError("submissionId is required")
            _process_submission(submission_id)
        except Exception:  # noqa: BLE001 - report individual SQS batch failures
            LOGGER.exception("Image processor record failed")
            failures.append({"itemIdentifier": record.get("messageId", "")})
    return {"batchItemFailures": failures}
