import { pgTable, index, serial, text, integer, varchar, timestamp, foreignKey, boolean, json, uniqueIndex, numeric, jsonb, bigint, smallint, unique, date, real, type AnyPgColumn, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const role = pgEnum("role", ['admin', 'provider'])
export const subRole = pgEnum("subRole", ['doctor', 'fitnessCoach', 'superAdmin', 'careTeam', 'admin'])
export const templateType = pgEnum("template_type", ['email', 'sms'])


export const comments = pgTable("comments", {
	id: serial().primaryKey().notNull(),
	content: text().notNull(),
	role: role(),
	userId: integer("user_id").notNull(),
	commentableType: varchar("commentable_type", { length: 255 }).notNull(),
	commentableId: varchar("commentable_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("comments_commentable_id_idx").using("btree", table.commentableId.asc().nullsLast().op("text_ops")),
	index("comments_commentable_type_idx").using("btree", table.commentableType.asc().nullsLast().op("text_ops")),
	index("comments_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("comments_user_type_idx").using("btree", table.role.asc().nullsLast().op("enum_ops")),
]);

export const documents = pgTable("documents", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 255 }),
	type: varchar({ length: 255 }).notNull(),
	url: varchar({ length: 255 }).notNull(),
	fileType: varchar("file_type", { length: 255 }).notNull(),
	patientVisible: boolean("patient_visible").default(true),
	providerId: integer("provider_id"),
	patientId: integer("patient_id").notNull(),
	validTill: timestamp("valid_till", { mode: 'string' }),
	pets: json(),
	editorState: varchar("editor_state", { length: 65535 }),
	html: varchar({ length: 65535 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("document_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("document_file_type_idx").using("btree", table.fileType.asc().nullsLast().op("text_ops")),
	index("document_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	index("document_name_idx").using("gin", sql`to_tsvector('english'::regconfig, (name)::text)`),
	index("document_patient_id_idx").using("btree", table.patientId.asc().nullsLast().op("int4_ops")),
	index("document_patient_visible_idx").using("btree", table.patientVisible.asc().nullsLast().op("bool_ops")),
	index("document_provider_id_idx").using("btree", table.providerId.asc().nullsLast().op("int4_ops")),
	index("document_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("document_valid_till_idx").using("btree", table.validTill.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "documents_patient_id_patients_id_fk"
		}),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [providers.id],
			name: "documents_provider_id_providers_id_fk"
		}),
]);

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	message: text().notNull(),
	senderId: integer("sender_id").notNull(),
	senderType: varchar("sender_type", { length: 255 }).notNull(),
	receiverId: integer("receiver_id").notNull(),
	receiverType: varchar("receiver_type", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const tags = pgTable("tags", {
	id: varchar({ length: 255 }).default('cuid()').primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("tag_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const admins = pgTable("admins", {
	id: integer().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }),
	phoneNumber: varchar("phone_number", { length: 255 }),
	profilePicture: varchar("profile_picture", { length: 255 }),
	userId: integer("user_id"),
	role: varchar({ length: 255 }).notNull(),
	isActive: boolean("is_active").default(true),
	companyCost: numeric("company_cost", { precision: 10, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("name_idx").using("gin", sql`to_tsvector('english'::regconfig, (name)::text)`),
	uniqueIndex("unique_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("unique_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "admins_user_id_users_id_fk"
		}),
]);

export const notes = pgTable("notes", {
	id: serial().primaryKey().notNull(),
	content: text().notNull(),
	role: role(),
	userId: integer("user_id").notNull(),
	isHidden: boolean("is_hidden").default(false),
	patientId: integer("patient_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("tbl_is_hidden_idx").using("btree", table.isHidden.asc().nullsLast().op("bool_ops")),
	index("tbl_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("tbl_user_type_idx").using("btree", table.role.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "notes_patient_id_patients_id_fk"
		}),
]);

export const types = pgTable("types", {
	id: varchar({ length: 255 }).default('cuid()').primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("type_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const adminAnalytics = pgTable("admin_analytics", {
	id: serial().primaryKey().notNull(),
	date: varchar({ length: 255 }).notNull(),
	grossRevenue: numeric("gross_revenue", { precision: 10, scale:  2 }).notNull(),
	netRevenue: numeric("net_revenue", { precision: 10, scale:  2 }).notNull(),
	totalPayments: numeric("total_payments", { precision: 10, scale:  2 }).notNull(),
	stripeFees: numeric("stripe_fees", { precision: 10, scale:  2 }).notNull(),
	googleAdSpend: numeric("google_ad_spend", { precision: 10, scale:  2 }).default('0'),
	metaAdSpend: numeric("meta_ad_spend", { precision: 10, scale:  2 }).default('0'),
	bingAdSpend: numeric("bing_ad_spend", { precision: 10, scale:  2 }).default('0'),
	costZenith: numeric("cost_zenith", { precision: 10, scale:  2 }).default('0'),
	supportAmount: numeric("support_amount", { precision: 10, scale:  2 }).default('0'),
	providerPerConsultFees: numeric("provider_per_consult_fees", { precision: 10, scale:  2 }).default('0'),
	providerFlatFees: numeric("provider_flat_fees", { precision: 10, scale:  2 }).default('0'),
	grossProfit: numeric("gross_profit", { precision: 10, scale:  2 }).default('0'),
	roas: numeric({ precision: 10, scale:  2 }).default('0'),
	cpaAmount: numeric("cpa_amount", { precision: 10, scale:  2 }).default('0'),
	clicks: numeric({ precision: 10, scale:  2 }).default('0'),
	conversionRate: numeric("conversion_rate", { precision: 10, scale:  2 }).default('0'),
	intakeSubmits: numeric("intake_submits", { precision: 10, scale:  2 }).default('0'),
	intakeConversionRate: numeric("intake_conversion_rate", { precision: 10, scale:  2 }).default('0'),
	miscellaneousAmount: numeric("miscellaneous_amount", { precision: 10, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const appSessions = pgTable("app_sessions", {
	varName: text("var_name").primaryKey().notNull(),
	varValue: text("var_value"),
});

export const workflowExecutionLogs = pgTable("workflow_execution_logs", {
	id: serial().primaryKey().notNull(),
	workflowConfigId: integer("workflow_config_id"),
	workflowId: varchar("workflow_id", { length: 255 }).notNull(),
	patientCode: varchar("patient_code", { length: 255 }).notNull(),
	taskId: varchar("task_id", { length: 255 }),
	triggerReason: varchar("trigger_reason", { length: 255 }),
	changedFields: jsonb("changed_fields"),
	executionData: jsonb("execution_data"),
	conditionsSnapshot: jsonb("conditions_snapshot"),
	status: varchar({ length: 50 }).notNull(),
	novuTransactionId: varchar("novu_transaction_id", { length: 255 }),
	novuResponse: jsonb("novu_response"),
	error: text(),
	skipReason: text("skip_reason"),
	executionTimeMs: integer("execution_time_ms"),
	retryCount: integer("retry_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	stateFingerprint: varchar("state_fingerprint", { length: 500 }),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
	cancelledReason: text("cancelled_reason"),
}, (table) => [
	index("workflow_execution_config_id_idx").using("btree", table.workflowConfigId.asc().nullsLast().op("int4_ops")),
	index("workflow_execution_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("workflow_execution_state_fingerprint_idx").using("btree", table.stateFingerprint.asc().nullsLast().op("text_ops")),
	index("workflow_execution_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("workflow_execution_workflow_patient_task_idx").using("btree", table.workflowId.asc().nullsLast().op("text_ops"), table.patientCode.asc().nullsLast().op("text_ops"), table.taskId.asc().nullsLast().op("text_ops")),
	index("workflow_execution_workflow_state_idx").using("btree", table.workflowId.asc().nullsLast().op("text_ops"), table.patientCode.asc().nullsLast().op("text_ops"), table.taskId.asc().nullsLast().op("text_ops"), table.stateFingerprint.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.workflowConfigId],
			foreignColumns: [workflowConfigs.id],
			name: "workflow_execution_logs_workflow_config_id_workflow_configs_id_"
		}),
]);

export const cities = pgTable("cities", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	stateId: bigint("state_id", { mode: "number" }).notNull(),
	stateCode: varchar("state_code", { length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	countryId: bigint("country_id", { mode: "number" }).notNull(),
	countryCode: varchar("country_code", { length: 2 }),
	latitude: varchar({ length: 255 }),
	longitude: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	flag: smallint().default(1).notNull(),
	wikiDataId: varchar({ length: 255 }),
});

export const customers = pgTable("customers", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
	paymentMethod: jsonb("payment_method"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("customers_patient_id_idx").using("btree", table.patientId.asc().nullsLast().op("int4_ops")),
	index("customers_stripe_customer_id_idx").using("btree", table.stripeCustomerId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "customers_patient_id_patients_id_fk"
		}).onDelete("cascade"),
	unique("customers_stripe_customer_id_unique").on(table.stripeCustomerId),
]);

export const patientPayments = pgTable("patient_payments", {
	id: serial().primaryKey().notNull(),
	paymentId: text("payment_id"),
	patientId: integer("patient_id").notNull(),
	status: text().notNull(),
	amount: numeric().notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("patient_payments_payment_id_idx").using("btree", table.paymentId.asc().nullsLast().op("text_ops")),
	index("patient_payments_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: varchar({ length: 40 }).primaryKey().notNull(),
	userId: varchar("user_id", { length: 21 }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("password_token_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("password_token_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const patients = pgTable("patients", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	fullName: varchar("full_name", { length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 20 }).notNull(),
	otp: varchar({ length: 255 }),
	state: varchar({ length: 20 }),
	country: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	address: varchar({ length: 255 }),
	zipCode: varchar("zip_code", { length: 20 }),
	city: varchar({ length: 255 }),
	creditCardUpdatedAt: timestamp("credit_card_updated_at", { mode: 'string' }),
	intakeFormSubmitted: integer("intake_form_submitted").default(0),
	dob: date(),
	utmParams: json("utm_params"),
	trackingParams: json("tracking_params"),
	gclid: varchar({ length: 255 }),
	fbclid: varchar({ length: 255 }),
	isSubscribed: boolean("is_subscribed").default(true),
	timezone: varchar({ length: 255 }),
	ghlcontactId: varchar("ghlcontact_id", { length: 255 }),
	brandCode: varchar("brand_code", { length: 255 }).default('minimal'),
}, (table) => [
	index("patients_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("patients_country_idx").using("btree", table.country.asc().nullsLast().op("text_ops")),
	index("patients_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("patients_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("patients_state_idx").using("btree", table.state.asc().nullsLast().op("text_ops")),
	unique("patients_email_unique").on(table.email),
]);

export const countries = pgTable("countries", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	iso3: varchar({ length: 3 }),
	numericCode: varchar("numeric_code", { length: 3 }),
	iso2: varchar({ length: 5 }),
	phonecode: varchar({ length: 255 }),
	capital: varchar({ length: 255 }),
	currency: varchar({ length: 255 }),
	currencyName: varchar("currency_name", { length: 255 }),
	currencySymbol: varchar("currency_symbol", { length: 255 }),
	tld: varchar({ length: 255 }),
	native: varchar({ length: 255 }),
	region: varchar({ length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	regionId: bigint("region_id", { mode: "number" }),
	subregion: varchar({ length: 255 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	subregionId: bigint("subregion_id", { mode: "number" }),
	nationality: varchar({ length: 255 }),
	timezones: text(),
	translations: text(),
	latitude: numeric({ precision: 10, scale:  8 }),
	longitude: numeric({ precision: 11, scale:  8 }),
	emoji: varchar({ length: 191 }),
	emojiU: varchar({ length: 191 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	flag: smallint().default(1).notNull(),
	wikiDataId: varchar({ length: 255 }),
});

export const emailVerificationCodes = pgTable("email_verification_codes", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 21 }),
	email: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 8 }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("verification_code_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("verification_code_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	image: varchar({ length: 512 }),
	durationInDays: integer("duration_in_days"),
	package: varchar({ length: 255 }),
	durationInMonths: integer("duration_in_months"),
	serviceType: varchar("service_type", { length: 255 }),
	tag: varchar({ length: 255 }),
	popularProduct: integer("popular_product"),
	recommendations: json(),
	addons: json(),
	type: varchar({ length: 50 }).notNull(),
	isPayable: boolean("is_payable").default(true),
	price: numeric({ precision: 10, scale:  2 }),
	discount: numeric({ precision: 10, scale:  2 }),
	discountType: varchar("discount_type", { length: 20 }),
	stripeId: text("stripe_id"),
	isEnabled: boolean("is_enabled").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("products_discount_type_idx").using("btree", table.discountType.asc().nullsLast().op("text_ops")),
	index("products_is_enabled_idx").using("btree", table.isEnabled.asc().nullsLast().op("bool_ops")),
	index("products_service_type_idx").using("btree", table.serviceType.asc().nullsLast().op("text_ops")),
	index("products_stripe_id_idx").using("btree", table.stripeId.asc().nullsLast().op("text_ops")),
	index("products_tag_idx").using("btree", table.tag.asc().nullsLast().op("text_ops")),
	index("products_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
]);

export const calComWebhookLogs = pgTable("cal_com_webhook_logs", {
	id: serial().primaryKey().notNull(),
	triggerEvent: varchar("trigger_event", { length: 255 }).notNull(),
	status: varchar({ length: 50 }).default('received').notNull(),
	payload: json().notNull(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	error: text(),
	taskCode: varchar("task_code", { length: 255 }),
	bookingId: integer("booking_id"),
	calBookingUid: varchar("cal_booking_uid", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("cal_com_webhook_logs_booking_id_idx").using("btree", table.bookingId.asc().nullsLast().op("int4_ops")),
	index("cal_com_webhook_logs_cal_booking_uid_idx").using("btree", table.calBookingUid.asc().nullsLast().op("text_ops")),
	index("cal_com_webhook_logs_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("cal_com_webhook_logs_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("cal_com_webhook_logs_task_code_idx").using("btree", table.taskCode.asc().nullsLast().op("text_ops")),
	index("cal_com_webhook_logs_trigger_event_idx").using("btree", table.triggerEvent.asc().nullsLast().op("text_ops")),
]);

export const providerBusinessHours = pgTable("provider_business_hours", {
	id: serial().primaryKey().notNull(),
	providerId: integer("provider_id").notNull(),
	day: varchar({ length: 255 }),
	startTime: varchar("start_time", { length: 255 }),
	endTime: varchar("end_time", { length: 255 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [users.id],
			name: "provider_business_hours_provider_id_users_id_fk"
		}),
]);

export const patientTreatmentPlans = pgTable("patient_treatment_plans", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	image: varchar({ length: 512 }),
	package: varchar({ length: 512 }),
	serviceType: varchar("service_type", { length: 255 }).notNull(),
	tag: varchar({ length: 255 }).notNull(),
	recommendations: json(),
	addons: json(),
	type: varchar({ length: 50 }),
	code: varchar({ length: 255 }),
	isPayable: boolean("is_payable").default(true),
	paymentStatus: varchar("payment_status", { length: 50 }).default('Unpaid').notNull(),
	price: real().notNull(),
	discountCode: varchar("discount_code", { length: 255 }),
	discountAmount: real("discount_amount").default(0),
	providerId: integer("provider_id").notNull(),
	patientId: integer("patient_id").notNull(),
	stripeId: varchar("stripe_id", { length: 255 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("treatment_plan_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("treatment_plan_is_payable_idx").using("btree", table.isPayable.asc().nullsLast().op("bool_ops")),
	index("treatment_plan_patient_id_idx").using("btree", table.patientId.asc().nullsLast().op("int4_ops")),
	index("treatment_plan_payment_status_idx").using("btree", table.paymentStatus.asc().nullsLast().op("text_ops")),
	index("treatment_plan_provider_id_idx").using("btree", table.providerId.asc().nullsLast().op("int4_ops")),
	index("treatment_plan_service_type_idx").using("btree", table.serviceType.asc().nullsLast().op("text_ops")),
	index("treatment_plan_stripe_id_idx").using("btree", table.stripeId.asc().nullsLast().op("text_ops")),
	index("treatment_plan_tag_idx").using("btree", table.tag.asc().nullsLast().op("text_ops")),
	index("treatment_plan_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [providers.id],
			name: "patient_treatment_plans_provider_id_providers_id_fk"
		}),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_treatment_plans_patient_id_patients_id_fk"
		}),
]);

export const providerMedicalLicense = pgTable("provider_medical_license", {
	id: serial().primaryKey().notNull(),
	providerId: integer("provider_id").notNull(),
	country: varchar({ length: 255 }),
	state: varchar({ length: 255 }),
	licenseNumber: varchar("license_number", { length: 255 }),
	licenseExpirationDate: timestamp("license_expiration_date", { mode: 'string' }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [users.id],
			name: "provider_medical_license_provider_id_users_id_fk"
		}),
]);

export const states = pgTable("states", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	countryId: bigint("country_id", { mode: "number" }).notNull(),
	countryCode: varchar("country_code", { length: 2 }),
	fipsCode: varchar("fips_code", { length: 255 }),
	iso2: varchar({ length: 5 }),
	type: varchar({ length: 255 }),
	latitude: varchar({ length: 255 }),
	longitude: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	flag: smallint().default(1).notNull(),
	wikiDataId: varchar({ length: 255 }),
});

export const providers = pgTable("providers", {
	id: integer().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
	code: varchar({ length: 255 }),
	profilePicture: varchar("profile_picture", { length: 255 }),
	birthDate: timestamp("birth_date", { mode: 'string' }),
	userId: integer("user_id").notNull(),
	phoneNumber: varchar("phone_number", { length: 255 }).notNull(),
	services: text(),
	bio: text(),
	country: varchar({ length: 255 }),
	address: varchar({ length: 255 }),
	city: varchar({ length: 255 }),
	state: varchar({ length: 255 }),
	zipCode: varchar("zip_code", { length: 255 }),
	timezone: varchar({ length: 255 }),
	npiNumber: varchar("npi_number", { length: 255 }),
	title: varchar({ length: 255 }),
	medicalLicense: json("medical_license"),
	practiceInformation: json("practice_information"),
	businessHours: json("business_hours"),
	signature: varchar({ length: 255 }),
	accountNumber: varchar("account_number", { length: 255 }),
	routingNumber: varchar("routing_number", { length: 255 }),
	sendEmailNotification: boolean("send_email_notification").default(true),
	emailNotification: varchar("email_notification", { length: 255 }),
	sendSmsNotification: boolean("send_sms_notification").default(true),
	phoneNumberNotification: varchar("phone_number_notification", { length: 255 }),
	formAddress: json("form_address"),
	isFlatAmount: boolean("is_flat_amount").default(false),
	flatAmount: numeric("flat_amount", { precision: 10, scale:  2 }),
	isActive: boolean("is_active").default(true),
	isOnline: boolean("is_online").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	patientCallMediums: jsonb("patient_call_mediums"),
}, (table) => [
	index("first_name_search_index").using("gin", sql`to_tsvector('english'::regconfig, (first_name)::text)`),
	index("last_name_search_index").using("gin", sql`to_tsvector('english'::regconfig, (last_name)::text)`),
	index("providers_city_idx").using("btree", table.city.asc().nullsLast().op("text_ops")),
	index("providers_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("providers_country_idx").using("btree", table.country.asc().nullsLast().op("text_ops")),
	index("providers_state_idx").using("btree", table.state.asc().nullsLast().op("text_ops")),
	uniqueIndex("unique_providers_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "providers_user_id_users_id_fk"
		}),
]);

export const sessions = pgTable("sessions", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("session_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("session_user_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}),
]);

export const providersServicePricing = pgTable("providers_service_pricing", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	providerId: bigint("provider_id", { mode: "number" }).notNull(),
	tags: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
}, (table) => [
	index("provider_tags_type_idx").using("btree", table.providerId.asc().nullsLast().op("text_ops"), table.tags.asc().nullsLast().op("int8_ops"), table.type.asc().nullsLast().op("int8_ops")),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [providers.id],
			name: "providers_service_pricing_provider_id_providers_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	hashedPassword: varchar("hashed_password", { length: 255 }),
	avatar: varchar({ length: 255 }),
	role: role(),
	subRole: subRole("sub_role"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("title_search_index").using("gin", sql`to_tsvector('english'::regconfig, (name)::text)`),
	index("user_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("user_id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops"), table.role.asc().nullsLast().op("enum_ops")),
	index("user_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("user_sub_role_idx").using("btree", table.subRole.asc().nullsLast().op("enum_ops")),
	unique("users_email_unique").on(table.email),
]);

export const suppliers = pgTable("suppliers", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const providerPayments = pgTable("provider_payments", {
	id: serial().primaryKey().notNull(),
	paymentCode: varchar("payment_code", { length: 255 }).notNull(),
	providerId: integer("provider_id").notNull(),
	paymentDate: timestamp("payment_date", { mode: 'string' }).notNull(),
	paymentAmount: real("payment_amount").notNull(),
	paymentMethod: json("payment_method"),
	status: varchar({ length: 255 }).notNull(),
	paymentRefNumber: varchar("payment_ref_number", { length: 255 }),
	adminNotes: text("admin_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("provider_payment_payment_code_idx").using("btree", table.paymentCode.asc().nullsLast().op("text_ops")),
	index("provider_payment_provider_id_idx").using("btree", table.providerId.asc().nullsLast().op("int4_ops")),
	index("provider_payment_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [providers.id],
			name: "provider_payments_provider_id_providers_id_fk"
		}),
]);

export const providerPriorities = pgTable("provider_priorities", {
	id: serial().primaryKey().notNull(),
	providerId: integer("provider_id").notNull(),
	state: varchar({ length: 255 }).notNull(),
	priority: numeric({ precision: 5, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	createdBy: integer("created_by"),
}, (table) => [
	uniqueIndex("provider_state_priority_idx").using("btree", table.providerId.asc().nullsLast().op("int4_ops"), table.state.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "provider_priorities_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [providers.id],
			name: "provider_priorities_provider_id_providers_id_fk"
		}),
]);

export const templates = pgTable("templates", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	html: varchar({ length: 65535 }),
	editorState: varchar("editor_state", { length: 65535 }),
	state: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("templates_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const activityLogs = pgTable("activity_logs", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	userRole: varchar("user_role", { length: 255 }).notNull(),
	action: varchar({ length: 255 }).notNull(),
	entityType: varchar("entity_type", { length: 255 }).notNull(),
	entityId: varchar("entity_id", { length: 255 }).notNull(),
	description: text().notNull(),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	oldData: json("old_data"),
	newData: json("new_data"),
}, (table) => [
	index("activity_log_action_idx").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("activity_log_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("activity_log_description_search_idx").using("gin", sql`to_tsvector('english'::regconfig, description)`),
	index("activity_log_entity_id_idx").using("btree", table.entityId.asc().nullsLast().op("text_ops")),
	index("activity_log_entity_type_action_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops"), table.action.asc().nullsLast().op("text_ops")),
	index("activity_log_entity_type_idx").using("btree", table.entityType.asc().nullsLast().op("text_ops")),
	index("activity_log_user_action_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.action.asc().nullsLast().op("text_ops")),
	index("activity_log_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("activity_log_user_role_idx").using("btree", table.userRole.asc().nullsLast().op("text_ops")),
]);

export const notificationSettings = pgTable("notification_settings", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	maxNotifications: integer("max_notifications").default(3).notNull(),
	description: text(),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	tag: jsonb(),
	status: jsonb(),
}, (table) => [
	uniqueIndex("notification_settings_name_type_idx").using("btree", table.name.asc().nullsLast().op("text_ops"), table.type.asc().nullsLast().op("text_ops")),
]);

export const settings = pgTable("settings", {
	id: serial().primaryKey().notNull(),
	key: varchar({ length: 255 }),
	value: text(),
}, (table) => [
	index("settings_key_idx").using("btree", table.key.asc().nullsLast().op("text_ops")),
	unique("settings_key_unique").on(table.key),
]);

export const workflowExecutionCounters = pgTable("workflow_execution_counters", {
	id: serial().primaryKey().notNull(),
	workflowId: varchar("workflow_id", { length: 255 }).notNull(),
	patientCode: varchar("patient_code", { length: 255 }).notNull(),
	taskId: varchar("task_id", { length: 255 }),
	date: varchar({ length: 10 }).notNull(),
	executionCount: integer("execution_count").default(0),
	successCount: integer("success_count").default(0),
	failureCount: integer("failure_count").default(0),
	skipCount: integer("skip_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	cancelledCount: integer("cancelled_count").default(0),
}, (table) => [
	index("workflow_counters_date_idx").using("btree", table.date.asc().nullsLast().op("text_ops")),
	uniqueIndex("workflow_counters_unique_daily_idx").using("btree", table.workflowId.asc().nullsLast().op("text_ops"), table.patientCode.asc().nullsLast().op("text_ops"), table.taskId.asc().nullsLast().op("text_ops"), table.date.asc().nullsLast().op("text_ops")),
	index("workflow_counters_workflow_id_idx").using("btree", table.workflowId.asc().nullsLast().op("text_ops")),
]);

export const intakeFormConfig = pgTable("intake_form_config", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }),
	title: varchar({ length: 255 }).notNull(),
	questions: jsonb(),
	status: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("intake_form_config_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("intake_form_config_title_idx").using("btree", table.title.asc().nullsLast().op("text_ops")),
]);

export const workflowConfigs = pgTable("workflow_configs", {
	id: serial().primaryKey().notNull(),
	workflowId: varchar("workflow_id", { length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	active: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	description: text(),
	conditions: jsonb(),
	triggerFields: jsonb("trigger_fields"),
	deduplicationStrategy: varchar("deduplication_strategy", { length: 50 }).default('state-based'),
	minIntervalMinutes: integer("min_interval_minutes").default(30),
	maxExecutionsPerDay: integer("max_executions_per_day").default(10),
	category: varchar({ length: 100 }),
	priority: integer().default(0),
	allowFinalStates: boolean("allow_final_states").default(false),
	customLogic: text("custom_logic"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("workflow_configs_active_idx").using("btree", table.active.asc().nullsLast().op("bool_ops")),
	index("workflow_configs_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("workflow_configs_priority_idx").using("btree", table.priority.asc().nullsLast().op("int4_ops")),
	index("workflow_configs_workflow_id_idx").using("btree", table.workflowId.asc().nullsLast().op("text_ops")),
	unique("workflow_configs_workflow_id_unique").on(table.workflowId),
]);

export const calComEventMatrixLinks = pgTable("cal_com_event_matrix_links", {
	id: serial().primaryKey().notNull(),
	serviceType: varchar("service_type", { length: 255 }).notNull(),
	tag: varchar({ length: 255 }).notNull(),
	link: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const retellJobs = pgTable("retell_jobs", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id"),
	taskId: integer("task_id"),
	agent: varchar({ length: 255 }),
	payload: jsonb(),
	error: varchar({ length: 255 }),
	status: varchar({ length: 255 }).default('pending'),
	recievedAt: timestamp("recieved_at", { mode: 'string' }),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	queueName: varchar("queue_name", { length: 255 }).default('active'),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "retell_jobs_patient_id_patients_id_fk"
		}),
]);

export const transactions = pgTable("transactions", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id"),
	patientId: integer("patient_id"),
	providerId: integer("provider_id").notNull(),
	amount: real(),
	totalAmount: real("total_amount").notNull(),
	patientAmount: real("patient_amount").notNull(),
	supportAmount: real("support_amount").notNull(),
	othersAmount: real("others_amount").notNull(),
	processingAmount: real("processing_amount").notNull(),
	sscAmount: real("ssc_amount").notNull(),
	providerAmount: real("provider_amount").notNull(),
	status: varchar({ length: 255 }).notNull(),
	paymentCode: varchar("payment_code", { length: 255 }),
	adminNotes: varchar("admin_notes", { length: 65535 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("transaction_payment_code_idx").using("btree", table.paymentCode.asc().nullsLast().op("text_ops")),
	index("transaction_provider_id_idx").using("btree", table.providerId.asc().nullsLast().op("int4_ops")),
	index("transaction_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "transactions_task_id_tasks_id_fk"
		}),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "transactions_patient_id_patients_id_fk"
		}),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [providers.id],
			name: "transactions_provider_id_providers_id_fk"
		}),
]);

export const activeWorkflowExecutions = pgTable("active_workflow_executions", {
	id: serial().primaryKey().notNull(),
	workflowId: varchar("workflow_id", { length: 255 }).notNull(),
	patientCode: varchar("patient_code", { length: 255 }).notNull(),
	taskId: varchar("task_id", { length: 255 }),
	novuTransactionId: varchar("novu_transaction_id", { length: 255 }),
	stateFingerprint: varchar("state_fingerprint", { length: 500 }),
	triggerData: jsonb("trigger_data"),
	status: varchar({ length: 50 }).default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("active_executions_novu_transaction_idx").using("btree", table.novuTransactionId.asc().nullsLast().op("text_ops")),
	index("active_executions_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("active_executions_workflow_patient_idx").using("btree", table.workflowId.asc().nullsLast().op("text_ops"), table.patientCode.asc().nullsLast().op("text_ops"), table.taskId.asc().nullsLast().op("text_ops")),
]);

export const notificationTiming = pgTable("notification_timing", {
	id: serial().primaryKey().notNull(),
	settingId: integer("setting_id").notNull(),
	notificationNumber: integer("notification_number").notNull(),
	delayHours: numeric("delay_hours", { precision: 10, scale:  2 }).notNull(),
	description: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("notification_timing_setting_id_idx").using("btree", table.settingId.asc().nullsLast().op("int4_ops")),
	uniqueIndex("notification_timing_setting_id_notification_number_idx").using("btree", table.settingId.asc().nullsLast().op("int4_ops"), table.notificationNumber.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.settingId],
			foreignColumns: [notificationSettings.id],
			name: "notification_timing_setting_id_notification_settings_id_fk"
		}),
]);

export const taskNotifications = pgTable("task_notifications", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id").notNull(),
	notificationNumber: integer("notification_number").notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }).defaultNow().notNull(),
	status: varchar({ length: 50 }).default('success').notNull(),
	channel: varchar({ length: 50 }).default('email').notNull(),
	settingId: integer("setting_id"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("task_notifications_sent_at_idx").using("btree", table.sentAt.asc().nullsLast().op("timestamp_ops")),
	index("task_notifications_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("task_notifications_task_id_idx").using("btree", table.taskId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.settingId],
			foreignColumns: [notificationSettings.id],
			name: "task_notifications_setting_id_notification_settings_id_fk"
		}),
]);

export const patientPlans = pgTable("patient_plans", {
	id: serial().primaryKey().notNull(),
	categoryId: integer("category_id").notNull(),
	patientId: integer("patient_id").notNull(),
	planId: integer("plan_id").notNull(),
	medicationId: integer("medication_id"),
	status: varchar({ length: 50 }).default('active').notNull(),
	nextRefillDueDate: timestamp("next_refill_due_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	prescriptionId: integer("prescription_id"),
}, (table) => [
	index("patient_plans_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("patient_plans_current_medication_id_idx").using("btree", table.medicationId.asc().nullsLast().op("int4_ops")),
	index("patient_plans_next_refill_due_date_idx").using("btree", table.nextRefillDueDate.asc().nullsLast().op("timestamp_ops")),
	index("patient_plans_patient_id_idx").using("btree", table.patientId.asc().nullsLast().op("int4_ops")),
	index("patient_plans_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("int4_ops")),
	index("patient_plans_prescription_id_idx").using("btree", table.prescriptionId.asc().nullsLast().op("int4_ops")),
	index("patient_plans_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "patient_plans_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_plans_patient_id_patients_id_fk"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.id],
			name: "patient_plans_plan_id_plans_id_fk"
		}),
]);

export const patientIntakeForms = pgTable("patient_intake_forms", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	isProviderPresent: boolean("is_provider_present").default(false),
	information: json(),
	lastStep: varchar("last_step", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	response: json(),
	intakeCode: varchar("intake_code", { length: 50 }),
	formConfigId: integer("form_config_id").notNull(),
	formId: varchar("form_id", { length: 50 }).notNull(),
	isCompletedOneTime: boolean("is_completed_one_time").default(false),
}, (table) => [
	index("patient_intake_forms_is_provider_present_idx").using("btree", table.isProviderPresent.asc().nullsLast().op("bool_ops")),
	index("patient_intake_forms_patient_id_idx").using("btree", table.patientId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_intake_forms_patient_id_patients_id_fk"
		}),
	foreignKey({
			columns: [table.formConfigId],
			foreignColumns: [intakeFormConfig.id],
			name: "patient_intake_forms_form_config_id_intake_form_config_id_fk"
		}).onDelete("cascade"),
]);

export const callerNumbers = pgTable("caller_numbers", {
	id: serial().primaryKey().notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	maxDailyUtilization: integer("max_daily_utilization").default(149).notNull(),
	isActive: boolean("is_active").default(true),
	isLateNight: boolean("is_late_night").default(false),
	description: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	brandCode: varchar("brand_code", { length: 255 }).default('wellnesswag'),
	agentName: varchar("agent_name", { length: 255 }),
	agentId: varchar("agent_id", { length: 255 }),
	isRenewals: boolean("is_renewals").default(false),
}, (table) => [
	unique("caller_numbers_phone_number_unique").on(table.phoneNumber),
]);

export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 255 }),
	serviceType: varchar("service_type", { length: 255 }).notNull(),
	tag: varchar({ length: 255 }).notNull(),
	package: varchar({ length: 255 }),
	state: varchar({ length: 255 }),
	status: varchar({ length: 255 }).notNull(),
	callStatus: varchar("call_status", { length: 255 }),
	callNote: text("call_note"),
	startDate: timestamp("start_date", { mode: 'string' }),
	dueDate: timestamp("due_date", { mode: 'string' }),
	completedDate: timestamp("completed_date", { mode: 'string' }),
	paymentDate: timestamp("payment_date", { mode: 'string' }),
	amount: real(),
	isAssigned: boolean("is_assigned").default(false),
	isPayment: boolean("is_payment"),
	paymentStatus: varchar("payment_status", { length: 255 }).default('Unpaid').notNull(),
	totalAmount: real("total_amount"),
	patientAmount: real("patient_amount"),
	supportAmount: real("support_amount"),
	othersAmount: real("others_amount"),
	processingAmount: real("processing_amount"),
	sscAmount: real("ssc_amount"),
	providerAmount: real("provider_amount"),
	discountAmount: real("discount_amount"),
	stripeTransactionId: varchar("stripe_transaction_id", { length: 255 }),
	discountCode: varchar("discount_code", { length: 255 }),
	utmParams: json("utm_params"),
	trackingParams: json("tracking_params"),
	providerId: integer("provider_id"),
	patientId: integer("patient_id"),
	isSubscription: boolean("is_subscription").default(false),
	subscriptionMethod: varchar("subscription_method", { length: 255 }),
	patientProductId: integer("patient_product_id"),
	dosage: text(),
	sig: text(),
	isActive: boolean("is_active").default(true),
	isSubmittedPharmacy: boolean("is_submitted_pharmacy").default(false),
	patientTaskStatus: varchar("patient_task_status", { length: 255 }),
	actions: json(),
	isVisible: boolean("is_visible").default(true),
	calBookingUid: varchar("cal_booking_uid", { length: 255 }),
	bookingId: integer("booking_id"),
	bookingTriggerEvent: varchar("booking_trigger_event", { length: 255 }),
	bookingCreatedAt: timestamp("booking_created_at", { mode: 'string' }),
	bookingStartTime: timestamp("booking_start_time", { mode: 'string' }),
	bookingEndTime: timestamp("booking_end_time", { mode: 'string' }),
	organizerName: varchar("organizer_name", { length: 255 }),
	organizerEmail: varchar("organizer_email", { length: 255 }),
	calComUrl: varchar("cal_com_url", { length: 255 }),
	bookingStatus: varchar("booking_status", { length: 255 }),
	bookingReason: text("booking_reason"),
	rescheduleReason: text("reschedule_reason"),
	cancellationReason: text("cancellation_reason"),
	cancelledBy: varchar("cancelled_by", { length: 255 }),
	rescheduledBy: varchar("rescheduled_by", { length: 255 }),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
	rescheduledAt: timestamp("rescheduled_at", { mode: 'string' }),
	calAttendees: json("cal_attendees"),
	calBookingPayload: json("cal_booking_payload"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	medicineInput: varchar("medicine_input", { length: 255 }),
	checkoutProductId: integer("checkout_product_id"),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	adminNote: text("admin_note"),
	productInfo: json("product_info"),
	productTrackingLink: varchar("product_tracking_link", { length: 255 }),
	amountMetaData: jsonb("amount_meta_data"),
	paymentReason: text("payment_reason"),
	supplierId: integer("supplier_id"),
	prescriptionDeliveryDate: timestamp("prescription_delivery_date", { mode: 'string' }),
	title: text(),
	description: text(),
	quantity: integer(),
	notificationsCount: integer("notifications_count").default(0),
	nextNotificationAt: timestamp("next_notification_at", { mode: 'string' }),
	maxNotifications: integer("max_notifications").default(3),
	notificationSettingId: integer("notification_setting_id"),
	isRefill: boolean("is_refill").default(true),
	brandCode: varchar("brand_code", { length: 255 }).default('minimal'),
	categoryId: integer("category_id"),
	planId: integer("plan_id"),
	patientPlanId: integer("patient_plan_id"),
	genericTitle: varchar("generic_title", { length: 255 }),
	currentMedicationId: integer("current_medication_id"),
}, (table) => [
	index("booking_status_idx").using("btree", table.bookingStatus.asc().nullsLast().op("text_ops")),
	index("booking_trigger_event_idx").using("btree", table.bookingTriggerEvent.asc().nullsLast().op("text_ops")),
	index("task_booking_id_idx").using("btree", table.bookingId.asc().nullsLast().op("int4_ops")),
	index("task_cal_booking_uid_idx").using("btree", table.calBookingUid.asc().nullsLast().op("text_ops")),
	index("task_call_status_idx").using("btree", table.callStatus.asc().nullsLast().op("text_ops")),
	index("task_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("task_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("task_completed_date_idx").using("btree", table.completedDate.asc().nullsLast().op("timestamp_ops")),
	index("task_due_date_idx").using("btree", table.dueDate.asc().nullsLast().op("timestamp_ops")),
	index("task_generic_title_idx").using("btree", table.genericTitle.asc().nullsLast().op("text_ops")),
	index("task_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("task_is_assigned_idx").using("btree", table.isAssigned.asc().nullsLast().op("bool_ops")),
	index("task_is_payment_idx").using("btree", table.isPayment.asc().nullsLast().op("bool_ops")),
	index("task_is_visible_idx").using("btree", table.isVisible.asc().nullsLast().op("bool_ops")),
	index("task_patient_plan_id_idx").using("btree", table.patientPlanId.asc().nullsLast().op("int4_ops")),
	index("task_payment_status_idx").using("btree", table.paymentStatus.asc().nullsLast().op("text_ops")),
	index("task_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("int4_ops")),
	index("task_product_id_idx").using("btree", table.patientProductId.asc().nullsLast().op("int4_ops")),
	index("task_service_type_idx").using("btree", table.serviceType.asc().nullsLast().op("text_ops")),
	index("task_start_date_idx").using("btree", table.startDate.asc().nullsLast().op("timestamp_ops")),
	index("task_state_idx").using("btree", table.state.asc().nullsLast().op("text_ops")),
	index("task_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("task_tag_idx").using("btree", table.tag.asc().nullsLast().op("text_ops")),
	index("task_type_idx").using("btree", table.serviceType.asc().nullsLast().op("text_ops")),
	index("task_user_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.providerId],
			foreignColumns: [providers.id],
			name: "tasks_provider_id_providers_id_fk"
		}),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "tasks_patient_id_patients_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "tasks_supplier_id_suppliers_id_fk"
		}),
	foreignKey({
			columns: [table.notificationSettingId],
			foreignColumns: [notificationSettings.id],
			name: "tasks_notification_setting_id_notification_settings_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "tasks_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.id],
			name: "tasks_plan_id_plans_id_fk"
		}),
	foreignKey({
			columns: [table.patientPlanId],
			foreignColumns: [patientPlans.id],
			name: "tasks_patient_plan_id_patient_plans_id_fk"
		}),
	foreignKey({
			columns: [table.currentMedicationId],
			foreignColumns: [medications.id],
			name: "tasks_current_medication_id_medications_id_fk"
		}),
]);

export const brands = pgTable("brands", {
	id: serial().primaryKey().notNull(),
	brandName: varchar("brand_name", { length: 255 }).notNull(),
	brandCode: varchar("brand_code", { length: 255 }).default('minimal'),
	url: varchar({ length: 255 }),
	webhookUrl: varchar("webhook_url", { length: 255 }),
	emailLayout: text("email_layout"),
	smtpHost: varchar("smtp_host", { length: 255 }),
	smtpPort: integer("smtp_port"),
	smtpUser: varchar("smtp_user", { length: 255 }),
	smtpPassword: varchar("smtp_password", { length: 255 }),
	smtpFromEmail: varchar("smtp_from_email", { length: 255 }),
	checkoutLink: varchar("checkout_link", { length: 255 }),
	twilioAccountSid: varchar("twilio_account_sid", { length: 255 }),
	twilioAuthToken: varchar("twilio_auth_token", { length: 255 }),
	twilioFromNumber: varchar("twilio_from_number", { length: 255 }),
	twilioTwimlAppSid: varchar("twilio_twiml_app_sid", { length: 255 }),
}, (table) => [
	index("brand_code_idx").using("btree", table.brandCode.asc().nullsLast().op("text_ops")),
]);

export const notificationTemplates = pgTable("notification_templates", {
	id: serial().primaryKey().notNull(),
	templateKey: varchar("template_key", { length: 100 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: templateType().notNull(),
	brandCode: varchar("brand_code", { length: 50 }).default('minimal').notNull(),
	heading1: varchar({ length: 500 }),
	heading2: varchar({ length: 500 }),
	title: varchar({ length: 500 }),
	preview: varchar({ length: 255 }),
	content: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdBy: varchar("created_by", { length: 100 }),
	updatedBy: varchar("updated_by", { length: 100 }),
}, (table) => [
	unique("notification_templates_template_key_unique").on(table.templateKey),
]);

export const retellAiCallLogs = pgTable("retell_ai_call_logs", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	taskId: integer("task_id").notNull(),
	fromNumber: varchar("from_number", { length: 255 }),
	time: varchar({ length: 255 }),
	duration: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
	cost: varchar({ length: 255 }),
	callId: varchar("call_id", { length: 255 }),
	agentId: varchar("agent_id", { length: 255 }),
	disconnectionReason: text("disconnection_reason"),
	callStatus: text("call_status"),
	userSentiment: text("user_sentiment"),
	recordingUrl: text("recording_url"),
	metaData: text("meta_data"),
	transcript: text(),
	transcriptObject: json("transcript_object"),
	callSummary: text("call_summary"),
	detailedCallSummary: text("detailed_call_summary"),
	callOutCome: text("call_out_come"),
	customerEngagement: text("customer_engagement"),
	abandonedPurchaseReason: text("abandoned_purchase_reason"),
	callBackTime: text("call_back_time"),
	startTimestamp: timestamp("start_timestamp", { mode: 'string' }),
	endTimestamp: timestamp("end_timestamp", { mode: 'string' }),
	retellDynamicVariables: json("retell_dynamic_variables"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("retell_ai_call_logs_call_id_idx").using("btree", table.callId.asc().nullsLast().op("text_ops")),
	index("retell_ai_call_logs_call_status_idx").using("btree", table.callStatus.asc().nullsLast().op("text_ops")),
	index("retell_ai_call_logs_cost_idx").using("btree", table.cost.asc().nullsLast().op("text_ops")),
	index("retell_ai_call_logs_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("retell_ai_call_logs_disconnection_reason_idx").using("btree", table.disconnectionReason.asc().nullsLast().op("text_ops")),
	index("retell_ai_call_logs_duration_idx").using("btree", table.duration.asc().nullsLast().op("text_ops")),
	index("retell_ai_call_logs_meta_data_idx").using("btree", table.metaData.asc().nullsLast().op("text_ops")),
	index("retell_ai_call_logs_patient_id_idx").using("btree", table.patientId.asc().nullsLast().op("int4_ops")),
	index("retell_ai_call_logs_recording_url_idx").using("btree", table.recordingUrl.asc().nullsLast().op("text_ops")),
	index("retell_ai_call_logs_task_id_idx").using("btree", table.taskId.asc().nullsLast().op("int4_ops")),
	index("retell_ai_call_logs_time_idx").using("btree", table.time.asc().nullsLast().op("text_ops")),
	index("retell_ai_call_logs_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("retell_ai_call_logs_user_sentiment_idx").using("btree", table.userSentiment.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "retell_ai_call_logs_patient_id_patients_id_fk"
		}),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "retell_ai_call_logs_task_id_tasks_id_fk"
		}),
]);

export const intakeFormTemplates = pgTable("intake_form_templates", {
	id: serial().primaryKey().notNull(),
	categoryId: integer("category_id"),
	code: varchar({ length: 50 }),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	image: varchar({ length: 512 }),
	buttonText: varchar("button_text", { length: 255 }),
	pages: jsonb().notNull(),
	consentContent: text("consent_content"),
	consentSignUrl: varchar("consent_sign_url", { length: 512 }),
	previewContent: text("preview_content"),
	requireConsent: boolean("require_consent").default(false),
	pdfDescription: text("pdf_description"),
	showThankyouPage: boolean("show_thankyou_page").default(false),
	formSubmitBackLink: varchar("form_submit_back_link", { length: 255 }),
	reviewDescription: text("review_description"),
	formSubmittedContent: text("form_submitted_content"),
	version: integer().default(1),
	isPublished: boolean("is_published").default(false),
	isDraft: boolean("is_draft").default(true),
	createdBy: integer("created_by"),
	updatedBy: integer("updated_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("intake_form_templates_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("intake_form_templates_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("intake_form_templates_is_published_idx").using("btree", table.isPublished.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "intake_form_templates_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "intake_form_templates_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "intake_form_templates_updated_by_users_id_fk"
		}),
	unique("intake_form_templates_code_unique").on(table.code),
]);

export const categories = pgTable("categories", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	description: text(),
	image: varchar({ length: 512 }),
	medications: jsonb(),
}, (table) => [
	index("categories_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("categories_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("categories_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	unique("categories_code_unique").on(table.code),
]);

export const medications = pgTable("medications", {
	id: serial().primaryKey().notNull(),
	serviceType: varchar("service_type", { length: 255 }).notNull(),
	tag: varchar({ length: 255 }).notNull(),
	isActive: boolean("is_active").default(true),
	supplierId: integer("supplier_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	planId: integer("plan_id"),
	title: varchar({ length: 255 }),
	description: text(),
	subTitle: varchar("sub_title", { length: 255 }),
	administrationType: varchar("administration_type", { length: 255 }),
	priceType: varchar("price_type", { length: 255 }),
	priceHint: varchar("price_Hint", { length: 255 }),
	faqs: jsonb(),
}, (table) => [
	index("medications_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("medications_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("int4_ops")),
	index("medications_service_type_idx").using("btree", table.serviceType.asc().nullsLast().op("text_ops")),
	index("medications_supplier_id_idx").using("btree", table.supplierId.asc().nullsLast().op("int4_ops")),
	index("medications_tag_idx").using("btree", table.tag.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "medications_supplier_id_suppliers_id_fk"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.id],
			name: "medications_plan_id_plans_id_fk"
		}),
]);

export const plans = pgTable("plans", {
	id: serial().primaryKey().notNull(),
	categoryId: integer("category_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	package: varchar({ length: 255 }),
	firstPrescriptionDiscountAmount: numeric("first_prescription_discount_amount", { precision: 10, scale:  2 }),
	defaultServiceType: varchar("default_service_type", { length: 255 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	medicationId: integer("medication_id").notNull(),
	durationInMonths: integer("duration_in_months").notNull(),
	summary: text(),
	features: jsonb(),
	nextSteps: jsonb("next_steps"),
	priceBreakdown: jsonb(),
	notes: text(),
	price: numeric({ precision: 10, scale:  2 }),
	priceText: varchar("price_text", { length: 255 }),
	priceHint: varchar("price_hint", { length: 255 }),
	paymentType: varchar("payment_type", { length: 255 }),
	checkoutTitle: varchar("checkout_title", { length: 255 }),
	checkoutDescription: text("checkout_description"),
	summaryTitle: varchar("summary_title", { length: 255 }),
	summaryDescription: text("summary_description"),
}, (table) => [
	index("plans_category_id_idx").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("plans_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("plans_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("plans_package_idx").using("btree", table.package.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "plans_category_id_categories_id_fk"
		}),
	foreignKey({
			columns: [table.medicationId],
			foreignColumns: [medications.id],
			name: "plans_medication_id_medications_id_fk"
		}),
]);

export const adminTreatmentItems = pgTable("admin_treatment_items", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id").notNull(),
	package: varchar({ length: 255 }),
	serviceType: varchar("service_type", { length: 255 }).notNull(),
	tag: varchar({ length: 255 }).notNull(),
	dosage: varchar({ length: 255 }).notNull(),
	sig: text().notNull(),
	scheduleDays: integer("schedule_days"),
	title: text().notNull(),
	description: text(),
	quantity: integer(),
	images: json(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	cost: numeric({ precision: 10, scale:  2 }).notNull(),
	supplierId: integer("supplier_id"),
	supplierCost: numeric("supplier_cost", { precision: 10, scale:  2 }),
	isPatientChargable: boolean("is_patient_chargable").default(false),
	isPatientVisible: boolean("is_patient_visible").default(true),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	index("admin_treatment_items_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("admin_treatment_items_description_search_idx").using("gin", sql`to_tsvector('english'::regconfig, description)`),
	index("admin_treatment_items_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("admin_treatment_items_is_patient_chargable_idx").using("btree", table.isPatientChargable.asc().nullsLast().op("bool_ops")),
	index("admin_treatment_items_is_patient_visible_idx").using("btree", table.isPatientVisible.asc().nullsLast().op("bool_ops")),
	index("admin_treatment_items_product_id_idx").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	index("admin_treatment_items_service_type_idx").using("btree", table.serviceType.asc().nullsLast().op("text_ops")),
	index("admin_treatment_items_supplier_cost_idx").using("btree", table.supplierCost.asc().nullsLast().op("numeric_ops")),
	index("admin_treatment_items_supplier_id_idx").using("btree", table.supplierId.asc().nullsLast().op("int4_ops")),
	index("admin_treatment_items_tag_idx").using("btree", table.tag.asc().nullsLast().op("text_ops")),
	index("admin_treatment_items_title_search_idx").using("gin", sql`to_tsvector('english'::regconfig, title)`),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "admin_treatment_items_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.supplierId],
			foreignColumns: [suppliers.id],
			name: "admin_treatment_items_supplier_id_suppliers_id_fk"
		}),
]);

export const prescriptions = pgTable("prescriptions", {
	id: serial().primaryKey().notNull(),
	medicationId: integer("medication_id").notNull(),
	planId: integer("plan_id"),
	title: varchar({ length: 255 }),
	dosage: varchar({ length: 255 }).notNull(),
	sig: text().notNull(),
	quantity: integer(),
	note: text(),
	price: numeric({ precision: 10, scale:  2 }),
	supplierCost: numeric("supplier_cost", { precision: 10, scale:  2 }),
	isActive: boolean("is_active").default(true),
	refillMedicationId: integer("refill_medication_id"),
	refillFrequencyDays: integer("refill_frequency_days"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("medication_variants_dosage_idx").using("btree", table.dosage.asc().nullsLast().op("text_ops")),
	index("medication_variants_medication_id_idx").using("btree", table.medicationId.asc().nullsLast().op("int4_ops")),
	index("medication_variants_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.medicationId],
			foreignColumns: [medications.id],
			name: "prescriptions_medication_id_medications_id_fk"
		}),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [plans.id],
			name: "prescriptions_plan_id_plans_id_fk"
		}),
	foreignKey({
			columns: [table.refillMedicationId],
			foreignColumns: [medications.id],
			name: "prescriptions_refill_medication_id_medications_id_fk"
		}),
]);
