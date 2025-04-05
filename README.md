# Medication Reminder System

## Introduction

The Medication Reminder System is a service designed to automatically remind users about their medication by placing outbound calls and recording their responses. It leverages Twilio for voice calls and SMS, MongoDB for storing call data, and integrates with a backend Express server to handle voice requests, transcription, and status updates.

The system performs the following functions:

1.  Initiates outbound calls to the user.
2.  Records their response regarding whether they have taken their medication,and transcribes and stores the response.
3.  Sends an SMS if the call was missed or failed.
4.  Analyzes responses to determine whether the user has taken their medication.
5.  Stores and manages all responses in a MongoDB database.

## Features

- **Outbound Call Initiation**: Initiates outbound calls to the phone number provided.
- **Call Recording**: Records the user's voice for transcription purposes.
- **SMS Notification**: Sends SMS to users who missed a call or whose call was unsuccessful.
- **Database Integration**: All responses and call data are stored in MongoDB for analysis.
- **Call Analysis**: Analyze responses to identify if the medication was taken.
- **Voice Handling**: Twilio is used for managing voice calls and handling their statuses.

## Setup Instructions

To run the system locally, follow the steps below:

### Prerequisites

- Node.js installed on your machine.
- MongoDB instance (local or cloud).
- A Twilio account (to handle voice calls and SMS).
- Postman or any similar API client to test API endpoints.

### Step 1: Clone the Repository

```bash
git clone https://github.com/azwdevops/medication-reminder.git
cd medication-reminder

```

### Step 2: Install Dependencies

Run the following command to install required dependencies:

```bash
npm install

```

### Step 3: Configure Environment Variables

Create a `.env` file at the root of the project. This file will store all your sensitive credentials and configurations. Add the following entries to the `.env` file:

```bash
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
SERVER_URL=http://localhost:5000 # Replace with your server URL
MONGODB_URI=your_mongodb_uri # Connection string for MongoDB (production)
TESTS_MONGODB_URI=your_test_mongodb_uri # MongoDB URI for tests
NODE_ENV=development # Set to 'production' for live environment

```

### Step 4: Set Up Twilio for Incoming Call Handling

To handle incoming calls, you need to configure Twilio to route the call to the appropriate endpoint (`/incoming`). Follow these steps:

1.  Log in to your Twilio account.
2.  Navigate to the **Phone Numbers** section and select your Twilio phone number.
3.  Under the **Voice & Fax** section, set the **A Call Comes In** webhook to the following URL (ensure your server is running locally via tunnel or in a live domain):

    ```
    http://your-server-url/api/incoming-call

    ```

### Step 5: Run the Application

Start the server by running the following command:

```bash
npm run dev

```

The server will start on port `5000` (or another port specified in `.env`).

### Step 6: Test the Endpoints

You can test the following endpoints using Postman or any API testing tool (Before testing ensure you have a url that is accessible on the web, if local, you can use ngrok to tunnel your application).

#### 1. **POST /api/call**

- **Description**: Initiates an outbound call to a provided phone number.
- **Request Body**:

  ```json
  {
    "phoneNumber": "+1234567890"
  }
  ```

- **Success Response**:

  ```json
  {
    "message": "Call initiated",
    "callSid": "call-sid-from-twilio"
  }
  ```

#### 2. **POST /api/call-status**

- **Description**: Updates the system with the status of a completed call. If the call fails, an SMS is sent to the user. This is the callback url used by twilio to notify your system of the outcome of the call. The outcome will be logged in your running server as a console indicating if the call succeeded

#### 3. **POST /api/transcription**

- **Description**: Saves the transcription of a call. It is the callback used by twilio to record the transcribed response of a patient. This will log the response in the console, and also save the response in the database.
- **Sample data**
- ```json
  {
    "phoneNumber": "sample-number",
    "callSid": "call-sid-from-twilio",
    "transcription": "yes i have taken my medication",
    "recordingUrl": "recording-url-from-twilio"
  }
  ```

#### 4. **POST /incoming-call**

- **Description**: Twilio uses this endpoint to handle incoming calls. It will return a play the recorded message to the patient reminding them to take their medication, then log the successful message in console and hand up the phone.

### Authentication

For demonstration purposes, I have omitted the authentication. In a live system, authentication can be added to ensure that only authorized users can initiate calls, view responses, and interact with the system. I just did the sample to demo how this would work

## Additional Notes

- **Twilio Configuration**: Make sure to set up your Twilio account and configure the phone number for incoming call handling, as mentioned above.
- **MongoDB**: Make sure you have MongoDB running either locally or in the cloud. The connection URI should be configured in the `.env` file.
- **Environment**: The system is configured for development by default. Change `NODE_ENV` to `production` in the `.env` file for a live system.

## Conclusion

This system demonstrates how medication reminders can be automated using Twilio for voice calls and SMS, MongoDB for data storage, and a Node.js backend for handling API requests and responses. The core focus is on managing the call flow and user interactions efficiently.

Feel free to extend or modify this system to suit your production needs, such as adding authentication or scaling for more users.
