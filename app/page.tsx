"use client"

import ClinicForm from "@/components/ClinicForm";

export default function Home() {
  return (
    <main className="flex flex-col h-full items-center justify-between p-6">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Clinic Call Assistant
        </h1>
        <p className="text-center mb-8 text-gray-600">
          Fill in the form below to have our voice assistant call a clinic and gather information for you.
        </p>
        <ClinicForm />
      </div>
    </main>
  );
}
