#!/bin/sh
set -e

MINIO_ENDPOINT="http://localhost:${MINIO_PORT_INTERNAL:-9000}"
ACCESS_KEY="${MINIO_ROOT_USER}"
SECRET_KEY="${MINIO_ROOT_PASSWORD}"
BUCKET_NAME="${MINIO_DEFAULT_BUCKETS}"
CONSOLE_ADDRESS=":${MINIO_CONSOLE_PORT:-9001}"
DATA_DIR="/data"

echo "Starting MinIO server in background..."
/usr/bin/minio server "$DATA_DIR" --console-address "$CONSOLE_ADDRESS" &
MINIO_PID=$!

echo "Waiting for MinIO server (PID: $MINIO_PID) to start on $MINIO_ENDPOINT..."
attempt_counter=0
max_attempts=30
until $(curl --output /dev/null --silent --head --fail "$MINIO_ENDPOINT/minio/health/live"); do
    if [ "${attempt_counter}" -ge "${max_attempts}" ]; then
        echo "Max attempts reached. MinIO server did not start."
        kill $MINIO_PID
        exit 1
    fi
    printf '.'
    attempt_counter=$((attempt_counter + 1))
    sleep 2
done
echo "MinIO server is up!"

echo "Configuring mc alias 'localminio' for $MINIO_ENDPOINT..."
mc alias set localminio "$MINIO_ENDPOINT" "$ACCESS_KEY" "$SECRET_KEY" --api S3v4

echo "Checking if bucket '$BUCKET_NAME' exists..."
if mc ls "localminio/${BUCKET_NAME}" >/dev/null 2>&1; then
    echo "Bucket '$BUCKET_NAME' already exists."
else
    echo "Bucket '$BUCKET_NAME' does not exist. Creating..."
    mc mb "localminio/${BUCKET_NAME}"
    echo "Bucket '$BUCKET_NAME' created."
fi

echo "Setting policy for bucket 'localminio/${BUCKET_NAME}' to 'download'..."
mc anonymous set download "localminio/${BUCKET_NAME}"
echo "MinIO setup complete."

wait $MINIO_PID
