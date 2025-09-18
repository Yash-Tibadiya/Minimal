import { relations } from "drizzle-orm/relations";
import { patients, retellAiCallLogs, tasks, patientTreatmentPlans, providers, notes, users, admins, customers, workflowConfigs, workflowExecutionLogs, products, adminTreatmentItems, suppliers, providerPriorities, providersServicePricing, providerMedicalLicense, providerBusinessHours, providerPayments, documents, medications, sessions, transactions, intakeFormConfig, patientIntakeForms, notificationSettings, notificationTiming, taskNotifications, retellJobs } from "./schema";

export const retellAiCallLogsRelations = relations(retellAiCallLogs, ({one}) => ({
	patient: one(patients, {
		fields: [retellAiCallLogs.patientId],
		references: [patients.id]
	}),
	task: one(tasks, {
		fields: [retellAiCallLogs.taskId],
		references: [tasks.id]
	}),
}));

export const patientsRelations = relations(patients, ({many}) => ({
	retellAiCallLogs: many(retellAiCallLogs),
	patientTreatmentPlans: many(patientTreatmentPlans),
	notes: many(notes),
	customers: many(customers),
	documents: many(documents),
	transactions: many(transactions),
	patientIntakeForms: many(patientIntakeForms),
	tasks: many(tasks),
	retellJobs: many(retellJobs),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	retellAiCallLogs: many(retellAiCallLogs),
	transactions: many(transactions),
	patient: one(patients, {
		fields: [tasks.patientId],
		references: [patients.id]
	}),
	provider: one(providers, {
		fields: [tasks.providerId],
		references: [providers.id]
	}),
	supplier: one(suppliers, {
		fields: [tasks.supplierId],
		references: [suppliers.id]
	}),
	notificationSetting: one(notificationSettings, {
		fields: [tasks.notificationSettingId],
		references: [notificationSettings.id]
	}),
}));

export const patientTreatmentPlansRelations = relations(patientTreatmentPlans, ({one}) => ({
	patient: one(patients, {
		fields: [patientTreatmentPlans.patientId],
		references: [patients.id]
	}),
	provider: one(providers, {
		fields: [patientTreatmentPlans.providerId],
		references: [providers.id]
	}),
}));

export const providersRelations = relations(providers, ({one, many}) => ({
	patientTreatmentPlans: many(patientTreatmentPlans),
	user: one(users, {
		fields: [providers.userId],
		references: [users.id]
	}),
	providerPriorities: many(providerPriorities),
	providersServicePricings: many(providersServicePricing),
	providerPayments: many(providerPayments),
	documents: many(documents),
	transactions: many(transactions),
	tasks: many(tasks),
}));

export const notesRelations = relations(notes, ({one}) => ({
	patient: one(patients, {
		fields: [notes.patientId],
		references: [patients.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	providers: many(providers),
	admins: many(admins),
	providerPriorities: many(providerPriorities),
	providerMedicalLicenses: many(providerMedicalLicense),
	providerBusinessHours: many(providerBusinessHours),
	sessions: many(sessions),
}));

export const adminsRelations = relations(admins, ({one}) => ({
	user: one(users, {
		fields: [admins.userId],
		references: [users.id]
	}),
}));

export const customersRelations = relations(customers, ({one}) => ({
	patient: one(patients, {
		fields: [customers.patientId],
		references: [patients.id]
	}),
}));

export const workflowExecutionLogsRelations = relations(workflowExecutionLogs, ({one}) => ({
	workflowConfig: one(workflowConfigs, {
		fields: [workflowExecutionLogs.workflowConfigId],
		references: [workflowConfigs.id]
	}),
}));

export const workflowConfigsRelations = relations(workflowConfigs, ({many}) => ({
	workflowExecutionLogs: many(workflowExecutionLogs),
}));

export const adminTreatmentItemsRelations = relations(adminTreatmentItems, ({one}) => ({
	product: one(products, {
		fields: [adminTreatmentItems.productId],
		references: [products.id]
	}),
	supplier: one(suppliers, {
		fields: [adminTreatmentItems.supplierId],
		references: [suppliers.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	adminTreatmentItems: many(adminTreatmentItems),
}));

export const suppliersRelations = relations(suppliers, ({many}) => ({
	adminTreatmentItems: many(adminTreatmentItems),
	medications: many(medications),
	tasks: many(tasks),
}));

export const providerPrioritiesRelations = relations(providerPriorities, ({one}) => ({
	user: one(users, {
		fields: [providerPriorities.createdBy],
		references: [users.id]
	}),
	provider: one(providers, {
		fields: [providerPriorities.providerId],
		references: [providers.id]
	}),
}));

export const providersServicePricingRelations = relations(providersServicePricing, ({one}) => ({
	provider: one(providers, {
		fields: [providersServicePricing.providerId],
		references: [providers.id]
	}),
}));

export const providerMedicalLicenseRelations = relations(providerMedicalLicense, ({one}) => ({
	user: one(users, {
		fields: [providerMedicalLicense.providerId],
		references: [users.id]
	}),
}));

export const providerBusinessHoursRelations = relations(providerBusinessHours, ({one}) => ({
	user: one(users, {
		fields: [providerBusinessHours.providerId],
		references: [users.id]
	}),
}));

export const providerPaymentsRelations = relations(providerPayments, ({one}) => ({
	provider: one(providers, {
		fields: [providerPayments.providerId],
		references: [providers.id]
	}),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	patient: one(patients, {
		fields: [documents.patientId],
		references: [patients.id]
	}),
	provider: one(providers, {
		fields: [documents.providerId],
		references: [providers.id]
	}),
}));

export const medicationsRelations = relations(medications, ({one}) => ({
	supplier: one(suppliers, {
		fields: [medications.supplierId],
		references: [suppliers.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	patient: one(patients, {
		fields: [transactions.patientId],
		references: [patients.id]
	}),
	provider: one(providers, {
		fields: [transactions.providerId],
		references: [providers.id]
	}),
	task: one(tasks, {
		fields: [transactions.taskId],
		references: [tasks.id]
	}),
}));

export const patientIntakeFormsRelations = relations(patientIntakeForms, ({one}) => ({
	intakeFormConfig: one(intakeFormConfig, {
		fields: [patientIntakeForms.formConfigId],
		references: [intakeFormConfig.id]
	}),
	patient: one(patients, {
		fields: [patientIntakeForms.patientId],
		references: [patients.id]
	}),
}));

export const intakeFormConfigRelations = relations(intakeFormConfig, ({many}) => ({
	patientIntakeForms: many(patientIntakeForms),
}));

export const notificationTimingRelations = relations(notificationTiming, ({one}) => ({
	notificationSetting: one(notificationSettings, {
		fields: [notificationTiming.settingId],
		references: [notificationSettings.id]
	}),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({many}) => ({
	notificationTimings: many(notificationTiming),
	taskNotifications: many(taskNotifications),
	tasks: many(tasks),
}));

export const taskNotificationsRelations = relations(taskNotifications, ({one}) => ({
	notificationSetting: one(notificationSettings, {
		fields: [taskNotifications.settingId],
		references: [notificationSettings.id]
	}),
}));

export const retellJobsRelations = relations(retellJobs, ({one}) => ({
	patient: one(patients, {
		fields: [retellJobs.patientId],
		references: [patients.id]
	}),
}));