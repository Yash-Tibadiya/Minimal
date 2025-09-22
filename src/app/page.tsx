import { getSession } from "@/auth";
import { getPatientByEmail } from "@/model/patients";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex items-center w-full min-h-screen justify-items-center">
        hello
      </div>
    );
  }

  const patient = await getPatientByEmail(session.user.email);

  if (!patient) {
    return (
      <div className="flex items-center w-full min-h-screen justify-items-center">
        Patient not found
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen justify-center p-8">
      <h1 className="text-2xl font-bold mb-4">Patient Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <p><strong>ID:</strong> {patient.id}</p>
        <p><strong>Code:</strong> {patient.code || 'N/A'}</p>
        <p><strong>First Name:</strong> {patient.firstName}</p>
        <p><strong>Last Name:</strong> {patient.lastName}</p>
        <p><strong>Full Name:</strong> {patient.fullName || 'N/A'}</p>
        <p><strong>Email:</strong> {patient.email}</p>
        <p><strong>Phone:</strong> {patient.phone}</p>
        <p><strong>State:</strong> {patient.state || 'N/A'}</p>
        <p><strong>Country:</strong> {patient.country || 'N/A'}</p>
        <p><strong>Address:</strong> {patient.address || 'N/A'}</p>
        <p><strong>Zip Code:</strong> {patient.zipCode || 'N/A'}</p>
        <p><strong>City:</strong> {patient.city || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> {patient.dob || 'N/A'}</p>
        <p><strong>Timezone:</strong> {patient.timezone || 'N/A'}</p>
        <p><strong>Brand Code:</strong> {patient.brandCode || 'N/A'}</p>
        <p><strong>Subscribed:</strong> {patient.isSubscribed ? 'Yes' : 'No'}</p>
        <p><strong>Created At:</strong> {patient.createdAt}</p>
        <p><strong>Updated At:</strong> {patient.updatedAt || 'N/A'}</p>
      </div>
    </div>
  );
}
