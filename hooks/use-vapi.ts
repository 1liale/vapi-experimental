// Environment variables
const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";
const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY || "";

/**
 * Make an outbound call using the Vapi REST API
 * @param {Object} options - Call parameters
 * @returns {Promise} - Result of the call
 */
export const makeOutboundCall = async (options) => {
  try {
    // Construct the API request body
    const requestBody = {
      assistantId,
      phoneNumberId: options.phoneNumberId,
      customer: {
        number: options.phoneNumber
      },
      assistantOverrides: {
        variableValues: options.variables || {},
      },
    };

    // Add scheduling if specified
    if (options.scheduledTime) {
      requestBody.schedulePlan = {
        earliestAt: options.scheduledTime
      };
    }

    // Make API call to Vapi's /call endpoint
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to make outbound call: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error making outbound call:", err);
    return false;
  }
};

/**
 * Get call analysis data from a completed call
 * @param {Object} options - Options with callId
 * @returns {Promise} - Analysis result
 */
export const getCallAnalysis = async (options) => {
  try {
    if (!options.callId) {
      throw new Error("Call ID is required for analysis");
    }

    // Retrieve the call details which should include structured data
    const callDetailsResponse = await fetch(`https://api.vapi.ai/call/${options.callId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!callDetailsResponse.ok) {
      const errorData = await callDetailsResponse.json();
      throw new Error(`Failed to get call details: ${errorData.message || callDetailsResponse.statusText}`);
    }

    const callDetails = await callDetailsResponse.json();
    console.log("callDetails", callDetails);
    
    // Check if call is completed
    if (callDetails.status !== 'completed') {
      throw new Error(`Call analysis not available: call status is ${callDetails.status}`);
    }

    // Extract structured data from call details
    const structuredData = callDetails.structuredData || {};
    
    // Create a simplified analysis result
    const analysisResult = {
      callId: callDetails.id,
      timestamp: callDetails.startedAt ? new Date(callDetails.startedAt).toISOString() : null,
      duration: callDetails.startedAt && callDetails.endedAt ? 
        (new Date(callDetails.endedAt).getTime() - new Date(callDetails.startedAt).getTime()) / 1000 : null,
      status: callDetails.status,
      customerPhone: callDetails.destination?.number || null,
      
      // Use structured data from the call directly
      mainTopics: structuredData.mainTopics || [],
      customerPreferences: structuredData.customerPreferences || [],
      customerQuestions: structuredData.customerQuestions || [],
      actionItems: structuredData.actionItems || [],
      overallSentiment: structuredData.overallSentiment || null,
      appointmentConfirmed: structuredData.appointmentConfirmed || false,
      
      // Add transcript if available
      transcript: callDetails.messages ? callDetails.messages.map((msg) => ({
        role: msg.role,
        content: msg.message,
        time: msg.secondsFromStart
      })) : []
    };
    
    return analysisResult;
  } catch (err) {
    console.error("Error getting call analysis:", err);
    throw err;
  }
};
