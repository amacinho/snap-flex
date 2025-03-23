# Snap-Flex

A knee flexion angle measurement application that uses TensorFlow.js and MoveNet for pose detection.

## Features

- Real-time knee angle measurement
- Support for both left and right knee tracking
- Mobile-friendly interface
- Works on both desktop and mobile browsers

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenSSL (for generating SSL certificates)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

#### Standard Development Server

```
npm run dev
```

This will start the development server on http://localhost:5173 (or another port if 5173 is in use).

#### HTTPS Development Server (Recommended for Mobile Testing)

For mobile browser testing, especially for camera access, you need to run the server with HTTPS:

1. Generate self-signed SSL certificates:
   ```
   npm run generate-certs
   ```

2. Start the development server with HTTPS:
   ```
   npm run dev:https
   ```

3. Access the application at https://localhost:5173 (or another port if 5173 is in use)

**Note:** Since the certificates are self-signed, you will see a security warning in your browser. You need to:
- Click "Advanced" and then "Proceed to localhost (unsafe)" in Chrome
- Click "Accept the Risk and Continue" in Firefox

For mobile testing, you may need to:
1. Make sure your mobile device is on the same network as your development machine
2. Access the application using your computer's local IP address (e.g., https://192.168.1.100:5173)
3. Accept the security warning for the self-signed certificate

### Building for Production

```
npm run build
```

This will create a production-ready build in the `dist` directory.

## Usage

1. Click the "Start Camera" button to begin
2. Position yourself so that your knee is visible in the camera
3. The application will detect your pose and calculate the knee angle
4. Use the knee selection controls to choose which knee to track (left, right, or auto)

## Troubleshooting

### Camera Access Issues

- Make sure you're using a secure context (HTTPS) for camera access, especially on mobile browsers
- Grant camera permissions when prompted
- Ensure no other application is using the camera
- If using an external camera, make sure it's properly connected

### Performance Issues

- The application uses TensorFlow.js which can be resource-intensive
- For better performance, use a device with a powerful CPU/GPU
- Close other resource-intensive applications
