import { relations } from "drizzle-orm/relations";
import { patients, documents, providers, users, admins, notes, workflowConfigs, workflowExecutionLogs, customers, providerBusinessHours, patientTreatmentPlans, providerMedicalLicense, sessions, providersServicePricing, providerPayments, providerPriorities, retellJobs, tasks, transactions, notificationSettings, notificationTiming, taskNotifications, categories, patientPlans, plans, patientIntakeForms, intakeFormConfig, suppliers, medications, retellAiCallLogs, intakeFormTemplates, products, adminTreatmentItems, prescriptions } from "./schema";

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

export const patientsRelations = relations(patients, ({many}) => ({
	documents: many(documents),
	notes: many(notes),
	customers: many(customers),
	patientTreatmentPlans: many(patientTreatmentPlans),
	retellJobs: many(retellJobs),
	transactions: many(transactions),
	patientPlans: many(patientPlans),
	patientIntakeForms: many(patientIntakeForms),
	tasks: many(tasks),
	retellAiCallLogs: many(retellAiCallLogs),
}));

export const providersRelations = relations(providers, ({one, many}) => ({
	documents: many(documents),
	patientTreatmentPlans: many(patientTreatmentPlans),
	user: one(users, {
		fields: [providers.userId],
		references: [users.id]
	}),
	providersServicePricings: many(providersServicePricing),
	providerPayments: many(providerPayments),
	providerPriorities: many(providerPriorities),
	transactions: many(transactions),
	tasks: many(tasks),
}));

export const adminsRelations = relations(admins, ({one}) => ({
	user: one(users, {
		fields: [admins.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	admins: many(admins),
	providerBusinessHours: many(providerBusinessHours),
	providerMedicalLicenses: many(providerMedicalLicense),
	providers: many(providers),
	sessions: many(sessions),
	providerPriorities: many(providerPriorities),
	intakeFormTemplates_createdBy: many(intakeFormTemplates, {
		relationName: "intakeFormTemplates_createdBy_users_id"
	}),
	intakeFormTemplates_updatedBy: many(intakeFormTemplates, {
		relationName: "intakeFormTemplates_updatedBy_users_id"
	}),
}));

export const notesRelations = relations(notes, ({one}) => ({
	patient: one(patients, {
		fields: [notes.patientId],
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

export const customersRelations = relations(customers, ({one}) => ({
	patient: one(patients, {
		fields: [customers.patientId],
		references: [patients.id]
	}),
}));

export const providerBusinessHoursRelations = relations(providerBusinessHours, ({one}) => ({
	user: one(users, {
		fields: [providerBusinessHours.providerId],
		references: [users.id]
	}),
}));

export const patientTreatmentPlansRelations = relations(patientTreatmentPlans, ({one}) => ({
	provider: one(providers, {
		fields: [patientTreatmentPlans.providerId],
		references: [providers.id]
	}),
	patient: one(patients, {
		fields: [patientTreatmentPlans.patientId],
		references: [patients.id]
	}),
}));

export const providerMedicalLicenseRelations = relations(providerMedicalLicense, ({one}) => ({
	user: one(users, {
		fields: [providerMedicalLicense.providerId],
		references: [users.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const providersServicePricingRelations = relations(providersServicePricing, ({one}) => ({
	provider: one(providers, {
		fields: [providersServicePricing.providerId],
		references: [providers.id]
	}),
}));

export const providerPaymentsRelations = relations(providerPayments, ({one}) => ({
	provider: one(providers, {
		fields: [providerPayments.providerId],
		references: [providers.id]
	}),
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

export const retellJobsRelations = relations(retellJobs, ({one}) => ({
	patient: one(patients, {
		fields: [retellJobs.patientId],
		references: [patients.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	task: one(tasks, {
		fields: [transactions.taskId],
		references: [tasks.id]
	}),
	patient: one(patients, {
		fields: [transactions.patientId],
		references: [patients.id]
	}),
	provider: one(providers, {
		fields: [transactions.providerId],
		references: [providers.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	transactions: many(transactions),
	provider: one(providers, {
		fields: [tasks.providerId],
		references: [providers.id]
	}),
	patient: one(patients, {
		fields: [tasks.patientId],
		references: [patients.id]
	}),
	supplier: one(suppliers, {
		fields: [tasks.supplierId],
		references: [suppliers.id]
	}),
	notificationSetting: one(notificationSettings, {
		fields: [tasks.notificationSettingId],
		references: [notificationSettings.id]
	}),
	category: one(categories, {
		fields: [tasks.categoryId],
		references: [categories.id]
	}),
	plan: one(plans, {
		fields: [tasks.planId],
		references: [plans.id]
	}),
	patientPlan: one(patientPlans, {
		fields: [tasks.patientPlanId],
		references: [patientPlans.id]
	}),
	medication: one(medications, {
		fields: [tasks.currentMedicationId],
		references: [medications.id]
	}),
	retellAiCallLogs: many(retellAiCallLogs),
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

export const patientPlansRelations = relations(patientPlans, ({one, many}) => ({
	category: one(categories, {
		fields: [patientPlans.categoryId],
		references: [categories.id]
	}),
	patient: one(patients, {
		fields: [patientPlans.patientId],
		references: [patients.id]
	}),
	plan: one(plans, {
		fields: [patientPlans.planId],
		references: [plans.id]
	}),
	tasks: many(tasks),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	patientPlans: many(patientPlans),
	tasks: many(tasks),
	intakeFormTemplates: many(intakeFormTemplates),
	plans: many(plans),
}));

export const plansRelations = relations(plans, ({one, many}) => ({
	patientPlans: many(patientPlans),
	tasks: many(tasks),
	medications: many(medications, {
		relationName: "medications_planId_plans_id"
	}),
	category: one(categories, {
		fields: [plans.categoryId],
		references: [categories.id]
	}),
	medication: one(medications, {
		fields: [plans.medicationId],
		references: [medications.id],
		relationName: "plans_medicationId_medications_id"
	}),
	prescriptions: many(prescriptions),
}));

export const patientIntakeFormsRelations = relations(patientIntakeForms, ({one}) => ({
	patient: one(patients, {
		fields: [patientIntakeForms.patientId],
		references: [patients.id]
	}),
	intakeFormConfig: one(intakeFormConfig, {
		fields: [patientIntakeForms.formConfigId],
		references: [intakeFormConfig.id]
	}),
}));

export const intakeFormConfigRelations = relations(intakeFormConfig, ({many}) => ({
	patientIntakeForms: many(patientIntakeForms),
}));

export const suppliersRelations = relations(suppliers, ({many}) => ({
	tasks: many(tasks),
	medications: many(medications),
	adminTreatmentItems: many(adminTreatmentItems),
}));

export const medicationsRelations = relations(medications, ({one, many}) => ({
	tasks: many(tasks),
	supplier: one(suppliers, {
		fields: [medications.supplierId],
		references: [suppliers.id]
	}),
	plan: one(plans, {
		fields: [medications.planId],
		references: [plans.id],
		relationName: "medications_planId_plans_id"
	}),
	plans: many(plans, {
		relationName: "plans_medicationId_medications_id"
	}),
	prescriptions_medicationId: many(prescriptions, {
		relationName: "prescriptions_medicationId_medications_id"
	}),
	prescriptions_refillMedicationId: many(prescriptions, {
		relationName: "prescriptions_refillMedicationId_medications_id"
	}),
}));

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

export const intakeFormTemplatesRelations = relations(intakeFormTemplates, ({one}) => ({
	category: one(categories, {
		fields: [intakeFormTemplates.categoryId],
		references: [categories.id]
	}),
	user_createdBy: one(users, {
		fields: [intakeFormTemplates.createdBy],
		references: [users.id],
		relationName: "intakeFormTemplates_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [intakeFormTemplates.updatedBy],
		references: [users.id],
		relationName: "intakeFormTemplates_updatedBy_users_id"
	}),
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

export const prescriptionsRelations = relations(prescriptions, ({one}) => ({
	medication_medicationId: one(medications, {
		fields: [prescriptions.medicationId],
		references: [medications.id],
		relationName: "prescriptions_medicationId_medications_id"
	}),
	plan: one(plans, {
		fields: [prescriptions.planId],
		references: [plans.id]
	}),
	medication_refillMedicationId: one(medications, {
		fields: [prescriptions.refillMedicationId],
		references: [medications.id],
		relationName: "prescriptions_refillMedicationId_medications_id"
	}),
}));