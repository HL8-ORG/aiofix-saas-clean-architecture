#!/bin/bash

echo "开始修复剩余的通知域错误..."

# 1. 修复所有事件类的 data 属性访问
echo "修复事件类的 data 属性访问..."

# 修复 notification-failed.event.ts
sed -i 's/this\.data\./this._data./g' apps/api/src/notification/history/domain/events/notification-failed.event.ts
sed -i 's/getMetadata(): Record<string, any> {/getEventData(): Record<string, any> {/g' apps/api/src/notification/history/domain/events/notification-failed.event.ts
sed -i 's/return this._data.metadata || {};/return this._data.metadata || {};\n  }\n\n  protected serialize(): object {\n    return this._data;/g' apps/api/src/notification/history/domain/events/notification-failed.event.ts

# 修复 notification-sent.event.ts
sed -i 's/this\.data\./this._data./g' apps/api/src/notification/history/domain/events/notification-sent.event.ts
sed -i 's/getMetadata(): Record<string, any> {/getEventData(): Record<string, any> {/g' apps/api/src/notification/history/domain/events/notification-sent.event.ts
sed -i 's/return this._data.metadata || {};/return this._data.metadata || {};\n  }\n\n  protected serialize(): object {\n    return this._data;/g' apps/api/src/notification/history/domain/events/notification-sent.event.ts

# 修复 notification-read.event.ts
sed -i 's/this\.data\./this._data./g' apps/api/src/notification/history/domain/events/notification-read.event.ts

echo "事件类修复完成"

# 2. 修复值对象的导入路径
echo "修复值对象的导入路径..."

# 修复 sender-type 导入
find apps/api/src/notification -name "*.ts" -exec sed -i 's|../../sending/domain/value-objects/sender-type|../../sending/domain/value-objects/sender-type|g' {} \;

echo "值对象导入路径修复完成"

echo "批量修复完成！"
