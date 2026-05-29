// @bun
// src/server/lib/postgres/repositories/users.ts
import bcrypt from "bcrypt";

// src/server/lib/postgres/models/common.ts
var USERS = "users";
var SESSIONS = "sessions";
var ITEMS = "items";
var INSTITUTIONS = "institutions";
var ACCOUNTS = "accounts";
var HOLDINGS = "holdings";
var SECURITIES = "securities";
var TRANSACTIONS = "transactions";
var INVESTMENT_TRANSACTIONS = "investment_transactions";
var SPLIT_TRANSACTIONS = "split_transactions";
var BUDGETS = "budgets";
var SECTIONS = "sections";
var CATEGORIES = "categories";
var SNAPSHOTS = "snapshots";
var CHARTS = "charts";
var API_KEYS = "api_keys";
var USER_ID = "user_id";
var UPDATED = "updated";
var IS_DELETED = "is_deleted";
var RAW = "raw";
var USERNAME = "username";
var PASSWORD = "password";
var EMAIL = "email";
var EXPIRY = "expiry";
var TOKEN = "token";
var SESSION_ID = "session_id";
var USER_USER_ID = "user_user_id";
var USER_USERNAME = "user_username";
var COOKIE_ORIGINAL_MAX_AGE = "cookie_original_max_age";
var COOKIE_MAX_AGE = "cookie_max_age";
var COOKIE_SIGNED = "cookie_signed";
var COOKIE_EXPIRES = "cookie_expires";
var COOKIE_HTTP_ONLY = "cookie_http_only";
var COOKIE_PATH = "cookie_path";
var COOKIE_DOMAIN = "cookie_domain";
var COOKIE_SECURE = "cookie_secure";
var COOKIE_SAME_SITE = "cookie_same_site";
var CREATED_AT = "created_at";
var ITEM_ID = "item_id";
var ACCESS_TOKEN = "access_token";
var INSTITUTION_ID = "institution_id";
var AVAILABLE_PRODUCTS = "available_products";
var CURSOR = "cursor";
var STATUS = "status";
var PROVIDER = "provider";
var LAST_SYNC_STATUS = "last_sync_status";
var LAST_SYNC_AT = "last_sync_at";
var LAST_SYNC_ERROR = "last_sync_error";
var NAME = "name";
var ACCOUNT_ID = "account_id";
var TYPE = "type";
var SUBTYPE = "subtype";
var BALANCES_AVAILABLE = "balances_available";
var BALANCES_CURRENT = "balances_current";
var BALANCES_LIMIT = "balances_limit";
var BALANCES_ISO_CURRENCY_CODE = "balances_iso_currency_code";
var CUSTOM_NAME = "custom_name";
var HIDE = "hide";
var LABEL_BUDGET_ID = "label_budget_id";
var GRAPH_OPTIONS_USE_SNAPSHOTS = "graph_options_use_snapshots";
var GRAPH_OPTIONS_USE_HOLDING_SNAPSHOTS = "graph_options_use_holding_snapshots";
var GRAPH_OPTIONS_USE_TRANSACTIONS = "graph_options_use_transactions";
var HOLDING_ID = "holding_id";
var SECURITY_ID = "security_id";
var INSTITUTION_PRICE = "institution_price";
var INSTITUTION_PRICE_AS_OF = "institution_price_as_of";
var INSTITUTION_VALUE = "institution_value";
var COST_BASIS = "cost_basis";
var QUANTITY = "quantity";
var ISO_CURRENCY_CODE = "iso_currency_code";
var TICKER_SYMBOL = "ticker_symbol";
var CLOSE_PRICE = "close_price";
var CLOSE_PRICE_AS_OF = "close_price_as_of";
var ISIN = "isin";
var CUSIP = "cusip";
var TRANSACTION_ID = "transaction_id";
var MERCHANT_NAME = "merchant_name";
var AMOUNT = "amount";
var DATE = "date";
var PENDING = "pending";
var PENDING_TRANSACTION_ID = "pending_transaction_id";
var PAYMENT_CHANNEL = "payment_channel";
var LOCATION_COUNTRY = "location_country";
var LOCATION_REGION = "location_region";
var LOCATION_CITY = "location_city";
var LABEL_CATEGORY_ID = "label_category_id";
var LABEL_MEMO = "label_memo";
var LABEL_CATEGORY_CONFIDENCE = "label_category_confidence";
var TRANSACTION_PAIRS = "transaction_pairs";
var PAIR_ID = "pair_id";
var TRANSACTION_ID_A = "transaction_id_a";
var TRANSACTION_ID_B = "transaction_id_b";
var INVESTMENT_TRANSACTION_ID = "investment_transaction_id";
var PRICE = "price";
var SPLIT_TRANSACTION_ID = "split_transaction_id";
var BUDGET_ID = "budget_id";
var SECTION_ID = "section_id";
var CATEGORY_ID = "category_id";
var ROLL_OVER = "roll_over";
var ROLL_OVER_START_DATE = "roll_over_start_date";
var CAPACITIES = "capacities";
var SNAPSHOT_ID = "snapshot_id";
var SNAPSHOT_DATE = "snapshot_date";
var SNAPSHOT_TYPE = "snapshot_type";
var HOLDING_ACCOUNT_ID = "holding_account_id";
var HOLDING_SECURITY_ID = "holding_security_id";
var CHART_ID = "chart_id";
var CONFIGURATION = "configuration";
var KEY_ID = "key_id";
var KEY_HASH = "key_hash";
var KEY_PREFIX = "key_prefix";
var SCOPES = "scopes";
var LAST_USED_AT = "last_used_at";
var REVOKED_AT = "revoked_at";
var EXPIRES_AT = "expires_at";
// src/server/lib/postgres/client.ts
import { Pool, types } from "pg";

// src/server/lib/logger.ts
var LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};
var LEVEL_COLORS = {
  debug: "\x1B[36m",
  info: "\x1B[32m",
  warn: "\x1B[33m",
  error: "\x1B[31m"
};
var RESET = "\x1B[0m";
function getLogLevel() {
  const env = process.env.LOG_LEVEL?.toLowerCase();
  if (env && env in LOG_LEVELS)
    return env;
  if (false)
    ;
  return "info";
}
function isProduction() {
  return false;
}
function shouldLog(level) {
  const currentLevel = getLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}
function formatError(error) {
  if (!error)
    return;
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  if (typeof error === "object") {
    try {
      return { message: JSON.stringify(error) };
    } catch {
      const parts = [];
      for (const [key, value] of Object.entries(error)) {
        if (value === null || ["string", "number", "boolean"].includes(typeof value)) {
          parts.push(`${key}=${String(value)}`);
        }
      }
      return { message: parts.length > 0 ? parts.join(" ") : Object.prototype.toString.call(error) };
    }
  }
  return { message: String(error) };
}
function formatJson(entry) {
  return JSON.stringify(entry);
}
function formatPretty(entry) {
  const color = LEVEL_COLORS[entry.level];
  const time = new Date(entry.timestamp).toLocaleTimeString();
  const levelStr = `${color}${entry.level.toUpperCase().padEnd(5)}${RESET}`;
  let output = `${time} ${levelStr} ${entry.message}`;
  if (entry.context && Object.keys(entry.context).length > 0) {
    output += ` ${JSON.stringify(entry.context)}`;
  }
  if (entry.error) {
    output += `
  ${LEVEL_COLORS.error}Error: ${entry.error.message}${RESET}`;
    if (entry.error.stack && process.env.LOG_LEVEL === "debug") {
      output += `
  ${entry.error.stack}`;
    }
  }
  return output;
}
function log(level, message, context, error) {
  if (!shouldLog(level))
    return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: context && Object.keys(context).length > 0 ? context : undefined,
    error: formatError(error)
  };
  const output = isProduction() ? formatJson(entry) : formatPretty(entry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}
var logger = {
  debug: (message, context) => log("debug", message, context),
  info: (message, context) => log("info", message, context),
  warn: (message, context, error) => log("warn", message, context, error),
  error: (message, context, error) => log("error", message, context, error)
};

// src/server/lib/postgres/client.ts
var {
  POSTGRES_HOST: host = "localhost",
  POSTGRES_PORT: port = "5432",
  POSTGRES_USER: user = "postgres",
  POSTGRES_PASSWORD: password,
  POSTGRES_DATABASE: database = "budget"
} = process.env;
var timestampToIso = (s) => {
  return s.replace(/(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}(?:\.\d+)?[+-]\d{2})(:\d{2})?$/, (_, d, t, m) => `${d}T${t}${m || ":00"}`);
};
var config = {
  host,
  port: parseInt(port, 10),
  user,
  password,
  database,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  types: {
    getTypeParser(id, format) {
      if (id === types.builtins.NUMERIC)
        return parseFloat;
      if (id === types.builtins.INT8)
        return parseFloat;
      if (id === types.builtins.DATE)
        return (s) => s;
      if (id === types.builtins.TIMESTAMPTZ)
        return timestampToIso;
      return types.getTypeParser(id, format);
    }
  }
};
var pool = new Pool(config);
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {}, reason);
});
process.on("uncaughtException", async (error) => {
  logger.error("Uncaught exception", {}, error);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
// src/common/utils/date.ts
var ONE_HOUR = 1000 * 60 * 60;
var TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;
var THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;
// src/common/utils/index.ts
var schedule = new Map;
// src/common/types.ts
var isNumber = (value) => {
  return typeof value === "number" && !isNaN(value);
};
var isDate = (value) => {
  return value instanceof Date && !isNaN(value.getTime());
};
var isString = (value) => {
  return typeof value === "string";
};
var isBoolean = (value) => {
  return typeof value === "boolean";
};
var isObject = (value) => {
  return typeof value === "object" && value !== null;
};
var isArray = (value) => {
  return Array.isArray(value);
};
var isUndefined = (value) => {
  return typeof value === "undefined";
};
var isNull = (value) => {
  return value === null;
};
var isStringArray = (v) => isArray(v) && v.every(isString);
var isNullableString = (v) => isNull(v) || isString(v);
var isNullableNumber = (v) => isNull(v) || isNumber(v);
var isNullableBoolean = (v) => isNull(v) || isBoolean(v);
var isNullableObject = (v) => isNull(v) || isObject(v);
var isNullableArray = (v) => isNull(v) || isArray(v);
// src/server/lib/postgres/database.ts
var SOFT_DELETE_CONDITION = "(is_deleted IS NULL OR is_deleted = FALSE)";
var IS_NOT_NULL = Symbol("IS_NOT_NULL");
function prepareParamValue(value) {
  if (isDate(value))
    return value.toISOString();
  return value;
}
function buildInsert(tableName, data, returning) {
  const columns = ["updated"];
  const placeholders = ["CURRENT_TIMESTAMP"];
  const values = [];
  let paramIndex = 1;
  for (const [key, value] of Object.entries(data)) {
    if (isUndefined(value))
      continue;
    columns.push(key);
    placeholders.push(`$${paramIndex}`);
    values.push(prepareParamValue(value));
    paramIndex++;
  }
  let sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`;
  if (returning && returning.length > 0) {
    sql += ` RETURNING ${returning.join(", ")}`;
  }
  return { sql, values };
}
function buildUpdate(tableName, primaryKey, primaryKeyValue, data, options = {}) {
  const setClauses = ["updated = CURRENT_TIMESTAMP"];
  const values = [];
  let paramIndex = 1;
  for (const [key, value] of Object.entries(data)) {
    if (key === "raw")
      continue;
    if (isUndefined(value))
      continue;
    setClauses.push(`${key} = $${paramIndex}`);
    values.push(prepareParamValue(value));
    paramIndex++;
  }
  if (setClauses.length === 1) {
    return null;
  }
  values.push(primaryKeyValue);
  const pkParam = paramIndex;
  paramIndex++;
  let sql = `UPDATE ${tableName} SET ${setClauses.join(", ")} WHERE ${primaryKey} = $${pkParam}`;
  if (options.additionalWhere) {
    const extras = Array.isArray(options.additionalWhere) ? options.additionalWhere : [options.additionalWhere];
    for (const { column, value } of extras) {
      if (value === IS_NOT_NULL) {
        sql += ` AND ${column} IS NOT NULL`;
      } else if (isNull(value)) {
        sql += ` AND ${column} IS NULL`;
      } else {
        values.push(value);
        sql += ` AND ${column} = $${paramIndex}`;
        paramIndex++;
      }
    }
  }
  if (options.returning && options.returning.length > 0) {
    sql += ` RETURNING ${options.returning.join(", ")}`;
  }
  return { sql, values };
}
function buildUpsert(tableName, primaryKey, data, options = {}) {
  const { updateColumns = [], returning = [primaryKey] } = options;
  const columns = ["updated"];
  const placeholders = ["CURRENT_TIMESTAMP"];
  const values = [];
  let paramIndex = 1;
  for (const [key, value] of Object.entries(data)) {
    if (isUndefined(value))
      continue;
    columns.push(key);
    placeholders.push(`$${paramIndex}`);
    values.push(prepareParamValue(value));
    paramIndex++;
  }
  let sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`;
  if (updateColumns.length > 0) {
    const updateClauses = updateColumns.filter((col) => col !== primaryKey).map((col) => `${col} = EXCLUDED.${col}`);
    updateClauses.push("updated = CURRENT_TIMESTAMP");
    sql += ` ON CONFLICT (${primaryKey}) DO UPDATE SET ${updateClauses.join(", ")}`;
  } else {
    sql += ` ON CONFLICT (${primaryKey}) DO NOTHING`;
  }
  if (returning.length > 0) {
    sql += ` RETURNING ${returning.join(", ")}`;
  }
  return { sql, values };
}
function buildSoftDelete(tableName, primaryKey, primaryKeyValue, additionalWhere) {
  const values = [primaryKeyValue];
  let sql = `UPDATE ${tableName} SET is_deleted = TRUE, updated = CURRENT_TIMESTAMP WHERE ${primaryKey} = $1`;
  if (additionalWhere) {
    values.push(additionalWhere.value);
    sql += ` AND ${additionalWhere.column} = $${values.length}`;
  }
  sql += ` RETURNING ${primaryKey}`;
  return { sql, values };
}
function buildSelectWithFilters(tableName, columns, options = {}) {
  const {
    user_id,
    primaryKey,
    filters = {},
    inFilters = {},
    dateRange,
    excludeDeleted = true,
    orderBy,
    limit,
    offset
  } = options;
  const conditions = [];
  const values = [];
  let paramIndex = 1;
  if (user_id) {
    conditions.push(`user_id = $${paramIndex++}`);
    values.push(user_id);
  }
  if (primaryKey) {
    conditions.push(`${primaryKey.column} = $${paramIndex++}`);
    values.push(primaryKey.value);
  }
  for (const [key, value] of Object.entries(filters)) {
    if (isUndefined(value))
      continue;
    if (value === IS_NOT_NULL) {
      conditions.push(`${key} IS NOT NULL`);
    } else if (isNull(value)) {
      conditions.push(`${key} IS NULL`);
    } else {
      conditions.push(`${key} = $${paramIndex++}`);
      values.push(prepareParamValue(value));
    }
  }
  for (const [column, valueArray] of Object.entries(inFilters)) {
    if (!valueArray || valueArray.length === 0)
      continue;
    const placeholders = valueArray.map((_, i) => `$${paramIndex + i}`).join(", ");
    conditions.push(`${column} IN (${placeholders})`);
    values.push(...valueArray);
    paramIndex += valueArray.length;
  }
  if (dateRange) {
    if (dateRange.start) {
      conditions.push(`${dateRange.column} >= $${paramIndex++}`);
      values.push(isDate(dateRange.start) ? dateRange.start.toISOString().split("T")[0] : dateRange.start);
    }
    if (dateRange.end) {
      conditions.push(`${dateRange.column} <= $${paramIndex++}`);
      values.push(isDate(dateRange.end) ? dateRange.end.toISOString().split("T")[0] : dateRange.end);
    }
  }
  if (excludeDeleted) {
    conditions.push(SOFT_DELETE_CONDITION);
  }
  const columnList = columns === "*" ? "*" : columns.join(", ");
  let sql = `SELECT ${columnList} FROM ${tableName}`;
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`;
  }
  if (limit !== undefined) {
    sql += ` LIMIT $${paramIndex++}`;
    values.push(limit);
  }
  if (offset !== undefined) {
    sql += ` OFFSET $${paramIndex}`;
    values.push(offset);
  }
  return { sql, values };
}

// src/server/lib/postgres/models/base.ts
class ModelValidationError extends Error {
  errors;
  constructor(modelName, errors) {
    super(`${modelName} validation failed:
${errors.join(`
`)}`);
    this.name = "ModelValidationError";
    this.errors = errors;
  }
}
function validateObject(input, checker, skip = []) {
  if (typeof input !== "object" || input === null) {
    return [`Input is not a valid object: ${String(input)}`];
  }
  const obj = input;
  const errors = [];
  for (const [key, check] of Object.entries(checker)) {
    if (skip.includes(key))
      continue;
    if (!check)
      continue;
    const value = obj[key];
    if (!check(value)) {
      errors.push(`${key}: ${JSON.stringify(value)} (${typeof value})`);
    }
  }
  return errors;
}

class Model {
  constructor(data, typeChecker) {
    const errors = validateObject(data, typeChecker);
    if (errors.length > 0)
      throw new ModelValidationError(this.constructor.name, errors);
    Object.keys(typeChecker).forEach((k) => {
      this[k] = data[k];
    });
  }
}

class Table {
  async query(filters = {}) {
    const { sql, values } = buildSelectWithFilters(this.name, "*", {
      filters,
      excludeDeleted: this.supportsSoftDelete
    });
    const result = await pool.query(sql, values);
    return result.rows.map((row) => new this.ModelClass(row));
  }
  async queryOne(filters) {
    const { sql, values } = buildSelectWithFilters(this.name, "*", {
      filters,
      limit: 1,
      excludeDeleted: this.supportsSoftDelete
    });
    const result = await pool.query(sql, values);
    return result.rows.length > 0 ? new this.ModelClass(result.rows[0]) : null;
  }
  async insert(data, returning) {
    const { sql, values } = buildInsert(this.name, data, returning ?? [this.primaryKey]);
    const result = await pool.query(sql, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  async update(primaryKeyValue, data, returning, userId, client, extraWhere) {
    const additionalWhere = [];
    if (userId !== undefined)
      additionalWhere.push({ column: "user_id", value: userId });
    if (extraWhere)
      additionalWhere.push(...extraWhere);
    const query = buildUpdate(this.name, this.primaryKey, primaryKeyValue, data, {
      returning: returning ?? [this.primaryKey],
      additionalWhere: additionalWhere.length > 0 ? additionalWhere : undefined
    });
    if (!query)
      return null;
    const executor = client ?? pool;
    const result = await executor.query(query.sql, query.values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  async upsert(data, updateColumns, client) {
    const { sql, values } = buildUpsert(this.name, this.primaryKey, data, {
      updateColumns: updateColumns ?? Object.keys(data).filter((k) => k !== this.primaryKey),
      returning: ["*"]
    });
    const executor = client ?? pool;
    const result = await executor.query(sql, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  async softDelete(primaryKeyValue, userId) {
    const { sql, values } = buildSoftDelete(this.name, this.primaryKey, primaryKeyValue, userId !== undefined ? { column: "user_id", value: userId } : undefined);
    const result = await pool.query(sql, values);
    return result.rowCount !== null && result.rowCount > 0;
  }
  async queryByIds(ids, additionalFilters = {}) {
    if (ids.length === 0)
      return [];
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
    let sql = `SELECT * FROM ${this.name} WHERE ${this.primaryKey} IN (${placeholders})`;
    if (this.supportsSoftDelete) {
      sql += ` AND (is_deleted IS NULL OR is_deleted = FALSE)`;
    }
    const values = [...ids];
    let paramIdx = ids.length + 1;
    for (const [key, value] of Object.entries(additionalFilters)) {
      if (value !== undefined) {
        sql += ` AND ${key} = $${paramIdx++}`;
        values.push(value);
      }
    }
    const result = await pool.query(sql, values);
    return result.rows.map((row) => new this.ModelClass(row));
  }
  async bulkSoftDelete(ids, additionalFilters = {}, client) {
    if (ids.length === 0)
      return 0;
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
    let sql = `UPDATE ${this.name} SET is_deleted = TRUE, updated = CURRENT_TIMESTAMP WHERE ${this.primaryKey} IN (${placeholders})`;
    const values = [...ids];
    let paramIdx = ids.length + 1;
    for (const [key, value] of Object.entries(additionalFilters)) {
      if (value !== undefined) {
        sql += ` AND ${key} = $${paramIdx++}`;
        values.push(value);
      }
    }
    sql += ` RETURNING ${this.primaryKey}`;
    const executor = client ?? pool;
    const result = await executor.query(sql, values);
    return result.rowCount ?? 0;
  }
  async bulkSoftDeleteByColumn(column, columnValue, userIdValue, client) {
    let sql = `UPDATE ${this.name} SET is_deleted = TRUE, updated = CURRENT_TIMESTAMP WHERE ${column} = $1`;
    const values = [columnValue];
    if (userIdValue !== undefined) {
      sql += ` AND user_id = $2`;
      values.push(userIdValue);
    }
    sql += ` RETURNING ${this.primaryKey}`;
    const executor = client ?? pool;
    const result = await executor.query(sql, values);
    return result.rowCount ?? 0;
  }
  async hardDelete(primaryKeyValue) {
    const sql = `DELETE FROM ${this.name} WHERE ${this.primaryKey} = $1 RETURNING ${this.primaryKey}`;
    const result = await pool.query(sql, [primaryKeyValue]);
    return result.rowCount !== null && result.rowCount > 0;
  }
  async bulkHardDelete(ids) {
    if (ids.length === 0)
      return 0;
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `DELETE FROM ${this.name} WHERE ${this.primaryKey} IN (${placeholders}) RETURNING ${this.primaryKey}`;
    const result = await pool.query(sql, ids);
    return result.rowCount ?? 0;
  }
  async hardDeleteByColumn(column, columnValue) {
    const sql = `DELETE FROM ${this.name} WHERE ${column} = $1 RETURNING ${this.primaryKey}`;
    const result = await pool.query(sql, [columnValue]);
    return result.rowCount ?? 0;
  }
  async deleteByCondition(column, operator, value) {
    const sql = `DELETE FROM ${this.name} WHERE ${column} ${operator} $1 RETURNING ${this.primaryKey}`;
    const result = await pool.query(sql, [value]);
    return result.rowCount ?? 0;
  }
}
function createTable(config2) {
  return new class extends Table {
    name = config2.name;
    primaryKey = config2.primaryKey;
    schema = config2.schema;
    constraints = config2.constraints ?? [];
    indexes = config2.indexes ?? [];
    ModelClass = config2.ModelClass;
    supportsSoftDelete = config2.supportsSoftDelete ?? true;
  };
}
// src/server/lib/postgres/models/user.ts
var userSchema = {
  [USER_ID]: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
  [USERNAME]: "VARCHAR(255) UNIQUE NOT NULL",
  [PASSWORD]: "VARCHAR(255)",
  [EMAIL]: "VARCHAR(255)",
  [EXPIRY]: "TIMESTAMPTZ",
  [TOKEN]: "VARCHAR(255)",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class UserModel extends Model {
  static typeChecker = {
    user_id: isString,
    username: isString,
    password: isNullableString,
    email: isNullableString,
    expiry: isNullableString,
    token: isNullableString,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, UserModel.typeChecker);
  }
  toJSON() {
    return { user_id: this.user_id, username: this.username };
  }
  toMaskedUser() {
    return this.toJSON();
  }
  toUser() {
    if (this.password === null)
      throw new Error("User has no password set");
    return { user_id: this.user_id, username: this.username, password: this.password };
  }
}
var usersTable = createTable({
  name: USERS,
  primaryKey: USER_ID,
  schema: userSchema,
  ModelClass: UserModel
});
var userColumns = Object.keys(usersTable.schema);
// src/server/lib/postgres/models/session.ts
var isValidSameSiteValue = (v) => {
  if (typeof v === "boolean")
    return true;
  if (v === "true")
    return true;
  if (v === "false")
    return true;
  if (v === "lax" || v === "strict" || v === "none")
    return true;
  if (v === null)
    return true;
  return false;
};
var sessionSchema = {
  [SESSION_ID]: "VARCHAR(255) PRIMARY KEY",
  [USER_USER_ID]: "UUID",
  [USER_USERNAME]: "VARCHAR(255)",
  [COOKIE_ORIGINAL_MAX_AGE]: "BIGINT",
  [COOKIE_MAX_AGE]: "BIGINT",
  [COOKIE_SIGNED]: "BOOLEAN",
  [COOKIE_EXPIRES]: "TIMESTAMPTZ",
  [COOKIE_HTTP_ONLY]: "BOOLEAN",
  [COOKIE_PATH]: "TEXT",
  [COOKIE_DOMAIN]: "TEXT",
  [COOKIE_SECURE]: "BOOLEAN",
  [COOKIE_SAME_SITE]: "VARCHAR(50)",
  [CREATED_AT]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"
};

class SessionModel extends Model {
  static typeChecker = {
    session_id: isString,
    user_user_id: isString,
    user_username: isString,
    cookie_original_max_age: isNullableNumber,
    cookie_max_age: isNullableNumber,
    cookie_signed: isNullableBoolean,
    cookie_expires: isNullableString,
    cookie_http_only: isNullableBoolean,
    cookie_path: isNullableString,
    cookie_domain: isNullableString,
    cookie_secure: isNullableBoolean,
    cookie_same_site: isValidSameSiteValue,
    created_at: isNullableString,
    updated: isNullableString
  };
  constructor(data) {
    super(data, SessionModel.typeChecker);
  }
  toJSON() {
    return {
      user: { user_id: this.user_user_id, username: this.user_username },
      cookie: {
        originalMaxAge: this.cookie_original_max_age,
        maxAge: this.cookie_max_age || undefined,
        signed: this.cookie_signed || undefined,
        expires: this.cookie_expires ? new Date(this.cookie_expires) : undefined,
        httpOnly: this.cookie_http_only || undefined,
        path: this.cookie_path || undefined,
        domain: this.cookie_domain || undefined,
        secure: this.cookie_secure || undefined,
        sameSite: this.cookie_same_site || undefined
      }
    };
  }
  static fromSessionData(sid, data) {
    return {
      session_id: sid,
      user_user_id: data.user.user_id,
      user_username: data.user.username,
      cookie_original_max_age: data.cookie.originalMaxAge?.toString() ?? null,
      cookie_max_age: data.cookie.maxAge?.toString() ?? null,
      cookie_signed: data.cookie.signed ?? null,
      cookie_expires: data.cookie.expires ?? null,
      cookie_http_only: data.cookie.httpOnly ?? null,
      cookie_path: data.cookie.path ?? null,
      cookie_domain: data.cookie.domain ?? null,
      cookie_secure: typeof data.cookie.secure === "boolean" ? data.cookie.secure : null,
      cookie_same_site: data.cookie.sameSite?.toString() ?? null
    };
  }
}
var sessionsTable = createTable({
  name: SESSIONS,
  primaryKey: SESSION_ID,
  schema: sessionSchema,
  ModelClass: SessionModel,
  supportsSoftDelete: false
});
var sessionColumns = Object.keys(sessionsTable.schema);
// src/server/lib/postgres/models/item.ts
var itemSchema = {
  [ITEM_ID]: "VARCHAR(255) PRIMARY KEY",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [ACCESS_TOKEN]: "VARCHAR(255)",
  [INSTITUTION_ID]: "VARCHAR(255)",
  [AVAILABLE_PRODUCTS]: "TEXT[]",
  [CURSOR]: "TEXT",
  [STATUS]: "VARCHAR(50)",
  [PROVIDER]: "VARCHAR(50)",
  [LAST_SYNC_STATUS]: "VARCHAR(20)",
  [LAST_SYNC_AT]: "TIMESTAMPTZ",
  [LAST_SYNC_ERROR]: "TEXT",
  [RAW]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class ItemModel extends Model {
  static typeChecker = {
    item_id: isString,
    user_id: isString,
    access_token: isNullableString,
    institution_id: isNullableString,
    available_products: isNullableArray,
    cursor: isNullableString,
    status: isNullableString,
    provider: isNullableString,
    last_sync_status: isNullableString,
    last_sync_at: isNullableString,
    last_sync_error: isNullableString,
    raw: isNullableObject,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, ItemModel.typeChecker);
  }
  toJSON() {
    return {
      item_id: this.item_id,
      access_token: this.access_token,
      institution_id: this.institution_id,
      available_products: this.available_products,
      cursor: this.cursor || undefined,
      status: this.status || undefined,
      provider: this.provider,
      updated: this.updated || undefined,
      last_sync_status: this.last_sync_status || undefined,
      last_sync_at: this.last_sync_at || undefined,
      last_sync_error: this.last_sync_error || undefined
    };
  }
  static fromJSON(item, user_id) {
    const r = { item_id: item.item_id, user_id };
    if (item.access_token !== undefined)
      r.access_token = item.access_token;
    if (item.institution_id !== undefined)
      r.institution_id = item.institution_id || null;
    if (item.available_products !== undefined)
      r.available_products = item.available_products;
    if (item.cursor !== undefined)
      r.cursor = item.cursor ?? null;
    if (item.status !== undefined)
      r.status = item.status ?? null;
    if (item.provider !== undefined)
      r.provider = item.provider;
    if (item.last_sync_status !== undefined)
      r.last_sync_status = item.last_sync_status ?? null;
    if (item.last_sync_at !== undefined)
      r.last_sync_at = item.last_sync_at ?? null;
    if (item.last_sync_error !== undefined)
      r.last_sync_error = item.last_sync_error ?? null;
    r.raw = item;
    return r;
  }
}
var itemsTable = createTable({
  name: ITEMS,
  primaryKey: ITEM_ID,
  schema: itemSchema,
  indexes: [{ column: USER_ID }, { column: INSTITUTION_ID }],
  ModelClass: ItemModel
});
var itemColumns = Object.keys(itemsTable.schema);
// src/server/lib/postgres/models/account.ts
var accountSchema = {
  [ACCOUNT_ID]: "VARCHAR(255) PRIMARY KEY",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [ITEM_ID]: "VARCHAR(255) NOT NULL",
  [INSTITUTION_ID]: "VARCHAR(255) NOT NULL",
  [NAME]: "VARCHAR(255)",
  [TYPE]: "VARCHAR(50)",
  [SUBTYPE]: "VARCHAR(100)",
  [BALANCES_AVAILABLE]: "DECIMAL(15, 2)",
  [BALANCES_CURRENT]: "DECIMAL(15, 2)",
  [BALANCES_LIMIT]: "DECIMAL(15, 2)",
  [BALANCES_ISO_CURRENCY_CODE]: "VARCHAR(10)",
  [CUSTOM_NAME]: "TEXT",
  [HIDE]: "BOOLEAN DEFAULT FALSE",
  [LABEL_BUDGET_ID]: "UUID",
  [GRAPH_OPTIONS_USE_SNAPSHOTS]: "BOOLEAN DEFAULT TRUE",
  [GRAPH_OPTIONS_USE_HOLDING_SNAPSHOTS]: "BOOLEAN DEFAULT TRUE",
  [GRAPH_OPTIONS_USE_TRANSACTIONS]: "BOOLEAN DEFAULT TRUE",
  [RAW]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class AccountModel extends Model {
  static typeChecker = {
    account_id: isString,
    user_id: isString,
    item_id: isString,
    institution_id: isString,
    name: isNullableString,
    type: isNullableString,
    subtype: isNullableString,
    balances_available: isNullableNumber,
    balances_current: isNullableNumber,
    balances_limit: isNullableNumber,
    balances_iso_currency_code: isNullableString,
    custom_name: isNullableString,
    hide: isNullableBoolean,
    label_budget_id: isNullableString,
    graph_options_use_snapshots: isNullableBoolean,
    graph_options_use_holding_snapshots: isNullableBoolean,
    graph_options_use_transactions: isNullableBoolean,
    raw: isNullableObject,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, AccountModel.typeChecker);
  }
  toJSON() {
    return {
      account_id: this.account_id,
      item_id: this.item_id,
      institution_id: this.institution_id,
      name: this.name,
      type: this.type,
      subtype: this.subtype,
      mask: null,
      official_name: null,
      balances: {
        available: this.balances_available,
        current: this.balances_current,
        limit: this.balances_limit,
        iso_currency_code: this.balances_iso_currency_code,
        unofficial_currency_code: null
      },
      custom_name: this.custom_name,
      hide: this.hide,
      label: { budget_id: this.label_budget_id },
      graphOptions: {
        useSnapshots: this.graph_options_use_snapshots,
        useHoldingSnapshots: this.graph_options_use_holding_snapshots ?? true,
        useTransactions: this.graph_options_use_transactions
      }
    };
  }
  static fromJSON(a, user_id) {
    const r = { user_id };
    if (!isUndefined(a.account_id))
      r.account_id = a.account_id;
    if (!isUndefined(a.item_id))
      r.item_id = a.item_id;
    if (!isUndefined(a.institution_id))
      r.institution_id = a.institution_id;
    if (!isUndefined(a.name))
      r.name = a.name;
    if (!isUndefined(a.type))
      r.type = a.type;
    if (!isUndefined(a.subtype))
      r.subtype = a.subtype;
    if (!isUndefined(a.custom_name))
      r.custom_name = a.custom_name;
    if (!isUndefined(a.hide))
      r.hide = a.hide;
    if (a.label && !isUndefined(a.label.budget_id))
      r.label_budget_id = a.label.budget_id;
    if (a.balances) {
      if (!isUndefined(a.balances.available))
        r.balances_available = a.balances.available;
      if (!isUndefined(a.balances.current))
        r.balances_current = a.balances.current;
      if (!isUndefined(a.balances.limit))
        r.balances_limit = a.balances.limit;
      if (!isUndefined(a.balances.iso_currency_code))
        r.balances_iso_currency_code = a.balances.iso_currency_code;
    }
    if (a.graphOptions) {
      if (!isUndefined(a.graphOptions.useSnapshots))
        r.graph_options_use_snapshots = a.graphOptions.useSnapshots;
      if (!isUndefined(a.graphOptions.useHoldingSnapshots))
        r.graph_options_use_holding_snapshots = a.graphOptions.useHoldingSnapshots;
      if (!isUndefined(a.graphOptions.useTransactions))
        r.graph_options_use_transactions = a.graphOptions.useTransactions;
    }
    const { custom_name: _custom_name, hide: _hide, label: _label, graphOptions: _graphOptions, ...providerData } = a;
    r.raw = providerData;
    return r;
  }
}
var accountsTable = createTable({
  name: ACCOUNTS,
  primaryKey: ACCOUNT_ID,
  schema: accountSchema,
  indexes: [{ column: USER_ID }, { column: ITEM_ID }, { column: INSTITUTION_ID }],
  ModelClass: AccountModel
});
var accountColumns = Object.keys(accountsTable.schema);
// src/server/lib/postgres/models/holding.ts
var holdingSchema = {
  [HOLDING_ID]: "VARCHAR(255) PRIMARY KEY",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [ACCOUNT_ID]: "VARCHAR(255) NOT NULL",
  [SECURITY_ID]: "VARCHAR(255) NOT NULL",
  [INSTITUTION_PRICE]: "DECIMAL(15, 6)",
  [INSTITUTION_PRICE_AS_OF]: "DATE",
  [INSTITUTION_VALUE]: "DECIMAL(15, 2)",
  [COST_BASIS]: "DECIMAL(15, 2)",
  [QUANTITY]: "DECIMAL(15, 6)",
  [ISO_CURRENCY_CODE]: "VARCHAR(10)",
  [RAW]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class HoldingModel extends Model {
  static typeChecker = {
    holding_id: isString,
    user_id: isString,
    account_id: isString,
    security_id: isString,
    institution_price: isNullableNumber,
    institution_price_as_of: isNullableString,
    institution_value: isNullableNumber,
    cost_basis: isNullableNumber,
    quantity: isNullableNumber,
    iso_currency_code: isNullableString,
    raw: isNullableObject,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, HoldingModel.typeChecker);
  }
  toJSON() {
    return {
      holding_id: this.holding_id,
      account_id: this.account_id,
      security_id: this.security_id,
      institution_price: this.institution_price,
      institution_price_as_of: this.institution_price_as_of,
      institution_value: this.institution_value,
      cost_basis: this.cost_basis,
      quantity: this.quantity,
      iso_currency_code: this.iso_currency_code,
      unofficial_currency_code: null
    };
  }
  static fromJSON(h, user_id) {
    const r = {
      user_id,
      holding_id: h.holding_id || `${h.account_id}-${h.security_id}`
    };
    if (!isUndefined(h.account_id))
      r.account_id = h.account_id;
    if (!isUndefined(h.security_id))
      r.security_id = h.security_id;
    if (!isUndefined(h.institution_price))
      r.institution_price = h.institution_price;
    if (!isUndefined(h.institution_price_as_of))
      r.institution_price_as_of = h.institution_price_as_of;
    if (!isUndefined(h.institution_value))
      r.institution_value = h.institution_value;
    if (!isUndefined(h.cost_basis))
      r.cost_basis = h.cost_basis;
    if (!isUndefined(h.quantity))
      r.quantity = h.quantity;
    if (!isUndefined(h.iso_currency_code))
      r.iso_currency_code = h.iso_currency_code;
    r.raw = h;
    return r;
  }
}
var holdingsTable = createTable({
  name: HOLDINGS,
  primaryKey: HOLDING_ID,
  schema: holdingSchema,
  indexes: [{ column: USER_ID }, { column: ACCOUNT_ID }, { column: SECURITY_ID }],
  ModelClass: HoldingModel
});
var holdingColumns = Object.keys(holdingsTable.schema);
// src/server/lib/postgres/models/institution.ts
var institutionSchema = {
  [INSTITUTION_ID]: "VARCHAR(255) PRIMARY KEY",
  [NAME]: "VARCHAR(255)",
  [RAW]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"
};

class InstitutionModel extends Model {
  static typeChecker = {
    institution_id: isString,
    name: isNullableString,
    raw: isNullableObject,
    updated: isNullableString
  };
  constructor(data) {
    super(data, InstitutionModel.typeChecker);
  }
  toJSON() {
    return {
      institution_id: this.institution_id,
      name: this.name,
      products: [],
      country_codes: [],
      url: null,
      primary_color: null,
      logo: null,
      routing_numbers: [],
      oauth: false,
      status: null
    };
  }
  static fromJSON(i) {
    const r = {};
    if (i.institution_id !== undefined)
      r.institution_id = i.institution_id;
    if (i.name !== undefined)
      r.name = i.name;
    r.raw = i;
    return r;
  }
}
var institutionsTable = createTable({
  name: INSTITUTIONS,
  primaryKey: INSTITUTION_ID,
  schema: institutionSchema,
  ModelClass: InstitutionModel,
  supportsSoftDelete: false
});
var institutionColumns = Object.keys(institutionsTable.schema);
// src/server/lib/postgres/models/security.ts
var securitySchema = {
  [SECURITY_ID]: "VARCHAR(255) PRIMARY KEY",
  [NAME]: "VARCHAR(255)",
  [TICKER_SYMBOL]: "VARCHAR(50)",
  [TYPE]: "VARCHAR(50)",
  [CLOSE_PRICE]: "DECIMAL(15, 6)",
  [CLOSE_PRICE_AS_OF]: "DATE",
  [ISO_CURRENCY_CODE]: "VARCHAR(10)",
  [ISIN]: "VARCHAR(50)",
  [CUSIP]: "VARCHAR(50)",
  [RAW]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"
};

class SecurityModel extends Model {
  static typeChecker = {
    security_id: isString,
    name: isNullableString,
    ticker_symbol: isNullableString,
    type: isNullableString,
    close_price: isNullableNumber,
    close_price_as_of: isNullableString,
    iso_currency_code: isNullableString,
    isin: isNullableString,
    cusip: isNullableString,
    raw: isNullableObject,
    updated: isNullableString
  };
  constructor(data) {
    super(data, SecurityModel.typeChecker);
  }
  toJSON() {
    return {
      security_id: this.security_id,
      name: this.name,
      ticker_symbol: this.ticker_symbol,
      type: this.type,
      close_price: this.close_price,
      close_price_as_of: this.close_price_as_of,
      iso_currency_code: this.iso_currency_code,
      isin: this.isin,
      cusip: this.cusip,
      sedol: null,
      institution_security_id: null,
      institution_id: null,
      proxy_security_id: null,
      is_cash_equivalent: null,
      unofficial_currency_code: null,
      market_identifier_code: null,
      sector: null,
      industry: null,
      option_contract: null,
      fixed_income: null
    };
  }
  static fromJSON(s) {
    const r = {};
    if (s.security_id !== undefined)
      r.security_id = s.security_id;
    if (s.name !== undefined)
      r.name = s.name;
    if (s.ticker_symbol !== undefined)
      r.ticker_symbol = s.ticker_symbol;
    if (s.type !== undefined)
      r.type = s.type;
    if (s.close_price !== undefined)
      r.close_price = s.close_price;
    if (s.close_price_as_of !== undefined)
      r.close_price_as_of = s.close_price_as_of;
    if (s.iso_currency_code !== undefined)
      r.iso_currency_code = s.iso_currency_code;
    if (s.isin !== undefined)
      r.isin = s.isin;
    if (s.cusip !== undefined)
      r.cusip = s.cusip;
    r.raw = s;
    return r;
  }
}
var securitiesTable = createTable({
  name: SECURITIES,
  primaryKey: SECURITY_ID,
  schema: securitySchema,
  ModelClass: SecurityModel,
  supportsSoftDelete: false
});
var securityColumns = Object.keys(securitiesTable.schema);
// src/server/lib/postgres/models/transaction.ts
var txSchema = {
  [TRANSACTION_ID]: "VARCHAR(255) PRIMARY KEY",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [ACCOUNT_ID]: "VARCHAR(255) NOT NULL",
  [NAME]: "TEXT",
  [MERCHANT_NAME]: "TEXT",
  [AMOUNT]: "DECIMAL(15, 2)",
  [ISO_CURRENCY_CODE]: "VARCHAR(10)",
  [DATE]: "DATE NOT NULL",
  [PENDING]: "BOOLEAN DEFAULT FALSE",
  [PENDING_TRANSACTION_ID]: "VARCHAR(255)",
  [PAYMENT_CHANNEL]: "TEXT",
  [LOCATION_COUNTRY]: "TEXT",
  [LOCATION_REGION]: "TEXT",
  [LOCATION_CITY]: "TEXT",
  [LABEL_BUDGET_ID]: "UUID",
  [LABEL_CATEGORY_ID]: "UUID",
  [LABEL_MEMO]: "TEXT",
  [LABEL_CATEGORY_CONFIDENCE]: "FLOAT",
  [RAW]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class TransactionModel extends Model {
  static typeChecker = {
    transaction_id: isString,
    user_id: isString,
    account_id: isString,
    name: isNullableString,
    merchant_name: isNullableString,
    amount: isNullableNumber,
    iso_currency_code: isNullableString,
    date: isString,
    pending: isNullableBoolean,
    pending_transaction_id: isNullableString,
    payment_channel: isNullableString,
    location_country: isNullableString,
    location_region: isNullableString,
    location_city: isNullableString,
    label_budget_id: isNullableString,
    label_category_id: isNullableString,
    label_memo: isNullableString,
    label_category_confidence: isNullableNumber,
    raw: isNullableObject,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, TransactionModel.typeChecker);
  }
  toJSON() {
    return {
      transaction_id: this.transaction_id,
      account_id: this.account_id,
      name: this.name,
      merchant_name: this.merchant_name,
      amount: this.amount,
      iso_currency_code: this.iso_currency_code,
      date: this.date,
      pending: this.pending,
      pending_transaction_id: this.pending_transaction_id,
      payment_channel: this.payment_channel,
      label: {
        budget_id: this.label_budget_id,
        category_id: this.label_category_id,
        memo: this.label_memo,
        category_confidence: this.label_category_confidence
      },
      location: {
        address: null,
        city: this.location_city,
        region: this.location_region,
        postal_code: null,
        country: this.location_country,
        store_number: null,
        lat: null,
        lon: null
      },
      payment_meta: {
        reference_number: null,
        ppd_id: null,
        payee: null,
        by_order_of: null,
        payer: null,
        payment_method: null,
        payment_processor: null,
        reason: null
      },
      category_id: null,
      category: null,
      account_owner: null,
      unofficial_currency_code: null,
      authorized_date: null,
      authorized_datetime: null,
      datetime: null,
      transaction_code: null
    };
  }
  static fromJSON(tx, user_id) {
    const r = { user_id };
    if (!isUndefined(tx.transaction_id))
      r.transaction_id = tx.transaction_id;
    if (!isUndefined(tx.account_id))
      r.account_id = tx.account_id;
    if (!isUndefined(tx.name))
      r.name = tx.name;
    if (!isUndefined(tx.merchant_name))
      r.merchant_name = tx.merchant_name;
    if (!isUndefined(tx.amount))
      r.amount = tx.amount;
    if (!isUndefined(tx.iso_currency_code))
      r.iso_currency_code = tx.iso_currency_code;
    if (!isUndefined(tx.authorized_date || tx.date))
      r.date = tx.authorized_date || tx.date;
    if (!isUndefined(tx.pending))
      r.pending = tx.pending;
    if (!isUndefined(tx.pending_transaction_id))
      r.pending_transaction_id = tx.pending_transaction_id;
    if (!isUndefined(tx.payment_channel))
      r.payment_channel = tx.payment_channel;
    if (tx.location) {
      if (!isUndefined(tx.location.country))
        r.location_country = tx.location.country;
      if (!isUndefined(tx.location.region))
        r.location_region = tx.location.region;
      if (!isUndefined(tx.location.city))
        r.location_city = tx.location.city;
    }
    if (tx.label) {
      if (!isUndefined(tx.label.budget_id))
        r.label_budget_id = tx.label.budget_id;
      if (!isUndefined(tx.label.category_id))
        r.label_category_id = tx.label.category_id;
      if (!isUndefined(tx.label.memo))
        r.label_memo = tx.label.memo;
      if (!isUndefined(tx.label.category_confidence))
        r.label_category_confidence = tx.label.category_confidence;
    }
    const { label: _label, ...providerData } = tx;
    r.raw = providerData;
    return r;
  }
}
var transactionsTable = createTable({
  name: TRANSACTIONS,
  primaryKey: TRANSACTION_ID,
  schema: txSchema,
  indexes: [{ column: USER_ID }, { column: ACCOUNT_ID }, { column: DATE }, { column: PENDING }],
  ModelClass: TransactionModel
});
var transactionColumns = Object.keys(transactionsTable.schema);
// src/server/lib/postgres/models/transaction_pair.ts
var transactionPairSchema = {
  [PAIR_ID]: "UUID PRIMARY KEY",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [TRANSACTION_ID_A]: `VARCHAR(255) NOT NULL REFERENCES ${TRANSACTIONS}(${TRANSACTION_ID}) ON DELETE CASCADE`,
  [TRANSACTION_ID_B]: `VARCHAR(255) NOT NULL REFERENCES ${TRANSACTIONS}(${TRANSACTION_ID}) ON DELETE CASCADE`,
  [STATUS]: "VARCHAR(20) NOT NULL",
  [CREATED_AT]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class TransactionPairModel extends Model {
  static typeChecker = {
    pair_id: isString,
    user_id: isString,
    transaction_id_a: isString,
    transaction_id_b: isString,
    status: isString,
    created_at: isNullableString,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, TransactionPairModel.typeChecker);
  }
  toJSON() {
    return {
      pair_id: this.pair_id,
      transaction_id_a: this.transaction_id_a,
      transaction_id_b: this.transaction_id_b,
      status: this.status,
      updated: this.updated
    };
  }
}
var transactionPairsTable = createTable({
  name: TRANSACTION_PAIRS,
  primaryKey: PAIR_ID,
  schema: transactionPairSchema,
  constraints: [
    `CONSTRAINT transaction_pairs_pair_unique UNIQUE (${TRANSACTION_ID_A}, ${TRANSACTION_ID_B})`
  ],
  indexes: [
    { column: USER_ID },
    { column: TRANSACTION_ID_A },
    { column: TRANSACTION_ID_B }
  ],
  ModelClass: TransactionPairModel
});
var transactionPairColumns = Object.keys(transactionPairsTable.schema);
// src/server/lib/postgres/models/investment_transaction.ts
var invTxSchema = {
  [INVESTMENT_TRANSACTION_ID]: "VARCHAR(255) PRIMARY KEY",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [ACCOUNT_ID]: "VARCHAR(255) NOT NULL",
  [SECURITY_ID]: "VARCHAR(255)",
  [DATE]: "DATE NOT NULL",
  [NAME]: "TEXT",
  [AMOUNT]: "DECIMAL(15, 2)",
  [QUANTITY]: "DECIMAL(15, 6)",
  [PRICE]: "DECIMAL(15, 6)",
  [ISO_CURRENCY_CODE]: "VARCHAR(10)",
  [TYPE]: "TEXT",
  [SUBTYPE]: "TEXT",
  [LABEL_BUDGET_ID]: "UUID",
  [LABEL_CATEGORY_ID]: "UUID",
  [LABEL_MEMO]: "TEXT",
  [RAW]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class InvTxModel extends Model {
  static typeChecker = {
    investment_transaction_id: isString,
    user_id: isString,
    account_id: isString,
    security_id: isNullableString,
    date: isString,
    name: isNullableString,
    amount: isNullableNumber,
    quantity: isNullableNumber,
    price: isNullableNumber,
    iso_currency_code: isNullableString,
    type: isNullableString,
    subtype: isNullableString,
    label_budget_id: isNullableString,
    label_category_id: isNullableString,
    label_memo: isNullableString,
    raw: isNullableObject,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, InvTxModel.typeChecker);
  }
  toJSON() {
    return {
      investment_transaction_id: this.investment_transaction_id,
      account_id: this.account_id,
      security_id: this.security_id,
      date: this.date,
      name: this.name,
      quantity: this.quantity,
      amount: this.amount,
      price: this.price,
      iso_currency_code: this.iso_currency_code,
      type: this.type,
      subtype: this.subtype,
      fees: null,
      unofficial_currency_code: null,
      label: {
        budget_id: this.label_budget_id,
        category_id: this.label_category_id,
        memo: this.label_memo
      }
    };
  }
  static fromJSON(tx, user_id) {
    const r = { user_id };
    if (tx.investment_transaction_id !== undefined)
      r.investment_transaction_id = tx.investment_transaction_id;
    if (tx.account_id !== undefined)
      r.account_id = tx.account_id;
    if (tx.security_id !== undefined)
      r.security_id = tx.security_id;
    if (tx.date !== undefined)
      r.date = tx.date;
    if (tx.name !== undefined)
      r.name = tx.name;
    if (tx.amount !== undefined)
      r.amount = tx.amount;
    if (tx.quantity !== undefined)
      r.quantity = tx.quantity;
    if (tx.price !== undefined)
      r.price = tx.price;
    if (tx.iso_currency_code !== undefined)
      r.iso_currency_code = tx.iso_currency_code;
    if (tx.type !== undefined)
      r.type = tx.type;
    if (tx.subtype !== undefined)
      r.subtype = tx.subtype;
    if (tx.label) {
      if (tx.label.budget_id !== undefined)
        r.label_budget_id = tx.label.budget_id;
      if (tx.label.category_id !== undefined)
        r.label_category_id = tx.label.category_id;
      if (tx.label.memo !== undefined)
        r.label_memo = tx.label.memo;
    }
    const { label: _label, ...providerData } = tx;
    r.raw = providerData;
    return r;
  }
}
var investmentTransactionsTable = createTable({
  name: INVESTMENT_TRANSACTIONS,
  primaryKey: INVESTMENT_TRANSACTION_ID,
  schema: invTxSchema,
  indexes: [{ column: USER_ID }, { column: ACCOUNT_ID }, { column: DATE }],
  ModelClass: InvTxModel
});
var investmentTransactionColumns = Object.keys(investmentTransactionsTable.schema);
// src/server/lib/postgres/models/split_transaction.ts
var splitTxSchema = {
  [SPLIT_TRANSACTION_ID]: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [TRANSACTION_ID]: "VARCHAR(255) NOT NULL",
  [ACCOUNT_ID]: "VARCHAR(255) NOT NULL",
  [AMOUNT]: "DECIMAL(15, 2) DEFAULT 0",
  [DATE]: "DATE NOT NULL",
  [CUSTOM_NAME]: "TEXT DEFAULT ''",
  [LABEL_BUDGET_ID]: "UUID",
  [LABEL_CATEGORY_ID]: "UUID",
  [LABEL_MEMO]: "TEXT",
  [LABEL_CATEGORY_CONFIDENCE]: "FLOAT",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class SplitTransactionModel extends Model {
  static typeChecker = {
    split_transaction_id: isString,
    user_id: isString,
    transaction_id: isString,
    account_id: isString,
    amount: isNullableNumber,
    date: isNullableString,
    custom_name: isNullableString,
    label_budget_id: isNullableString,
    label_category_id: isNullableString,
    label_memo: isNullableString,
    label_category_confidence: isNullableNumber,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, SplitTransactionModel.typeChecker);
  }
  toJSON() {
    return {
      split_transaction_id: this.split_transaction_id,
      transaction_id: this.transaction_id,
      account_id: this.account_id,
      amount: this.amount,
      date: this.date || undefined,
      custom_name: this.custom_name,
      label: {
        budget_id: this.label_budget_id,
        category_id: this.label_category_id,
        memo: this.label_memo,
        category_confidence: this.label_category_confidence
      }
    };
  }
  static fromJSON(tx, user_id) {
    const r = { user_id };
    if (tx.split_transaction_id !== undefined)
      r.split_transaction_id = tx.split_transaction_id;
    if (tx.transaction_id !== undefined)
      r.transaction_id = tx.transaction_id;
    if (tx.account_id !== undefined)
      r.account_id = tx.account_id;
    if (tx.amount !== undefined)
      r.amount = tx.amount;
    if (tx.date !== undefined)
      r.date = tx.date;
    if (tx.custom_name !== undefined)
      r.custom_name = tx.custom_name;
    if (tx.label) {
      if (tx.label.budget_id !== undefined)
        r.label_budget_id = tx.label.budget_id;
      if (tx.label.category_id !== undefined)
        r.label_category_id = tx.label.category_id;
      if (tx.label.memo !== undefined)
        r.label_memo = tx.label.memo;
      if (!isUndefined(tx.label.category_confidence))
        r.label_category_confidence = tx.label.category_confidence;
    }
    return r;
  }
}
var splitTransactionsTable = createTable({
  name: SPLIT_TRANSACTIONS,
  primaryKey: SPLIT_TRANSACTION_ID,
  schema: splitTxSchema,
  indexes: [{ column: USER_ID }, { column: TRANSACTION_ID }, { column: ACCOUNT_ID }],
  ModelClass: SplitTransactionModel
});
var splitTransactionColumns = Object.keys(splitTransactionsTable.schema);
// src/server/lib/postgres/models/budget.ts
var budgetSchema = {
  [BUDGET_ID]: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [NAME]: "VARCHAR(255) DEFAULT 'Unnamed'",
  [ISO_CURRENCY_CODE]: "VARCHAR(10) DEFAULT 'USD'",
  [ROLL_OVER]: "BOOLEAN DEFAULT FALSE",
  [ROLL_OVER_START_DATE]: "DATE",
  [CAPACITIES]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class BudgetModel extends Model {
  static typeChecker = {
    budget_id: isString,
    user_id: isString,
    name: isNullableString,
    iso_currency_code: isNullableString,
    roll_over: isNullableBoolean,
    roll_over_start_date: isNullableString,
    capacities: isNullableArray,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, BudgetModel.typeChecker);
  }
  toJSON() {
    return {
      budget_id: this.budget_id,
      name: this.name,
      iso_currency_code: this.iso_currency_code,
      roll_over: this.roll_over,
      roll_over_start_date: this.roll_over_start_date || undefined,
      capacities: this.capacities
    };
  }
  static fromJSON(b, user_id) {
    const r = { user_id };
    if (b.budget_id !== undefined)
      r.budget_id = b.budget_id;
    if (b.name !== undefined)
      r.name = b.name;
    if (b.iso_currency_code !== undefined)
      r.iso_currency_code = b.iso_currency_code;
    if (b.roll_over !== undefined)
      r.roll_over = b.roll_over;
    if (b.roll_over_start_date !== undefined)
      r.roll_over_start_date = b.roll_over_start_date;
    if (b.capacities !== undefined)
      r.capacities = JSON.stringify(b.capacities);
    return r;
  }
}
var budgetsTable = createTable({
  name: BUDGETS,
  primaryKey: BUDGET_ID,
  schema: budgetSchema,
  indexes: [{ column: USER_ID }],
  ModelClass: BudgetModel
});
var budgetColumns = Object.keys(budgetsTable.schema);
// src/server/lib/postgres/models/section.ts
var sectionSchema = {
  [SECTION_ID]: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [BUDGET_ID]: `UUID REFERENCES ${BUDGETS}(${BUDGET_ID}) ON DELETE RESTRICT NOT NULL`,
  [NAME]: "VARCHAR(255) DEFAULT 'Unnamed'",
  [ROLL_OVER]: "BOOLEAN DEFAULT FALSE",
  [ROLL_OVER_START_DATE]: "DATE",
  [CAPACITIES]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class SectionModel extends Model {
  static typeChecker = {
    section_id: isString,
    user_id: isString,
    budget_id: isString,
    name: isNullableString,
    roll_over: isNullableBoolean,
    roll_over_start_date: isNullableString,
    capacities: isNullableArray,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, SectionModel.typeChecker);
  }
  toJSON() {
    return {
      section_id: this.section_id,
      budget_id: this.budget_id,
      name: this.name,
      roll_over: this.roll_over,
      roll_over_start_date: this.roll_over_start_date || undefined,
      capacities: this.capacities
    };
  }
  static fromJSON(s, user_id) {
    const r = { user_id };
    if (s.section_id !== undefined)
      r.section_id = s.section_id;
    if (s.budget_id !== undefined)
      r.budget_id = s.budget_id;
    if (s.name !== undefined)
      r.name = s.name;
    if (s.roll_over !== undefined)
      r.roll_over = s.roll_over;
    if (s.roll_over_start_date !== undefined)
      r.roll_over_start_date = s.roll_over_start_date;
    if (s.capacities !== undefined)
      r.capacities = JSON.stringify(s.capacities);
    return r;
  }
}
var sectionsTable = createTable({
  name: SECTIONS,
  primaryKey: SECTION_ID,
  schema: sectionSchema,
  indexes: [{ column: USER_ID }, { column: BUDGET_ID }],
  ModelClass: SectionModel
});
var sectionColumns = Object.keys(sectionsTable.schema);
// src/server/lib/postgres/models/category.ts
var categorySchema = {
  [CATEGORY_ID]: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT NOT NULL`,
  [SECTION_ID]: `UUID REFERENCES ${SECTIONS}(${SECTION_ID}) ON DELETE RESTRICT NOT NULL`,
  [NAME]: "VARCHAR(255) DEFAULT 'Unnamed'",
  [ROLL_OVER]: "BOOLEAN DEFAULT FALSE",
  [ROLL_OVER_START_DATE]: "DATE",
  [CAPACITIES]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class CategoryModel extends Model {
  static typeChecker = {
    category_id: isString,
    user_id: isString,
    section_id: isString,
    name: isNullableString,
    roll_over: isNullableBoolean,
    roll_over_start_date: isNullableString,
    capacities: isNullableArray,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, CategoryModel.typeChecker);
  }
  toJSON() {
    return {
      category_id: this.category_id,
      section_id: this.section_id,
      name: this.name,
      roll_over: this.roll_over,
      roll_over_start_date: this.roll_over_start_date || undefined,
      capacities: this.capacities
    };
  }
  static fromJSON(c, user_id) {
    const r = { user_id };
    if (c.category_id !== undefined)
      r.category_id = c.category_id;
    if (c.section_id !== undefined)
      r.section_id = c.section_id;
    if (c.name !== undefined)
      r.name = c.name;
    if (c.roll_over !== undefined)
      r.roll_over = c.roll_over;
    if (c.roll_over_start_date !== undefined)
      r.roll_over_start_date = c.roll_over_start_date;
    if (c.capacities !== undefined)
      r.capacities = JSON.stringify(c.capacities);
    return r;
  }
}
var categoriesTable = createTable({
  name: CATEGORIES,
  primaryKey: CATEGORY_ID,
  schema: categorySchema,
  indexes: [{ column: USER_ID }, { column: SECTION_ID }],
  ModelClass: CategoryModel
});
var categoryColumns = Object.keys(categoriesTable.schema);
// src/server/lib/postgres/models/snapshot.ts
var snapshotSchema = {
  [SNAPSHOT_ID]: "VARCHAR(255) PRIMARY KEY",
  [USER_ID]: "UUID",
  [SNAPSHOT_DATE]: "TIMESTAMPTZ NOT NULL",
  [SNAPSHOT_TYPE]: "VARCHAR(50) NOT NULL",
  [ACCOUNT_ID]: "VARCHAR(255)",
  [BALANCES_AVAILABLE]: "DECIMAL(15, 2)",
  [BALANCES_CURRENT]: "DECIMAL(15, 2)",
  [BALANCES_LIMIT]: "DECIMAL(15, 2)",
  [BALANCES_ISO_CURRENCY_CODE]: "VARCHAR(10)",
  [SECURITY_ID]: "VARCHAR(255)",
  [CLOSE_PRICE]: "DECIMAL(15, 6)",
  [HOLDING_ACCOUNT_ID]: "VARCHAR(255)",
  [HOLDING_SECURITY_ID]: "VARCHAR(255)",
  [INSTITUTION_PRICE]: "DECIMAL(15, 6)",
  [INSTITUTION_VALUE]: "DECIMAL(15, 2)",
  [COST_BASIS]: "DECIMAL(15, 2)",
  [QUANTITY]: "DECIMAL(15, 6)",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class SnapshotModel extends Model {
  static typeChecker = {
    snapshot_id: isString,
    user_id: isNullableString,
    snapshot_date: isString,
    snapshot_type: isString,
    account_id: isNullableString,
    balances_available: isNullableNumber,
    balances_current: isNullableNumber,
    balances_limit: isNullableNumber,
    balances_iso_currency_code: isNullableString,
    security_id: isNullableString,
    close_price: isNullableNumber,
    holding_account_id: isNullableString,
    holding_security_id: isNullableString,
    institution_price: isNullableNumber,
    institution_value: isNullableNumber,
    cost_basis: isNullableNumber,
    quantity: isNullableNumber,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, SnapshotModel.typeChecker);
  }
  toJSON() {
    switch (this.snapshot_type) {
      case "account_balance":
        return this.toAccountSnapshot();
      case "security":
        return this.toSecuritySnapshot();
      case "holding":
        return this.toHoldingSnapshot();
    }
  }
  toAccountSnapshot() {
    return {
      snapshot: { snapshot_id: this.snapshot_id, date: this.snapshot_date },
      user: { user_id: this.user_id ?? "" },
      account: {
        account_id: this.account_id ?? "",
        balances: {
          current: this.balances_current,
          available: this.balances_available,
          limit: this.balances_limit,
          iso_currency_code: this.balances_iso_currency_code,
          unofficial_currency_code: null
        }
      }
    };
  }
  toSecuritySnapshot() {
    return {
      snapshot: { snapshot_id: this.snapshot_id, date: this.snapshot_date },
      security: { security_id: this.security_id ?? "", close_price: this.close_price }
    };
  }
  toHoldingSnapshot() {
    return {
      snapshot: { snapshot_id: this.snapshot_id, date: this.snapshot_date },
      user: { user_id: this.user_id ?? "" },
      holding: {
        account_id: this.holding_account_id ?? "",
        security_id: this.holding_security_id ?? "",
        institution_price: this.institution_price ?? 0,
        institution_value: this.institution_value ?? 0,
        cost_basis: this.cost_basis ?? 0,
        quantity: this.quantity ?? 0
      }
    };
  }
  static fromAccountSnapshot(d, user_id) {
    return {
      snapshot_id: d.snapshot.snapshot_id,
      user_id,
      snapshot_date: d.snapshot.date,
      snapshot_type: "account_balance",
      account_id: d.account.account_id,
      balances_available: d.account.balances?.available ?? null,
      balances_current: d.account.balances?.current ?? null,
      balances_limit: d.account.balances?.limit ?? null,
      balances_iso_currency_code: d.account.balances?.iso_currency_code ?? null
    };
  }
  static fromSecuritySnapshot(d) {
    return {
      snapshot_id: d.snapshot.snapshot_id,
      snapshot_date: d.snapshot.date,
      snapshot_type: "security",
      security_id: d.security.security_id,
      close_price: d.security.close_price ?? null
    };
  }
  static fromHoldingSnapshot(d, user_id) {
    return {
      snapshot_id: d.snapshot.snapshot_id,
      user_id,
      snapshot_date: d.snapshot.date,
      snapshot_type: "holding",
      holding_account_id: d.holding.account_id,
      holding_security_id: d.holding.security_id,
      institution_price: d.holding.institution_price ?? null,
      institution_value: d.holding.institution_value ?? null,
      cost_basis: d.holding.cost_basis ?? null,
      quantity: d.holding.quantity ?? null
    };
  }
}
var snapshotsTable = createTable({
  name: SNAPSHOTS,
  primaryKey: SNAPSHOT_ID,
  schema: snapshotSchema,
  indexes: [
    { column: USER_ID },
    { column: SNAPSHOT_TYPE },
    { column: SNAPSHOT_DATE },
    { column: ACCOUNT_ID },
    { column: SECURITY_ID }
  ],
  ModelClass: SnapshotModel
});
var snapshotColumns = Object.keys(snapshotsTable.schema);
// src/server/lib/postgres/models/chart.ts
var chartSchema = {
  [CHART_ID]: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
  [USER_ID]: `UUID REFERENCES ${USERS}(${USER_ID}) ON DELETE RESTRICT`,
  [NAME]: "VARCHAR(255) DEFAULT 'Unnamed'",
  [TYPE]: "VARCHAR(50)",
  [CONFIGURATION]: "JSONB",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP",
  [IS_DELETED]: "BOOLEAN DEFAULT FALSE"
};

class ChartModel extends Model {
  static typeChecker = {
    chart_id: isString,
    user_id: isString,
    name: isNullableString,
    type: isNullableString,
    configuration: isNullableObject,
    updated: isNullableString,
    is_deleted: isNullableBoolean
  };
  constructor(data) {
    super(data, ChartModel.typeChecker);
    this.configuration = typeof this.configuration === "object" ? JSON.stringify(this.configuration) : this.configuration;
  }
  toJSON() {
    return {
      chart_id: this.chart_id,
      name: this.name,
      type: this.type,
      configuration: this.configuration
    };
  }
  static fromJSON(c, user_id) {
    const r = { user_id };
    if (c.chart_id !== undefined)
      r.chart_id = c.chart_id;
    if (c.name !== undefined)
      r.name = c.name;
    if (c.type !== undefined)
      r.type = c.type;
    if (c.configuration !== undefined) {
      r.configuration = typeof c.configuration === "string" ? c.configuration : JSON.stringify(c.configuration);
    }
    return r;
  }
}
var chartsTable = createTable({
  name: CHARTS,
  primaryKey: CHART_ID,
  schema: chartSchema,
  indexes: [{ column: USER_ID }],
  ModelClass: ChartModel
});
var chartColumns = Object.keys(chartsTable.schema);
// src/server/lib/postgres/models/api_key.ts
var apiKeySchema = {
  [KEY_ID]: "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
  [USER_ID]: "UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE",
  [NAME]: "VARCHAR(255) NOT NULL",
  [KEY_HASH]: "VARCHAR(64) UNIQUE NOT NULL",
  [KEY_PREFIX]: "VARCHAR(16) NOT NULL",
  [SCOPES]: "TEXT[] NOT NULL DEFAULT '{}'",
  [CREATED_AT]: "TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP",
  [LAST_USED_AT]: "TIMESTAMPTZ",
  [REVOKED_AT]: "TIMESTAMPTZ",
  [EXPIRES_AT]: "TIMESTAMPTZ",
  [UPDATED]: "TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP"
};

class ApiKeyModel extends Model {
  static typeChecker = {
    key_id: isString,
    user_id: isString,
    name: isString,
    key_hash: isString,
    key_prefix: isString,
    scopes: isStringArray,
    created_at: isString,
    last_used_at: isNullableString,
    revoked_at: isNullableString,
    expires_at: isNullableString,
    updated: isNullableString
  };
  constructor(data) {
    super(data, ApiKeyModel.typeChecker);
  }
  toJSON() {
    return {
      key_id: this.key_id,
      user_id: this.user_id,
      name: this.name,
      key_prefix: this.key_prefix,
      scopes: this.scopes,
      created_at: this.created_at,
      last_used_at: this.last_used_at,
      revoked_at: this.revoked_at,
      expires_at: this.expires_at
    };
  }
}
var apiKeysTable = createTable({
  name: API_KEYS,
  primaryKey: KEY_ID,
  schema: apiKeySchema,
  indexes: [{ column: USER_ID }, { column: KEY_HASH }],
  ModelClass: ApiKeyModel,
  supportsSoftDelete: false
});
// src/server/lib/postgres/repositories/users.ts
var maskUser = (user3) => {
  const { user_id, username } = user3;
  return { user_id, username };
};
var writeUser = async (user3) => {
  const { user_id, username, password: password2 } = user3;
  const hashedPassword = password2 ? await bcrypt.hash(password2, 10) : undefined;
  const row = { username, password: hashedPassword };
  if (user_id)
    row.user_id = user_id;
  const result = await usersTable.upsert(row);
  if (result)
    return { _id: result.user_id };
  return;
};
var searchUser = async (user3) => {
  const filters = {};
  if (user3.user_id)
    filters[USER_ID] = user3.user_id;
  if (user3.username)
    filters.username = user3.username;
  if (Object.keys(filters).length === 0)
    return;
  const model = await usersTable.queryOne(filters);
  return model?.toUser();
};
var updateUser = async (user3) => {
  if (!user3)
    return false;
  const { user_id, username, password: password2 } = user3;
  const updates = {};
  if (username !== undefined)
    updates.username = username;
  if (password2 !== undefined)
    updates.password = await bcrypt.hash(password2, 10);
  if (Object.keys(updates).length === 0)
    return false;
  const model = await usersTable.update(user_id, updates);
  return model !== null;
};
var getUserById = async (user_id) => {
  const model = await usersTable.queryOne({ [USER_ID]: user_id });
  return model?.toUser();
};
var getMaskedUserById = async (user_id) => {
  const model = await usersTable.queryOne({ [USER_ID]: user_id });
  return model?.toMaskedUser();
};
var deleteUser = async (user_id) => {
  return await usersTable.softDelete(user_id);
};
export {
  writeUser,
  updateUser,
  searchUser,
  maskUser,
  getUserById,
  getMaskedUserById,
  deleteUser
};
