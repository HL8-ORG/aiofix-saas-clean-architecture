#!/bin/bash

# 修复通知域的错误
echo "开始修复通知域的错误..."

# 1. 修复事件类的导入路径
echo "修复事件类的导入路径..."

# 修复 notification-sent.event.ts
sed -i 's|import { DomainEvent } from '\''@/shared/domain/events/domain-event'\'';|import { DomainEvent } from '\''@/shared/domain/events/domain-event.base'\'';|g' apps/api/src/notification/history/domain/events/notification-sent.event.ts
sed -i 's|export class NotificationSentEvent extends DomainEvent<NotificationSentEventData>|export class NotificationSentEvent extends DomainEvent|g' apps/api/src/notification/history/domain/events/notification-sent.event.ts

# 修复 notification-failed.event.ts
sed -i 's|import { DomainEvent } from '\''@/shared/domain/events/domain-event'\'';|import { DomainEvent } from '\''@/shared/domain/events/domain-event.base'\'';|g' apps/api/src/notification/history/domain/events/notification-failed.event.ts
sed -i 's|export class NotificationFailedEvent extends DomainEvent<NotificationFailedEventData>|export class NotificationFailedEvent extends DomainEvent|g' apps/api/src/notification/history/domain/events/notification-failed.event.ts

# 修复 notification-read.event.ts
sed -i 's|import { BaseDomainEvent } from '\''@/shared/domain/events/base.event'\'';|import { DomainEvent } from '\''@/shared/domain/events/domain-event.base'\'';|g' apps/api/src/notification/history/domain/events/notification-read.event.ts
sed -i 's|export class NotificationReadEvent extends BaseDomainEvent|export class NotificationReadEvent extends DomainEvent|g' apps/api/src/notification/history/domain/events/notification-read.event.ts

echo "事件类导入路径修复完成"
