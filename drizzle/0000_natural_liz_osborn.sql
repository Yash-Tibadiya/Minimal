-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."role" AS ENUM('admin', 'provider');--> statement-breakpoint
CREATE TYPE "public"."subRole" AS ENUM('doctor', 'fitnessCoach', 'superAdmin', 'careTeam', 'admin');--> statement-breakpoint
CREATE TYPE "public"."template_type" AS ENUM('email', 'sms');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_role" varchar(255) NOT NULL,
	"action" varchar(255) NOT NULL,
	"entity_type" varchar(255) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"old_data" json,
	"new_data" json,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cal_com_webhook_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"trigger_event" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'received' NOT NULL,
	"payload" json NOT NULL,
	"processed_at" timestamp,
	"error" text,
	"task_code" varchar(255),
	"booking_id" integer,
	"cal_booking_uid" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(21),
	"email" varchar(255) NOT NULL,
	"code" varchar(8) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"description" text,
	"conditions" jsonb,
	"trigger_fields" jsonb,
	"deduplication_strategy" varchar(50) DEFAULT 'state-based',
	"min_interval_minutes" integer DEFAULT 30,
	"max_executions_per_day" integer DEFAULT 10,
	"category" varchar(100),
	"priority" integer DEFAULT 0,
	"allow_final_states" boolean DEFAULT false,
	"custom_logic" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workflow_configs_workflow_id_unique" UNIQUE("workflow_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" varchar(255) PRIMARY KEY DEFAULT 'cuid()' NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "types" (
	"id" varchar(255) PRIMARY KEY DEFAULT 'cuid()' NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255),
	"value" text,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "retell_ai_call_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"from_number" varchar(255),
	"time" varchar(255),
	"duration" varchar(255),
	"type" varchar(255),
	"cost" varchar(255),
	"call_id" varchar(255),
	"agent_id" varchar(255),
	"disconnection_reason" text,
	"call_status" text,
	"user_sentiment" text,
	"recording_url" text,
	"meta_data" text,
	"transcript" text,
	"transcript_object" json,
	"call_summary" text,
	"detailed_call_summary" text,
	"call_out_come" text,
	"customer_engagement" text,
	"abandoned_purchase_reason" text,
	"call_back_time" text,
	"start_timestamp" timestamp,
	"end_timestamp" timestamp,
	"retell_dynamic_variables" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "patient_treatment_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"image" varchar(512),
	"package" varchar(512),
	"service_type" varchar(255) NOT NULL,
	"tag" varchar(255) NOT NULL,
	"recommendations" json,
	"addons" json,
	"type" varchar(50),
	"code" varchar(255),
	"is_payable" boolean DEFAULT true,
	"payment_status" varchar(50) DEFAULT 'Unpaid' NOT NULL,
	"price" real NOT NULL,
	"discount_code" varchar(255),
	"discount_amount" real DEFAULT 0,
	"provider_id" integer NOT NULL,
	"patient_id" integer NOT NULL,
	"stripe_id" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"role" "role",
	"user_id" integer NOT NULL,
	"is_hidden" boolean DEFAULT false,
	"patient_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" integer PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"code" varchar(255),
	"profile_picture" varchar(255),
	"birth_date" timestamp,
	"user_id" integer NOT NULL,
	"phone_number" varchar(255) NOT NULL,
	"services" text,
	"bio" text,
	"country" varchar(255),
	"address" varchar(255),
	"city" varchar(255),
	"state" varchar(255),
	"zip_code" varchar(255),
	"timezone" varchar(255),
	"npi_number" varchar(255),
	"title" varchar(255),
	"medical_license" json,
	"practice_information" json,
	"business_hours" json,
	"signature" varchar(255),
	"account_number" varchar(255),
	"routing_number" varchar(255),
	"send_email_notification" boolean DEFAULT true,
	"email_notification" varchar(255),
	"send_sms_notification" boolean DEFAULT true,
	"phone_number_notification" varchar(255),
	"form_address" json,
	"is_flat_amount" boolean DEFAULT false,
	"flat_amount" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"is_online" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"patient_call_mediums" jsonb
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone_number" varchar(255),
	"profile_picture" varchar(255),
	"user_id" integer,
	"role" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"company_cost" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"payment_method" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "active_workflow_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" varchar(255) NOT NULL,
	"patient_code" varchar(255) NOT NULL,
	"task_id" varchar(255),
	"novu_transaction_id" varchar(255),
	"state_fingerprint" varchar(500),
	"trigger_data" jsonb,
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflow_execution_counters" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" varchar(255) NOT NULL,
	"patient_code" varchar(255) NOT NULL,
	"task_id" varchar(255),
	"date" varchar(10) NOT NULL,
	"execution_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"failure_count" integer DEFAULT 0,
	"skip_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"cancelled_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "workflow_execution_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_config_id" integer,
	"workflow_id" varchar(255) NOT NULL,
	"patient_code" varchar(255) NOT NULL,
	"task_id" varchar(255),
	"trigger_reason" varchar(255),
	"changed_fields" jsonb,
	"execution_data" jsonb,
	"conditions_snapshot" jsonb,
	"status" varchar(50) NOT NULL,
	"novu_transaction_id" varchar(255),
	"novu_response" jsonb,
	"error" text,
	"skip_reason" text,
	"execution_time_ms" integer,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"state_fingerprint" varchar(500),
	"cancelled_at" timestamp,
	"cancelled_reason" text
);
--> statement-breakpoint
CREATE TABLE "admin_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(255) NOT NULL,
	"gross_revenue" numeric(10, 2) NOT NULL,
	"net_revenue" numeric(10, 2) NOT NULL,
	"total_payments" numeric(10, 2) NOT NULL,
	"stripe_fees" numeric(10, 2) NOT NULL,
	"google_ad_spend" numeric(10, 2) DEFAULT '0',
	"meta_ad_spend" numeric(10, 2) DEFAULT '0',
	"bing_ad_spend" numeric(10, 2) DEFAULT '0',
	"cost_zenith" numeric(10, 2) DEFAULT '0',
	"support_amount" numeric(10, 2) DEFAULT '0',
	"provider_per_consult_fees" numeric(10, 2) DEFAULT '0',
	"provider_flat_fees" numeric(10, 2) DEFAULT '0',
	"gross_profit" numeric(10, 2) DEFAULT '0',
	"roas" numeric(10, 2) DEFAULT '0',
	"cpa_amount" numeric(10, 2) DEFAULT '0',
	"clicks" numeric(10, 2) DEFAULT '0',
	"conversion_rate" numeric(10, 2) DEFAULT '0',
	"intake_submits" numeric(10, 2) DEFAULT '0',
	"intake_conversion_rate" numeric(10, 2) DEFAULT '0',
	"miscellaneous_amount" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"role" "role",
	"user_id" integer NOT NULL,
	"commentable_type" varchar(255) NOT NULL,
	"commentable_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "admin_treatment_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"package" varchar(255),
	"service_type" varchar(255) NOT NULL,
	"tag" varchar(255) NOT NULL,
	"dosage" varchar(255) NOT NULL,
	"sig" text NOT NULL,
	"schedule_days" integer,
	"title" text NOT NULL,
	"description" text,
	"quantity" integer,
	"images" json,
	"amount" numeric(10, 2) NOT NULL,
	"cost" numeric(10, 2) NOT NULL,
	"supplier_id" integer,
	"supplier_cost" numeric(10, 2),
	"is_patient_chargable" boolean DEFAULT false,
	"is_patient_visible" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "app_sessions" (
	"var_name" text PRIMARY KEY NOT NULL,
	"var_value" text
);
--> statement-breakpoint
CREATE TABLE "cal_com_event_matrix_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_type" varchar(255) NOT NULL,
	"tag" varchar(255) NOT NULL,
	"link" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"state_id" bigint NOT NULL,
	"state_code" varchar(255),
	"country_id" bigint NOT NULL,
	"country_code" varchar(2),
	"latitude" varchar(255),
	"longitude" varchar(255),
	"created_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"flag" smallint DEFAULT 1 NOT NULL,
	"wikiDataId" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"iso3" varchar(3),
	"numeric_code" varchar(3),
	"iso2" varchar(5),
	"phonecode" varchar(255),
	"capital" varchar(255),
	"currency" varchar(255),
	"currency_name" varchar(255),
	"currency_symbol" varchar(255),
	"tld" varchar(255),
	"native" varchar(255),
	"region" varchar(255),
	"region_id" bigint,
	"subregion" varchar(255),
	"subregion_id" bigint,
	"nationality" varchar(255),
	"timezones" text,
	"translations" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"emoji" varchar(191),
	"emojiU" varchar(191),
	"created_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"flag" smallint DEFAULT 1 NOT NULL,
	"wikiDataId" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"sender_id" integer NOT NULL,
	"sender_type" varchar(255) NOT NULL,
	"receiver_id" integer NOT NULL,
	"receiver_type" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "provider_priorities" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"state" varchar(255) NOT NULL,
	"priority" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "providers_service_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" bigint NOT NULL,
	"tags" varchar(255),
	"type" varchar(255),
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"user_id" varchar(21) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50),
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"full_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"otp" varchar(255),
	"state" varchar(20),
	"country" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp,
	"address" varchar(255),
	"zip_code" varchar(20),
	"city" varchar(255),
	"credit_card_updated_at" timestamp,
	"intake_form_submitted" integer DEFAULT 0,
	"dob" date,
	"utm_params" json,
	"tracking_params" json,
	"gclid" varchar(255),
	"fbclid" varchar(255),
	"is_subscribed" boolean DEFAULT true,
	"timezone" varchar(255),
	"ghlcontact_id" varchar(255),
	"brand_code" varchar(255) DEFAULT 'minimal',
	CONSTRAINT "patients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "provider_medical_license" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"country" varchar(255),
	"state" varchar(255),
	"license_number" varchar(255),
	"license_expiration_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "provider_business_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"day" varchar(255),
	"start_time" varchar(255),
	"end_time" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"country_id" bigint NOT NULL,
	"country_code" varchar(2),
	"fips_code" varchar(255),
	"iso2" varchar(5),
	"type" varchar(255),
	"latitude" varchar(255),
	"longitude" varchar(255),
	"created_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"flag" smallint DEFAULT 1 NOT NULL,
	"wikiDataId" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "patient_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_id" text,
	"patient_id" integer NOT NULL,
	"status" text NOT NULL,
	"amount" numeric NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"html" varchar(65535),
	"editor_state" varchar(65535),
	"state" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "provider_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_code" varchar(255) NOT NULL,
	"provider_id" integer NOT NULL,
	"payment_date" timestamp NOT NULL,
	"payment_amount" real NOT NULL,
	"payment_method" json,
	"status" varchar(255) NOT NULL,
	"payment_ref_number" varchar(255),
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(255),
	"type" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"file_type" varchar(255) NOT NULL,
	"patient_visible" boolean DEFAULT true,
	"provider_id" integer,
	"patient_id" integer NOT NULL,
	"valid_till" timestamp,
	"pets" json,
	"editor_state" varchar(65535),
	"html" varchar(65535),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"hashed_password" varchar(255),
	"avatar" varchar(255),
	"role" "role",
	"sub_role" "subRole",
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "intake_form_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"questions" jsonb,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "intake_form_config_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_type" varchar(255) NOT NULL,
	"tag" varchar(255) NOT NULL,
	"package" varchar(255),
	"name" varchar(255),
	"is_active" boolean DEFAULT true,
	"supplier_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image" varchar(512),
	"duration_in_days" integer,
	"package" varchar(255),
	"duration_in_months" integer,
	"service_type" varchar(255),
	"tag" varchar(255),
	"popular_product" integer,
	"recommendations" json,
	"addons" json,
	"type" varchar(50) NOT NULL,
	"is_payable" boolean DEFAULT true,
	"price" numeric(10, 2),
	"discount" numeric(10, 2),
	"discount_type" varchar(20),
	"stripe_id" text,
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer,
	"patient_id" integer,
	"provider_id" integer NOT NULL,
	"amount" real,
	"total_amount" real NOT NULL,
	"patient_amount" real NOT NULL,
	"support_amount" real NOT NULL,
	"others_amount" real NOT NULL,
	"processing_amount" real NOT NULL,
	"ssc_amount" real NOT NULL,
	"provider_amount" real NOT NULL,
	"status" varchar(255) NOT NULL,
	"payment_code" varchar(255),
	"admin_notes" varchar(65535),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "patient_intake_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"is_provider_present" boolean DEFAULT false,
	"information" json,
	"last_step" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"form_config_id" integer NOT NULL,
	"form_id" varchar(50) NOT NULL,
	"response" json,
	"is_completed_one_time" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "notification_timing" (
	"id" serial PRIMARY KEY NOT NULL,
	"setting_id" integer NOT NULL,
	"notification_number" integer NOT NULL,
	"delay_hours" numeric(10, 2) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"notification_number" integer NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(50) DEFAULT 'success' NOT NULL,
	"channel" varchar(50) DEFAULT 'email' NOT NULL,
	"setting_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(255),
	"service_type" varchar(255) NOT NULL,
	"tag" varchar(255) NOT NULL,
	"package" varchar(255),
	"state" varchar(255),
	"status" varchar(255) NOT NULL,
	"call_status" varchar(255),
	"call_note" text,
	"start_date" timestamp,
	"due_date" timestamp,
	"completed_date" timestamp,
	"payment_date" timestamp,
	"amount" real,
	"is_assigned" boolean DEFAULT false,
	"is_payment" boolean,
	"payment_status" varchar(255) DEFAULT 'Unpaid' NOT NULL,
	"total_amount" real,
	"patient_amount" real,
	"support_amount" real,
	"others_amount" real,
	"processing_amount" real,
	"ssc_amount" real,
	"provider_amount" real,
	"discount_amount" real,
	"stripe_transaction_id" varchar(255),
	"discount_code" varchar(255),
	"utm_params" json,
	"tracking_params" json,
	"provider_id" integer,
	"patient_id" integer,
	"is_subscription" boolean DEFAULT false,
	"subscription_method" varchar(255),
	"patient_product_id" integer,
	"dosage" text,
	"sig" text,
	"is_active" boolean DEFAULT true,
	"is_submitted_pharmacy" boolean DEFAULT false,
	"patient_task_status" varchar(255),
	"actions" json,
	"is_visible" boolean DEFAULT true,
	"cal_booking_uid" varchar(255),
	"booking_id" integer,
	"booking_trigger_event" varchar(255),
	"booking_created_at" timestamp,
	"booking_start_time" timestamp,
	"booking_end_time" timestamp,
	"organizer_name" varchar(255),
	"organizer_email" varchar(255),
	"cal_com_url" varchar(255),
	"booking_status" varchar(255),
	"booking_reason" text,
	"reschedule_reason" text,
	"cancellation_reason" text,
	"cancelled_by" varchar(255),
	"rescheduled_by" varchar(255),
	"cancelled_at" timestamp,
	"rescheduled_at" timestamp,
	"cal_attendees" json,
	"cal_booking_payload" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"medicine_input" varchar(255),
	"checkout_product_id" integer,
	"deleted_at" timestamp,
	"admin_note" text,
	"product_info" json,
	"product_tracking_link" varchar(255),
	"amount_meta_data" jsonb,
	"payment_reason" text,
	"supplier_id" integer,
	"prescription_delivery_date" timestamp,
	"title" text,
	"description" text,
	"quantity" integer,
	"notifications_count" integer DEFAULT 0,
	"next_notification_at" timestamp,
	"max_notifications" integer DEFAULT 3,
	"notification_setting_id" integer,
	"is_refill" boolean DEFAULT true,
	"brand_code" varchar(255) DEFAULT 'minimal'
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"max_notifications" integer DEFAULT 3 NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"tag" jsonb,
	"status" jsonb
);
--> statement-breakpoint
CREATE TABLE "retell_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer,
	"task_id" integer,
	"agent" varchar(255),
	"payload" jsonb,
	"error" varchar(255),
	"status" varchar(255) DEFAULT 'pending',
	"recieved_at" timestamp,
	"processed_at" timestamp,
	"queue_name" varchar(255) DEFAULT 'active',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "caller_numbers" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"max_daily_utilization" integer DEFAULT 149 NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_late_night" boolean DEFAULT false,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"brand_code" varchar(255) DEFAULT 'minimal',
	"agent_name" varchar(255),
	"agent_id" varchar(255),
	CONSTRAINT "caller_numbers_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	"brand_code" varchar(255) DEFAULT 'leafyrx',
	"url" varchar(255),
	"webhook_url" varchar(255),
	"email_layout" text,
	"smtp_host" varchar(255),
	"smtp_port" integer,
	"smtp_user" varchar(255),
	"smtp_password" varchar(255),
	"smtp_from_email" varchar(255),
	"checkout_link" varchar(255),
	"twilio_account_sid" varchar(255),
	"twilio_auth_token" varchar(255),
	"twilio_from_number" varchar(255),
	"twilio_twiml_app_sid" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "template_type" NOT NULL,
	"brand_code" varchar(50) DEFAULT 'leafyrx' NOT NULL,
	"heading1" varchar(500),
	"heading2" varchar(500),
	"title" varchar(500),
	"preview" varchar(255),
	"content" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(100),
	"updated_by" varchar(100),
	CONSTRAINT "notification_templates_template_key_unique" UNIQUE("template_key")
);
--> statement-breakpoint
ALTER TABLE "retell_ai_call_logs" ADD CONSTRAINT "retell_ai_call_logs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retell_ai_call_logs" ADD CONSTRAINT "retell_ai_call_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_treatment_plans" ADD CONSTRAINT "patient_treatment_plans_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_treatment_plans" ADD CONSTRAINT "patient_treatment_plans_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution_logs" ADD CONSTRAINT "workflow_execution_logs_workflow_config_id_workflow_configs_id_" FOREIGN KEY ("workflow_config_id") REFERENCES "public"."workflow_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_treatment_items" ADD CONSTRAINT "admin_treatment_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_treatment_items" ADD CONSTRAINT "admin_treatment_items_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_priorities" ADD CONSTRAINT "provider_priorities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_priorities" ADD CONSTRAINT "provider_priorities_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers_service_pricing" ADD CONSTRAINT "providers_service_pricing_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_medical_license" ADD CONSTRAINT "provider_medical_license_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_business_hours" ADD CONSTRAINT "provider_business_hours_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_payments" ADD CONSTRAINT "provider_payments_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_intake_forms" ADD CONSTRAINT "patient_intake_forms_form_config_id_intake_form_config_id_fk" FOREIGN KEY ("form_config_id") REFERENCES "public"."intake_form_config"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_intake_forms" ADD CONSTRAINT "patient_intake_forms_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_timing" ADD CONSTRAINT "notification_timing_setting_id_notification_settings_id_fk" FOREIGN KEY ("setting_id") REFERENCES "public"."notification_settings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_notifications" ADD CONSTRAINT "task_notifications_setting_id_notification_settings_id_fk" FOREIGN KEY ("setting_id") REFERENCES "public"."notification_settings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_notification_setting_id_notification_settings_id_fk" FOREIGN KEY ("notification_setting_id") REFERENCES "public"."notification_settings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retell_jobs" ADD CONSTRAINT "retell_jobs_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_log_action_idx" ON "activity_logs" USING btree ("action" text_ops);--> statement-breakpoint
CREATE INDEX "activity_log_created_at_idx" ON "activity_logs" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "activity_log_description_search_idx" ON "activity_logs" USING gin (to_tsvector('english'::regconfig, description) tsvector_ops);--> statement-breakpoint
CREATE INDEX "activity_log_entity_id_idx" ON "activity_logs" USING btree ("entity_id" text_ops);--> statement-breakpoint
CREATE INDEX "activity_log_entity_type_action_idx" ON "activity_logs" USING btree ("entity_type" text_ops,"action" text_ops);--> statement-breakpoint
CREATE INDEX "activity_log_entity_type_idx" ON "activity_logs" USING btree ("entity_type" text_ops);--> statement-breakpoint
CREATE INDEX "activity_log_user_action_idx" ON "activity_logs" USING btree ("user_id" text_ops,"action" text_ops);--> statement-breakpoint
CREATE INDEX "activity_log_user_id_idx" ON "activity_logs" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "activity_log_user_role_idx" ON "activity_logs" USING btree ("user_role" text_ops);--> statement-breakpoint
CREATE INDEX "cal_com_webhook_logs_booking_id_idx" ON "cal_com_webhook_logs" USING btree ("booking_id" int4_ops);--> statement-breakpoint
CREATE INDEX "cal_com_webhook_logs_cal_booking_uid_idx" ON "cal_com_webhook_logs" USING btree ("cal_booking_uid" text_ops);--> statement-breakpoint
CREATE INDEX "cal_com_webhook_logs_created_at_idx" ON "cal_com_webhook_logs" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "cal_com_webhook_logs_status_idx" ON "cal_com_webhook_logs" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "cal_com_webhook_logs_task_code_idx" ON "cal_com_webhook_logs" USING btree ("task_code" text_ops);--> statement-breakpoint
CREATE INDEX "cal_com_webhook_logs_trigger_event_idx" ON "cal_com_webhook_logs" USING btree ("trigger_event" text_ops);--> statement-breakpoint
CREATE INDEX "verification_code_email_idx" ON "email_verification_codes" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "verification_code_user_idx" ON "email_verification_codes" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "workflow_configs_active_idx" ON "workflow_configs" USING btree ("active" bool_ops);--> statement-breakpoint
CREATE INDEX "workflow_configs_category_idx" ON "workflow_configs" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "workflow_configs_priority_idx" ON "workflow_configs" USING btree ("priority" int4_ops);--> statement-breakpoint
CREATE INDEX "workflow_configs_workflow_id_idx" ON "workflow_configs" USING btree ("workflow_id" text_ops);--> statement-breakpoint
CREATE INDEX "tag_name_idx" ON "tags" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "type_name_idx" ON "types" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "settings_key_idx" ON "settings" USING btree ("key" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_call_id_idx" ON "retell_ai_call_logs" USING btree ("call_id" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_call_status_idx" ON "retell_ai_call_logs" USING btree ("call_status" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_cost_idx" ON "retell_ai_call_logs" USING btree ("cost" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_created_at_idx" ON "retell_ai_call_logs" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_disconnection_reason_idx" ON "retell_ai_call_logs" USING btree ("disconnection_reason" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_duration_idx" ON "retell_ai_call_logs" USING btree ("duration" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_meta_data_idx" ON "retell_ai_call_logs" USING btree ("meta_data" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_patient_id_idx" ON "retell_ai_call_logs" USING btree ("patient_id" int4_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_recording_url_idx" ON "retell_ai_call_logs" USING btree ("recording_url" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_task_id_idx" ON "retell_ai_call_logs" USING btree ("task_id" int4_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_time_idx" ON "retell_ai_call_logs" USING btree ("time" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_type_idx" ON "retell_ai_call_logs" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "retell_ai_call_logs_user_sentiment_idx" ON "retell_ai_call_logs" USING btree ("user_sentiment" text_ops);--> statement-breakpoint
CREATE INDEX "treatment_plan_is_active_idx" ON "patient_treatment_plans" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "treatment_plan_is_payable_idx" ON "patient_treatment_plans" USING btree ("is_payable" bool_ops);--> statement-breakpoint
CREATE INDEX "treatment_plan_patient_id_idx" ON "patient_treatment_plans" USING btree ("patient_id" int4_ops);--> statement-breakpoint
CREATE INDEX "treatment_plan_payment_status_idx" ON "patient_treatment_plans" USING btree ("payment_status" text_ops);--> statement-breakpoint
CREATE INDEX "treatment_plan_provider_id_idx" ON "patient_treatment_plans" USING btree ("provider_id" int4_ops);--> statement-breakpoint
CREATE INDEX "treatment_plan_service_type_idx" ON "patient_treatment_plans" USING btree ("service_type" text_ops);--> statement-breakpoint
CREATE INDEX "treatment_plan_stripe_id_idx" ON "patient_treatment_plans" USING btree ("stripe_id" text_ops);--> statement-breakpoint
CREATE INDEX "treatment_plan_tag_idx" ON "patient_treatment_plans" USING btree ("tag" text_ops);--> statement-breakpoint
CREATE INDEX "treatment_plan_type_idx" ON "patient_treatment_plans" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "tbl_is_hidden_idx" ON "notes" USING btree ("is_hidden" bool_ops);--> statement-breakpoint
CREATE INDEX "tbl_user_id_idx" ON "notes" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "tbl_user_type_idx" ON "notes" USING btree ("role" enum_ops);--> statement-breakpoint
CREATE INDEX "first_name_search_index" ON "providers" USING gin (to_tsvector('english'::regconfig, (first_name)::text) tsvector_ops);--> statement-breakpoint
CREATE INDEX "last_name_search_index" ON "providers" USING gin (to_tsvector('english'::regconfig, (last_name)::text) tsvector_ops);--> statement-breakpoint
CREATE INDEX "providers_city_idx" ON "providers" USING btree ("city" text_ops);--> statement-breakpoint
CREATE INDEX "providers_code_idx" ON "providers" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "providers_country_idx" ON "providers" USING btree ("country" text_ops);--> statement-breakpoint
CREATE INDEX "providers_state_idx" ON "providers" USING btree ("state" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_providers_user_id" ON "providers" USING btree ("user_id" int4_ops,"id" int4_ops);--> statement-breakpoint
CREATE INDEX "name_idx" ON "admins" USING gin (to_tsvector('english'::regconfig, (name)::text) tsvector_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_email" ON "admins" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_id" ON "admins" USING btree ("user_id" int4_ops,"id" int4_ops);--> statement-breakpoint
CREATE INDEX "customers_patient_id_idx" ON "customers" USING btree ("patient_id" int4_ops);--> statement-breakpoint
CREATE INDEX "customers_stripe_customer_id_idx" ON "customers" USING btree ("stripe_customer_id" text_ops);--> statement-breakpoint
CREATE INDEX "active_executions_novu_transaction_idx" ON "active_workflow_executions" USING btree ("novu_transaction_id" text_ops);--> statement-breakpoint
CREATE INDEX "active_executions_status_idx" ON "active_workflow_executions" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "active_executions_workflow_patient_idx" ON "active_workflow_executions" USING btree ("workflow_id" text_ops,"patient_code" text_ops,"task_id" text_ops);--> statement-breakpoint
CREATE INDEX "workflow_counters_date_idx" ON "workflow_execution_counters" USING btree ("date" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_counters_unique_daily_idx" ON "workflow_execution_counters" USING btree ("workflow_id" text_ops,"patient_code" text_ops,"task_id" text_ops,"date" text_ops);--> statement-breakpoint
CREATE INDEX "workflow_counters_workflow_id_idx" ON "workflow_execution_counters" USING btree ("workflow_id" text_ops);--> statement-breakpoint
CREATE INDEX "workflow_execution_config_id_idx" ON "workflow_execution_logs" USING btree ("workflow_config_id" int4_ops);--> statement-breakpoint
CREATE INDEX "workflow_execution_created_at_idx" ON "workflow_execution_logs" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "workflow_execution_state_fingerprint_idx" ON "workflow_execution_logs" USING btree ("state_fingerprint" text_ops);--> statement-breakpoint
CREATE INDEX "workflow_execution_status_idx" ON "workflow_execution_logs" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "workflow_execution_workflow_patient_task_idx" ON "workflow_execution_logs" USING btree ("workflow_id" text_ops,"patient_code" text_ops,"task_id" text_ops);--> statement-breakpoint
CREATE INDEX "workflow_execution_workflow_state_idx" ON "workflow_execution_logs" USING btree ("workflow_id" text_ops,"patient_code" text_ops,"task_id" text_ops,"state_fingerprint" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "comments_commentable_id_idx" ON "comments" USING btree ("commentable_id" text_ops);--> statement-breakpoint
CREATE INDEX "comments_commentable_type_idx" ON "comments" USING btree ("commentable_type" text_ops);--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "comments" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "comments_user_type_idx" ON "comments" USING btree ("role" enum_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_created_at_idx" ON "admin_treatment_items" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_description_search_idx" ON "admin_treatment_items" USING gin (to_tsvector('english'::regconfig, description) tsvector_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_is_active_idx" ON "admin_treatment_items" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_is_patient_chargable_idx" ON "admin_treatment_items" USING btree ("is_patient_chargable" bool_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_is_patient_visible_idx" ON "admin_treatment_items" USING btree ("is_patient_visible" bool_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_product_id_idx" ON "admin_treatment_items" USING btree ("product_id" int4_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_service_type_idx" ON "admin_treatment_items" USING btree ("service_type" text_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_supplier_cost_idx" ON "admin_treatment_items" USING btree ("supplier_cost" numeric_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_supplier_id_idx" ON "admin_treatment_items" USING btree ("supplier_id" int4_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_tag_idx" ON "admin_treatment_items" USING btree ("tag" text_ops);--> statement-breakpoint
CREATE INDEX "admin_treatment_items_title_search_idx" ON "admin_treatment_items" USING gin (to_tsvector('english'::regconfig, title) tsvector_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "provider_state_priority_idx" ON "provider_priorities" USING btree ("provider_id" int4_ops,"state" int4_ops);--> statement-breakpoint
CREATE INDEX "provider_tags_type_idx" ON "providers_service_pricing" USING btree ("provider_id" text_ops,"tags" int8_ops,"type" int8_ops);--> statement-breakpoint
CREATE INDEX "password_token_expires_at_idx" ON "password_reset_tokens" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "password_token_user_idx" ON "password_reset_tokens" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "patients_code_idx" ON "patients" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "patients_country_idx" ON "patients" USING btree ("country" text_ops);--> statement-breakpoint
CREATE INDEX "patients_email_idx" ON "patients" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "patients_phone_idx" ON "patients" USING btree ("phone" text_ops);--> statement-breakpoint
CREATE INDEX "patients_state_idx" ON "patients" USING btree ("state" text_ops);--> statement-breakpoint
CREATE INDEX "patient_payments_payment_id_idx" ON "patient_payments" USING btree ("payment_id" text_ops);--> statement-breakpoint
CREATE INDEX "patient_payments_status_idx" ON "patient_payments" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "templates_name_idx" ON "templates" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "provider_payment_payment_code_idx" ON "provider_payments" USING btree ("payment_code" text_ops);--> statement-breakpoint
CREATE INDEX "provider_payment_provider_id_idx" ON "provider_payments" USING btree ("provider_id" int4_ops);--> statement-breakpoint
CREATE INDEX "provider_payment_status_idx" ON "provider_payments" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "document_code_idx" ON "documents" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "document_file_type_idx" ON "documents" USING btree ("file_type" text_ops);--> statement-breakpoint
CREATE INDEX "document_id_idx" ON "documents" USING btree ("id" int4_ops);--> statement-breakpoint
CREATE INDEX "document_name_idx" ON "documents" USING gin (to_tsvector('english'::regconfig, (name)::text) tsvector_ops);--> statement-breakpoint
CREATE INDEX "document_patient_id_idx" ON "documents" USING btree ("patient_id" int4_ops);--> statement-breakpoint
CREATE INDEX "document_patient_visible_idx" ON "documents" USING btree ("patient_visible" bool_ops);--> statement-breakpoint
CREATE INDEX "document_provider_id_idx" ON "documents" USING btree ("provider_id" int4_ops);--> statement-breakpoint
CREATE INDEX "document_type_idx" ON "documents" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "document_valid_till_idx" ON "documents" USING btree ("valid_till" timestamp_ops);--> statement-breakpoint
CREATE INDEX "title_search_index" ON "users" USING gin (to_tsvector('english'::regconfig, (name)::text) tsvector_ops);--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "user_id_idx" ON "users" USING btree ("id" int4_ops,"role" enum_ops);--> statement-breakpoint
CREATE INDEX "user_is_active_idx" ON "users" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "user_sub_role_idx" ON "users" USING btree ("sub_role" enum_ops);--> statement-breakpoint
CREATE INDEX "intake_form_config_code_idx" ON "intake_form_config" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "intake_form_config_title_idx" ON "intake_form_config" USING btree ("title" text_ops);--> statement-breakpoint
CREATE INDEX "medications_is_active_idx" ON "medications" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "medications_service_type_idx" ON "medications" USING btree ("service_type" text_ops);--> statement-breakpoint
CREATE INDEX "medications_supplier_id_idx" ON "medications" USING btree ("supplier_id" int4_ops);--> statement-breakpoint
CREATE INDEX "medications_tag_idx" ON "medications" USING btree ("tag" text_ops);--> statement-breakpoint
CREATE INDEX "products_discount_type_idx" ON "products" USING btree ("discount_type" text_ops);--> statement-breakpoint
CREATE INDEX "products_is_enabled_idx" ON "products" USING btree ("is_enabled" bool_ops);--> statement-breakpoint
CREATE INDEX "products_service_type_idx" ON "products" USING btree ("service_type" text_ops);--> statement-breakpoint
CREATE INDEX "products_stripe_id_idx" ON "products" USING btree ("stripe_id" text_ops);--> statement-breakpoint
CREATE INDEX "products_tag_idx" ON "products" USING btree ("tag" text_ops);--> statement-breakpoint
CREATE INDEX "products_type_idx" ON "products" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "sessions" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "sessions" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "transaction_payment_code_idx" ON "transactions" USING btree ("payment_code" text_ops);--> statement-breakpoint
CREATE INDEX "transaction_provider_id_idx" ON "transactions" USING btree ("provider_id" int4_ops);--> statement-breakpoint
CREATE INDEX "transaction_status_idx" ON "transactions" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "patient_intake_forms_is_provider_present_idx" ON "patient_intake_forms" USING btree ("is_provider_present" bool_ops);--> statement-breakpoint
CREATE INDEX "patient_intake_forms_patient_id_idx" ON "patient_intake_forms" USING btree ("patient_id" int4_ops);--> statement-breakpoint
CREATE INDEX "notification_timing_setting_id_idx" ON "notification_timing" USING btree ("setting_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "notification_timing_setting_id_notification_number_idx" ON "notification_timing" USING btree ("setting_id" int4_ops,"notification_number" int4_ops);--> statement-breakpoint
CREATE INDEX "task_notifications_sent_at_idx" ON "task_notifications" USING btree ("sent_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "task_notifications_status_idx" ON "task_notifications" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "task_notifications_task_id_idx" ON "task_notifications" USING btree ("task_id" int4_ops);--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "tasks" USING btree ("booking_status" text_ops);--> statement-breakpoint
CREATE INDEX "booking_trigger_event_idx" ON "tasks" USING btree ("booking_trigger_event" text_ops);--> statement-breakpoint
CREATE INDEX "task_booking_id_idx" ON "tasks" USING btree ("booking_id" int4_ops);--> statement-breakpoint
CREATE INDEX "task_cal_booking_uid_idx" ON "tasks" USING btree ("cal_booking_uid" text_ops);--> statement-breakpoint
CREATE INDEX "task_call_status_idx" ON "tasks" USING btree ("call_status" text_ops);--> statement-breakpoint
CREATE INDEX "task_code_idx" ON "tasks" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "task_completed_date_idx" ON "tasks" USING btree ("completed_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "task_due_date_idx" ON "tasks" USING btree ("due_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "task_is_active_idx" ON "tasks" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "task_is_assigned_idx" ON "tasks" USING btree ("is_assigned" bool_ops);--> statement-breakpoint
CREATE INDEX "task_is_payment_idx" ON "tasks" USING btree ("is_payment" bool_ops);--> statement-breakpoint
CREATE INDEX "task_is_visible_idx" ON "tasks" USING btree ("is_visible" bool_ops);--> statement-breakpoint
CREATE INDEX "task_payment_status_idx" ON "tasks" USING btree ("payment_status" text_ops);--> statement-breakpoint
CREATE INDEX "task_product_id_idx" ON "tasks" USING btree ("patient_product_id" int4_ops);--> statement-breakpoint
CREATE INDEX "task_service_type_idx" ON "tasks" USING btree ("service_type" text_ops);--> statement-breakpoint
CREATE INDEX "task_start_date_idx" ON "tasks" USING btree ("start_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "task_state_idx" ON "tasks" USING btree ("state" text_ops);--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "tasks" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "task_tag_idx" ON "tasks" USING btree ("tag" text_ops);--> statement-breakpoint
CREATE INDEX "task_type_idx" ON "tasks" USING btree ("service_type" text_ops);--> statement-breakpoint
CREATE INDEX "task_user_idx" ON "tasks" USING btree ("id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "notification_settings_name_type_idx" ON "notification_settings" USING btree ("name" text_ops,"type" text_ops);--> statement-breakpoint
CREATE INDEX "brand_code_idx" ON "brands" USING btree ("brand_code" text_ops);
*/