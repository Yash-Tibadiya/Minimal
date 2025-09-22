import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-full mt-12 lg:w-1/2 lg:mt-0">
        <Image
          className="w-full max-w-lg lg:mx-auto"
          src="assets/404.svg"
          alt=""
          width={500}
          height={500}
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        <h2 className="text-2xl font-semibold text-gray-600">Page Not Found</h2>
        <p className="text-gray-500">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-green-750 text-white rounded-lg hover:bg-green-850 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
