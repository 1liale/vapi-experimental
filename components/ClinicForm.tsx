"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { makeOutboundCall, getCallAnalysis } from "@/hooks/use-vapi";

export default function ClinicForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [procedures, setProcedures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!phoneNumber || !clinicName || !doctorName || !speciality || procedures.length === 0) {
      alert("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    setCallId(null);
    setAnalysisResults(null);
    
    try {
      // Use the standalone makeOutboundCall function
      const result = await makeOutboundCall({
        phoneNumber,
        phoneNumberId: process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID || "",
        variables: {
          clinicName,
          doctorName,
          speciality,
          procedures: procedures.join(", ")
        }
      });
      
      if (result && result.id) {
        console.log("Call initiated successfully:", result);
        setCallId(result.id);
      } else {
        console.error("Failed to initiate call");
        alert("Failed to initiate call. Please check console for details.");
      }
    } catch (error) {
      console.error("Error making call:", error);
      alert("Error making call");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle call analysis
  const handleAnalyzeCall = async () => {
    if (!callId) {
      alert("No call to analyze. Please make a call first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResults(null);

    try {
      // Use the standalone getCallAnalysis function
      const results = await getCallAnalysis({
        callId
      });

      setAnalysisResults(results);
      console.log("Call analysis results:", results);
    } catch (error) {
      console.error("Error analyzing call:", error);
      alert("Error analyzing call. The call might not be completed yet or there was a problem retrieving data.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to add a procedure
  const addProcedure = (e: FormEvent) => {
    e.preventDefault();
    const procedureInput = document.getElementById("procedure") as HTMLInputElement;
    if (procedureInput && procedureInput.value) {
      setProcedures([...procedures, procedureInput.value]);
      procedureInput.value = "";
    }
  };

  // Function to remove a procedure
  const removeProcedure = (procedureToRemove: string) => {
    setProcedures(procedures.filter(procedure => procedure !== procedureToRemove));
  };

  // The rest of the component remains the same...
  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Schedule a Call</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form inputs remain the same */}
        <div>
          <Label htmlFor="phoneNumber">Patient Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="+1xxxxxxxxxx"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="clinicName">Clinic Name</Label>
          <Input
            id="clinicName"
            placeholder="Sunshine Medical Clinic"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="doctorName">Doctor Name</Label>
          <Input
            id="doctorName"
            placeholder="Dr. Smith"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="speciality">Speciality</Label>
          <Select
            value={speciality}
            onValueChange={setSpeciality}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select speciality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="dermatology">Dermatology</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
              <SelectItem value="psychiatry">Psychiatry</SelectItem>
              <SelectItem value="general">General Practice</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="procedure">Procedures</Label>
          <div className="flex space-x-2">
            <Input
              id="procedure"
              placeholder="Add procedure"
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={addProcedure}
              className="whitespace-nowrap"
              disabled={isLoading}
            >
              Add
            </Button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {procedures.map((procedure) => (
              <div key={procedure} className="bg-slate-100 px-2 py-1 rounded-md text-sm flex items-center">
                {procedure}
                {!isLoading && (
                  <button
                    type="button"
                    className="ml-1 text-red-500"
                    onClick={() => removeProcedure(procedure)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="w-full p-3 text-center bg-yellow-100 rounded">
            Initiating call... Please wait
          </div>
        ) : (
          <Button 
            type="submit" 
            className="w-full"
          >
            Start Voice Assistant Call
          </Button>
        )}
      </form>

      {callId && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Call Status</h3>
          <p className="text-sm text-gray-600 mb-3">Call ID: {callId}</p>
          
          {isAnalyzing ? (
            <div className="w-full p-3 text-center bg-blue-100 rounded">
              Analyzing call... Please wait
            </div>
          ) : (
            <Button
              type="button"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleAnalyzeCall}
            >
              Analyze Call
            </Button>
          )}
        </div>
      )}

      {analysisResults && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Call Analysis</h3>
          
          <div className="bg-gray-50 p-3 rounded text-sm">
            <div className="mb-2">
              <span className="font-medium">Call Duration:</span> {analysisResults.duration ? `${Math.round(analysisResults.duration)}s` : 'N/A'}
            </div>
            
            <div className="mb-2">
              <span className="font-medium">Appointment Confirmed:</span> {analysisResults.appointmentConfirmed ? 'Yes' : 'No'}
            </div>
            
            {analysisResults.mainTopics && analysisResults.mainTopics.length > 0 && (
              <div className="mb-2">
                <span className="font-medium">Main Topics:</span>
                <ul className="list-disc pl-5 mt-1">
                  {analysisResults.mainTopics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysisResults.customerQuestions && analysisResults.customerQuestions.length > 0 && (
              <div className="mb-2">
                <span className="font-medium">Customer Questions:</span>
                <ul className="list-disc pl-5 mt-1">
                  {analysisResults.customerQuestions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysisResults.customerPreferences && analysisResults.customerPreferences.length > 0 && (
              <div className="mb-2">
                <span className="font-medium">Customer Preferences:</span>
                <ul className="list-disc pl-5 mt-1">
                  {analysisResults.customerPreferences.map((pref, index) => (
                    <li key={index}>{pref}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysisResults.actionItems && analysisResults.actionItems.length > 0 && (
              <div className="mb-2">
                <span className="font-medium">Action Items:</span>
                <ul className="list-disc pl-5 mt-1">
                  {analysisResults.actionItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysisResults.overallSentiment && (
              <div>
                <span className="font-medium">Overall Sentiment:</span> {analysisResults.overallSentiment}
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setAnalysisResults(null)}
            >
              Hide Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}