# Migrate Mate - Subscription Cancellation Flow Challenge

## Overview

Convert an existing Figma design into a fully-functional subscription-cancellation flow for Migrate Mate. This challenge tests your ability to implement pixel-perfect UI, handle complex business logic, and maintain security best practices.
# Cancellation Flow & User Profile Page

This is a complete React application that implements a user profile page and a detailed, multi-step subscription cancellation flow. The cancellation flow is designed to capture user feedback and includes A/B test logic to present a downsell offer to a specific segment of users.

-----

## 🚀 Features

  * **User Profile Page**: Displays basic user and subscription information (email, subscription status, next payment date).
  * **Multi-Step Cancellation Flow**: A modal-based stepper that guides the user through the cancellation process.
      * **Step 1**: Confirmation
      * **Step 2**: Reason for cancellation
      * **Step 3**: Conditional follow-up questions based on the selected reason (e.g., job search success, pricing feedback, technical issues).
      * **Step 4**: A/B tested downsell offer (e.g., "pause your subscription").
      * **Step 5**: Final confirmation and thank you message.
  * **A/B Test Logic**: Randomly assigns users to a variant (A or B) and adjusts the cancellation flow accordingly. Variant B users are presented with a downsell offer after selecting a specific cancellation reason ("I haven't found a job yet").
  * **State Management**: Uses React's `useState` hook to manage the UI state, including the active step, selected reasons, and form data.
  * **UI Components**: Includes a simple, reusable `Button` component with different styling variants.
  * **Mock Data**: Uses mock data for user and subscription information, making it easy to run and test the UI without a backend connection.

-----

## 🛠️ Technology Stack

  * **React**: The primary JavaScript library for building the user interface.
  * **Tailwind CSS**: (Implied by the class names in the code) A utility-first CSS framework for styling the components.

-----

## 📦 How to Run Locally

Since this is a single-file React component, you can integrate it into an existing React project.

1.  **Clone the repository** (if applicable) or **copy the file** into your React project's `src` folder.

2.  **Ensure you have the necessary dependencies**. If you are using a new project, you may need to install React. The styling is based on Tailwind CSS, so you will need to have it set up in your project to see the intended design.

3.  **Run your development server**:

    ```bash
    npm start
    # or
    yarn start
    ```

4.  **View the app**: Open your browser and navigate to `http://localhost:3000` (or the port specified by your development server). The application will display the user profile page, and you can click the "Cancel Migrate Mate" button to initiate the cancellation flow.

-----

## 🧩 Code Structure

  * **`Button` Component**: A basic, reusable component for styled buttons.
  * **`mockUser` & `mockSubscriptionData`**: Objects containing hardcoded data for demonstration purposes. In a production environment, this data would be fetched from an API or a database like **Supabase**.
  * **`App` Component**: The main component that orchestrates the entire application. It manages all state and conditionally renders the different sections of the UI.
  * **`handleStartCancelFlow`**: Initializes the cancellation flow and assigns the A/B test variant.
  * **`handleCloseCancelFlow`**: Resets the state to close the modal and prepare for a new session.
  * **`handleFinalizeCancellation`**: A mock function that logs the final cancellation data. This is where an API call to a backend (like a **Supabase** table) would be made to persist the data.
  * **`renderStepX` Functions**: Helper functions to render the UI for each step of the cancellation modal.
  * **`renderFlowStep`**: A switch statement that determines which step to display inside the modal.

-----

## 📝 A Note on Production Use

This component is a great starting point, but it's important to consider a few things before using it in a production application:

  * **Backend Integration**: The `handleFinalizeCancellation` function is currently a mock. You must implement the logic to securely send the `cancellationData` to your backend or a service like **Supabase**.
  * **A/B Test Persistence**: The A/B test variant (`abVariant`) is currently assigned randomly on each new session. To ensure a consistent user experience, the variant should be stored in your user's database record (or local storage) after the initial assignment.
  * **Error Handling**: Add robust error handling for API calls to gracefully manage network issues or server errors.
  * **Authentication**: The current app uses a mock user. You will need to integrate it with your actual authentication system to ensure the correct user is logged in and their data is displayed.
## Objective

Implement the Figma-designed cancellation journey exactly on mobile + desktop, persist outcomes securely, and instrument the A/B downsell logic.

## What's Provided

This repository contains:
- ✅ Next.js + TypeScript + Tailwind scaffold
- ✅ `seed.sql` with users table (25/29 USD plans) and empty cancellations table
- ✅ Local Supabase configuration for development
- ✅ Basic Supabase client setup in `src/lib/supabase.ts`

## Tech Stack (Preferred)

- **Next.js** with App Router
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Supabase** (Postgres + Row-Level Security)

> **Alternative stacks allowed** if your solution:
> 1. Runs with `npm install && npm run dev`
> 2. Persists to a Postgres-compatible database
> 3. Enforces table-level security

