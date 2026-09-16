import {
  Queue,
  QueueEvents,
  Worker,
  type JobsOptions,
  type Processor,
  type QueueOptions,
  type WorkerOptions,
} from "bullmq";
import type Redis from "ioredis";

export const INFRASTRUCTURE_QUEUE_NAME = "infrastructure";

export const defaultJobOptions = Object.freeze({
  attempts: 3,
  backoff: { delay: 1_000, type: "exponential" },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
} satisfies JobsOptions);

interface QueueFactoryOptions {
  connection: Redis;
  prefix: string;
  queueName: string;
}

interface WorkerFactoryOptions<
  DataType,
  ResultType,
  NameType extends string,
> extends QueueFactoryOptions {
  concurrency?: number;
  processor: Processor<DataType, ResultType, NameType>;
}

export function createQueue<DataType>(options: QueueFactoryOptions): Queue<DataType> {
  const queueOptions: QueueOptions = {
    connection: options.connection,
    defaultJobOptions,
    prefix: options.prefix,
  };
  return new Queue<DataType>(options.queueName, queueOptions);
}

export function createQueueEvents(options: QueueFactoryOptions): QueueEvents {
  return new QueueEvents(options.queueName, {
    connection: options.connection,
    prefix: options.prefix,
  });
}

export function createQueueWorker<DataType, ResultType, NameType extends string>(
  options: WorkerFactoryOptions<DataType, ResultType, NameType>,
): Worker<DataType, ResultType, NameType> {
  const workerOptions: WorkerOptions = {
    concurrency: options.concurrency ?? 1,
    connection: options.connection,
    prefix: options.prefix,
  };
  return new Worker<DataType, ResultType, NameType>(
    options.queueName,
    options.processor,
    workerOptions,
  );
}
