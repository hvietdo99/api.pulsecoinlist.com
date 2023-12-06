import { Request, Response, NextFunction } from 'express';
import * as httpContext from 'express-http-context';
import * as crypto from 'crypto';

/**
 * Middleware to initiate the correlation information of the request
 * If the header `x-correlation-id` is specified, means the request is come from
 * another internal service. We'll just set it into the context's correlationId.
 */
export function setCorrelationId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  httpContext.ns.bindEmitter(req);
  httpContext.ns.bindEmitter(res);
  const xCorrelationId = req.get('x-correlation-id');
  const correlationId = xCorrelationId || crypto.randomUUID();

  httpContext.set('correlationId', correlationId);
  httpContext.set('timestamp', Date.now());
  next();
}

/**
 * To retrieve the correlationId, firstly lookup at the http context
 * If the context is not set, try to generate a brand new one
 */
export function getCorrelationId(): string {
  let correlationId = httpContext.get('correlationId');
  if (!correlationId) {
    correlationId = crypto.randomUUID();
    httpContext.set('correlationId', correlationId);
  }
  return correlationId;
}
