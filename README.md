# FinTech Application

A full-stack web application that provides financial data and analysis tools for publicly traded companies.

## Folder Structure

```
/home/kanishk/HDD/FinTech/
├───.gitignore
├───package-lock.json
├───package.json
├───README.md
├───.git/...
├───backend/
│   ├───app.py
│   ├───db.js
│   ├───package-lock.json
│   ├───package.json
│   ├───server.js
│   ├───syncCompanies.js
│   ├───node_modules/...
│   └───routes/
│       └───authRoutes.js
└───frontendxyz/
    ├───package-lock.json
    ├───package.json
    ├───postcss.config.js
    ├───README.md
    ├───tailwind.config.js
    ├───node_modules/...
    ├───public/
    │   ├───favicon.ico
    │   ├───index.html
    │   ├───logo192.png
    │   ├───logo512.png
    │   ├───manifest.json
    │   └───robots.txt
    └───src/
        ├───App.css
        ├───App.js
        ├───App.test.js
        ├───index.css
        ├───index.js
        ├───logo.svg
        ├───reportWebVitals.js
        ├───setupTests.js
        ├───assets/
        │   ├───apple.png
        │   ├───chart.png
        │   ├───facebook.png
        │   ├───logo.png
        │   ├───marketcap.png
        │   ├───price-history.png
        │   ├───ps-ratio.png
        │   └───revenue.png
        ├───components/
        │   ├───CFooter.jsx
        │   ├───ChatWidget.jsx
        │   ├───CHeader.jsx
        │   ├───CompaniesPage.jsx
        │   ├───CompanyFinancialRatios.jsx
        │   ├───Feedback.jsx
        │   ├───GoogleSignUp.jsx
        │   ├───Homepage.jsx
        │   ├───HowToUse.jsx
        │   ├───LandingPage.jsx
        │   ├───MarketCapTable.jsx
        │   ├───Modal.jsx
        │   ├───ProtectedRoute.jsx
        │   ├───SearchBar.jsx
        │   ├───SignInPage.jsx
        │   ├───SignUpPage.jsx
        │   └───UnlockAccess.jsx
        └───utils/
            └───authFetch.js
```

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/)
*   [npm](https://www.npmjs.com/)
*   [Python](https://www.python.org/)
*   A [Supabase](https://supabase.com/) account
*   A [Google Cloud Platform](https://cloud.google.com/) account
*   A [SendGrid](https://sendgrid.com/) account

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    ```

2.  **Install backend dependencies:**

    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**

    ```bash
    cd ../frontendxyz
    npm install
    ```

## Configuration

### Environment Variables

You'll need to create two `.env` files: one in the `backend` directory and one in the `frontendxyz` directory.

#### Backend (`backend/.env`)

```
DATABASE_URL="your_supabase_database_url"
JWT_SECRET="your_jwt_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
EMAIL_HOST="your_email_host"
EMAIL_PORT="your_email_port"
EMAIL_USER="your_email_user"
EMAIL_PASS="your_email_password"
EMAIL_FROM="your_verified_email_address"
```

*   `DATABASE_URL`: Your Supabase database connection string. You can find this in your Supabase project settings.
*   `JWT_SECRET`: A secret key for signing JWT tokens. You can generate a random string for this.
*   `GOOGLE_CLIENT_ID`: Your Google Cloud Platform client ID. See the [Google Cloud Platform Setup](#google-cloud-platform-setup) section for more details.
*   `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`: Your SendGrid credentials. See the [SendGrid Setup](#sendgrid-setup) section for more details.

#### Frontend (`frontendxyz/.env`)

```
REACT_APP_GOOGLE_CLIENT_ID="your_google_client_id"
```

*   `REACT_APP_GOOGLE_CLIENT_ID`: Your Google Cloud Platform client ID. This needs to be the same as the one in your backend `.env` file.

### Database Setup

1.  **Create a new project on Supabase.**
2.  **Create a new table named `users1`** with the following columns:
    *   `id` (int, primary key, auto-increment)
    *   `fullname` (varchar)
    *   `email` (varchar, unique)
    *   `phone` (varchar, unique)
    *   `password` (varchar)
    *   `otp` (varchar)
    *   `otp_expires_at` (timestamptz)
3.  **Run the following SQL query** to make the `password` and `phone` columns optional:

    ```sql
    ALTER TABLE users1
    ALTER COLUMN password DROP NOT NULL,
    ALTER COLUMN phone DROP NOT NULL;
    ```

### Google Cloud Platform Setup

1.  **Create a new project on the [Google Cloud Platform](https://console.cloud.google.com/).**
2.  **Go to "APIs & Services" > "Credentials".**
3.  **Click "Create Credentials" > "OAuth client ID".**
4.  **Select "Web application"** as the application type.
5.  **Add `http://localhost:3000`** to the "Authorized JavaScript origins".
6.  **Add `http://localhost:3000`** to the "Authorized redirect URIs".
7.  **Click "Create"** and copy the client ID.

### SendGrid Setup

1.  **Create a new account on [SendGrid](https://sendgrid.com/).**
2.  **Go to "Settings" > "API Keys".**
3.  **Click "Create API Key"** and give it a name.
4.  **Copy the API key** and use it for the `EMAIL_PASS` environment variable.
5.  **Go to "Settings" > "Sender Authentication".**
6.  **Create a new sender** and verify your email address. Use this email address for the `EMAIL_FROM` environment variable.

## Running the Application

1.  **Start the backend server:**

    ```bash
    cd backend
    npm start
    ```

2.  **Start the frontend server:**

    ```bash
    cd ../frontendxyz
    npm start
    ```

The application will be available at `http://localhost:3000`.

## Features

*   User authentication (sign up, sign in, sign out) with email/password and Google OAuth.
*   Password reset with OTP.
*   View company rankings by market capitalization.
*   View company financial ratios.
*   Search for companies by name or ticker symbol.
*   View detailed information about a company.
*   Provide feedback.

## Technologies Used

*   **Frontend:**
    *   React
    *   React Router
    *   Tailwind CSS
    *   `@react-oauth/google`
*   **Backend:**
    *   Node.js
    *   Express
    *   PostgreSQL (Supabase)
    *   `google-auth-library`
    *   `nodemailer`
    *   `jsonwebtoken`
    *   `bcrypt`